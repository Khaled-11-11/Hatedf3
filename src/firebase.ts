/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, getDoc, Firestore } from "firebase/firestore";
import { PlayerData, FirebaseConfig, PlayerName } from "./types";

// Key for local storage
const STORAGE_CONFIG_KEY = "firebase_challenge_config";
const LOCAL_PLAYER_PREFIX = "player_days_v1_";

// Try to load user configuration from local storage
export function getSavedFirebaseConfig(): FirebaseConfig | null {
  try {
    const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (saved) {
      const config = JSON.parse(saved);
      if (config.apiKey && config.projectId) {
        return config;
      }
    }
  } catch (e) {
    console.error("Failed to load Firebase config from localStorage", e);
  }
  return null;
}

export function saveFirebaseConfig(config: FirebaseConfig) {
  localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
}

export function clearFirebaseConfig() {
  localStorage.removeItem(STORAGE_CONFIG_KEY);
}

// Global Firebase state
let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export function initFirebase(config: FirebaseConfig): boolean {
  try {
    const existingApps = getApps();
    const existingApp = existingApps.find(a => a.name === "commitment_app");
    
    if (existingApp) {
      app = existingApp;
    } else {
      app = initializeApp(config, "commitment_app");
    }
    
    db = getFirestore(app);
    return true;
  } catch (error) {
    console.error("Firebase init failed: ", error);
    db = null;
    app = null;
    return false;
  }
}

// Check if we have active Firestore
export function isFirebaseConnected(): boolean {
  return db !== null;
}

// Live sync broadcast channel for local-only fallback (real-time cross-tab sync)
const localSyncChannel = typeof window !== 'undefined' ? new BroadcastChannel('commitment_local_sync') : null;

// Initialize with saved config if available
const initialConfig = getSavedFirebaseConfig();
if (initialConfig) {
  initFirebase(initialConfig);
}

// Local simulation fallback
export function getLocalPlayerData(player: PlayerName): PlayerData {
  try {
    const data = localStorage.getItem(`${LOCAL_PLAYER_PREFIX}${player}`);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error(e);
  }
  return { days: {} };
}

export function saveLocalPlayerData(player: PlayerName, data: PlayerData) {
  localStorage.setItem(`${LOCAL_PLAYER_PREFIX}${player}`, JSON.stringify(data));
  if (localSyncChannel) {
    localSyncChannel.postMessage({ type: 'UPDATE', player, data });
  }
}

// Core functions for data manipulation
export async function savePlayerData(player: PlayerName, data: PlayerData): Promise<void> {
  if (db) {
    try {
      const playerDocRef = doc(db, "players", player);
      await setDoc(playerDocRef, data);
      return;
    } catch (e) {
      console.error("Firestore save failed, writing to fallback local storage", e);
      saveLocalPlayerData(player, data);
      throw e;
    }
  } else {
    saveLocalPlayerData(player, data);
  }
}

// Set up real-time listener
export function listenToPlayerData(
  player: PlayerName,
  onUpdate: (data: PlayerData) => void,
  onError?: (err: Error) => void
): () => void {
  // If Firestore is active, configure live subscription
  if (db) {
    try {
      const playerDocRef = doc(db, "players", player);
      const unsubscribe = onSnapshot(
        playerDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as PlayerData;
            onUpdate(data);
          } else {
            // Document doesn't exist yet, seed with local patterns or empty
            const seed = getLocalPlayerData(player);
            onUpdate(seed);
          }
        },
        (error) => {
          console.error("Firestore listen error: ", error);
          if (onError) onError(error);
          // Fallback to local
          onUpdate(getLocalPlayerData(player));
        }
      );
      return unsubscribe;
    } catch (e) {
      console.error("Snapshot binding error, falling back to local listener", e);
    }
  }

  // Fallback local listener
  onUpdate(getLocalPlayerData(player));
  
  const handleMessage = (e: MessageEvent) => {
    if (e.data && e.data.type === 'UPDATE' && e.data.player === player) {
      onUpdate(e.data.data);
    }
  };

  if (localSyncChannel) {
    localSyncChannel.addEventListener('message', handleMessage);
  }

  // Return unsubscribe
  return () => {
    if (localSyncChannel) {
      localSyncChannel.removeEventListener('message', handleMessage);
    }
  };
}
