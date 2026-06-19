/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerData, DayData, DEFAULT_TASKS, CHALLENGE_START_DATE } from "../types";
import { getArabicDateString, generateChallengeDaysList } from "./dateUtils";

// Reconciles player data by automatically marking uncommitted past days as failed with 50 EGP penalty
export function reconcilePlayerDays(playerData: PlayerData, todayStr: string): { updatedData: PlayerData, changed: boolean } {
  let changed = false;
  const daysList = generateChallengeDaysList();
  const updatedDays = { ...playerData.days };

  for (const dateKey of daysList) {
    // If the date is in the past (before today)
    if (dateKey < todayStr) {
      const existing = updatedDays[dateKey];
      
      // Auto-fail if missing or status is 'none'
      if (!existing || existing.status === 'none') {
        updatedDays[dateKey] = {
          id: dateKey,
          dateString: getArabicDateString(dateKey),
          status: 'failed',
          progress: existing ? existing.progress : 0,
          completedCount: existing ? existing.completedCount : 0,
          tasks: existing ? existing.tasks : [false, false, false, false, false],
          reasons: "❌ لم يتم الضغط على زر اعتماد اليوم قبل منتصف الليل",
          penalty: 50,
          finalCommitTimestamp: new Date().toISOString()
        };
        changed = true;
      }
    }
  }

  return {
    updatedData: { days: updatedDays },
    changed
  };
}

// Lists the names of the missing tasks
export function getMissingTasksList(tasksChecked: boolean[]): string[] {
  const missing: string[] = [];
  tasksChecked.forEach((checked, i) => {
    if (!checked) {
      missing.push(DEFAULT_TASKS[i]);
    }
  });
  return missing;
}

// Compute player statistics based on reconciled data
export interface PlayerStats {
  successfulDays: number;
  failedDays: number;
  totalPenalties: number;
  commitmentRate: number; // Percentage
  longestStreak: number;
  totalRecordedDays: number;
}

export function calculatePlayerStats(playerData: PlayerData, todayStr: string): PlayerStats {
  const days = playerData.days;
  const daysList = generateChallengeDaysList();
  
  let successfulDays = 0;
  let failedDays = 0;
  let totalPenalties = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let totalRecordedDays = 0;

  // We only count days up to today (inclusive if today is already committed, or we can just count days with status !== 'none')
  for (const dateKey of daysList) {
    const day = days[dateKey];
    if (day && day.status !== 'none') {
      totalRecordedDays++;
      if (day.status === 'success') {
        successfulDays++;
        currentStreak++;
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
      } else if (day.status === 'failed') {
        failedDays++;
        totalPenalties += day.penalty || 0;
        currentStreak = 0; // reset streak
      }
    } else {
      // Future day or uncommitted today
      // Does not break the streak calculation of the past
    }
  }

  const denominator = successfulDays + failedDays;
  const commitmentRate = denominator > 0 ? Math.round((successfulDays / denominator) * 100) : 0;

  return {
    successfulDays,
    failedDays,
    totalPenalties,
    commitmentRate,
    longestStreak,
    totalRecordedDays
  };
}
