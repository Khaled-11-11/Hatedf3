/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CHALLENGE_START_DATE, CHALLENGE_END_DATE } from "../types";

// Generates all dates in 'YYYY-MM-DD' format between start and end
export function generateChallengeDaysList(): string[] {
  const list: string[] = [];
  const start = new Date(CHALLENGE_START_DATE);
  const end = new Date(CHALLENGE_END_DATE);
  
  const current = new Date(start);
  while (current <= end) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    list.push(`${yyyy}-${mm}-${dd}`);
    current.setDate(current.getDate() + 1);
  }
  return list;
}

const ARABIC_DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

export function getArabicDateString(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    const d = new Date(year, month, day);
    const dayName = ARABIC_DAYS[d.getDay()];
    const monthName = ARABIC_MONTHS[month];
    
    return `${dayName}، ${day} ${monthName} ${year}`;
  } catch (e) {
    return dateStr;
  }
}

export function getSystemNow(): Date {
  return new Date(); // دايماً الوقت الحقيقي
}

export function setVirtualDate(_simulatedDateString: string) {
  // لا يفعل شيء — الوقت دايماً حقيقي
}

export function resetVirtualDate() {
  // لا يفعل شيء
}

// Returns YYYY-MM-DD
export function getTodayDateString(dateObj: Date = getSystemNow()): string {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Formats a duration in seconds to HH:MM:SS
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [
    String(h).padStart(2, '0'),
    String(m).padStart(2, '0'),
    String(s).padStart(2, '0')
  ].join(':');
}

// Calculate the seconds left until midnight
export function getSecondsUntilMidnight(nowDate: Date = getSystemNow()): number {
  const midnight = new Date(nowDate);
  midnight.setHours(24, 0, 0, 0); // Next midnight
  return Math.floor((midnight.getTime() - nowDate.getTime()) / 1000);
}
