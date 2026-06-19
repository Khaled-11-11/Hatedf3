/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, Firestore } from "firebase/firestore";
import { PlayerData, PlayerName } from "./types";

const LOCAL_PLAYER_PREFIX = "player_days_v1_";

// Firebase config ثابتة — لا تعديل مطلوب من المستخدم
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBJhgSDyCaZztJu0nU5hmkHai5LKf61qLk",
  authDomain: "hatedf3-19155.firebaseapp.com",
  projectId: "hatedf3-19155",
  storageBucket: "hatedf3-19155.appspot.com",
  messagingSenderId: "1015805743453",
  appId: "1:1015805743453:web:bed3c47dc9bea2786158b4"
};

// تهيئة Firebase تلقائياً عند تحميل الملف
let db: Firestore | null = null;
try {
  const existingApps = getApps();
  const existingApp = existingApps.find(a => a.name === "commitment_app");
  const app = existingApp ?? initializeApp(FIREBASE_CONFIG, "commitment_app");
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase auto-initialization failed:", error);
}

// Check if we have active Firestore
let isDbOnlineSecured = false;
let dbErrorString: string | null = null;
const statusListeners = new Set<(online: boolean, err: string | null) => void>();

export function registerDbStatusListener(listener: (online: boolean, err: string | null) => void) {
  statusListeners.add(listener);
  listener(isDbOnlineSecured, dbErrorString);
  return () => {
    statusListeners.delete(listener);
  };
}

function updateDbStatus(online: boolean, err: string | null) {
  isDbOnlineSecured = online;
  dbErrorString = err;
  statusListeners.forEach(l => l(online, err));
}

export function isFirebaseConnected(): boolean {
  return db !== null && isDbOnlineSecured;
}

// Live sync broadcast channel for local-only fallback (real-time cross-tab sync)
const localSyncChannel = typeof window !== 'undefined' ? new BroadcastChannel('commitment_local_sync') : null;

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
      updateDbStatus(true, null);
      return;
    } catch (e: any) {
      console.error("Firestore save failed, writing to fallback local storage", e);
      updateDbStatus(false, e?.message || "فشلت عملية حفظ البيانات في Firestore");
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
          updateDbStatus(true, null);
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
          updateDbStatus(false, error?.message || "فشلت عملية القراءة المباشرة من Firestore. الرجاء التحقق من القواعد (Rules).");
          if (onError) onError(error);
          // Fallback to local
          onUpdate(getLocalPlayerData(player));
        }
      );
      return unsubscribe;
    } catch (e: any) {
      console.error("Snapshot binding error, falling back to local listener", e);
      updateDbStatus(false, e?.message || "خطأ في ربط مستمع البيانات");
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
