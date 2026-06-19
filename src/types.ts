/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DayData {
  id: string; // "YYYY-MM-DD"
  dateString: string; // e.g., "السبت، 20 يونيو 2026"
  status: 'none' | 'success' | 'failed';
  progress: number; // 0 to 100
  completedCount: number; // 0 to 5
  tasks: boolean[]; // [false, false, false, false, false]
  reasons: string; // "❌ لم يتم..."
  penalty: number; // 0 or 50
  finalCommitTimestamp: string | null; // ISO string
}

export type PlayerName = 'محمد' | 'خالد';

export interface PlayerData {
  days: {
    [dateKey: string]: DayData;
  };
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const DEFAULT_TASKS = [
  "كورس أبو هدهود (ساعتان)",
  "شهادة CC (فيديو واحد)",
  "كورس Red Team - حسام شادي (فيديو واحد)",
  "الإنجليزي (ساعة)",
  "Meeting مع الطرف الآخر"
];

export const CHALLENGE_START_DATE = "2026-06-20";
export const CHALLENGE_END_DATE = "2026-12-31";
