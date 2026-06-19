/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { DayData, PlayerName } from "../types";
import { generateChallengeDaysList, getArabicDateString } from "../utils/dateUtils";
import { ListFilter, Trophy, Ban, Receipt, FileText } from "lucide-react";
import { motion } from "motion/react";

interface HistoryTableProps {
  daysData: { [key: string]: DayData };
  todayStr: string;
  playerName: PlayerName;
}

export default function HistoryTable({ daysData, todayStr, playerName }: HistoryTableProps) {
  const sortedRecordedDays = useMemo(() => {
    const list = generateChallengeDaysList();
    
    // Sort reverse chronological (newest first) but only matching evaluated days
    return list
      .filter((dateKey) => {
        const record = daysData[dateKey];
        return record && record.status !== "none" && dateKey <= todayStr;
      })
      .map((dateKey) => daysData[dateKey])
      .sort((a, b) => b.id.localeCompare(a.id));
  }, [daysData, todayStr]);

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden border border-white/5">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
        <FileText className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="text-lg font-bold font-sans text-white">
            السجل التاريخي للاعب: {playerName}
          </h3>
          <p className="text-xs text-gray-500 font-sans mt-0.5">
            سجل التدقيق للأيام الفائتة والمستحقات المباشرة حتى اليوم.
          </p>
        </div>
      </div>

      {sortedRecordedDays.length === 0 ? (
        <div className="text-center py-10 text-gray-500 font-sans">
          <ListFilter className="w-8 h-8 mx-auto text-gray-600 mb-3" />
          <p className="text-sm">لا توجد سجلات مسجلة حتى الآن.</p>
          <p className="text-xs text-gray-600 mt-1">تظهر السجلات بعد تسجيل أو فوات اليوم الأول للتحدي (20 يونيو 2026).</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-gray-450 font-sans text-xs uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">التاريخ</th>
                <th className="py-3 px-4 font-semibold text-center">حالة اليوم</th>
                <th className="py-3 px-4 font-semibold text-center">نسبة الإنجاز</th>
                <th className="py-3 px-4 font-semibold">أسباب ودواعي العقوبة</th>
                <th className="py-3 px-4 font-semibold text-center">الغرامة المالية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {sortedRecordedDays.map((day, idx) => {
                const isSuccess = day.status === "success";
                
                return (
                  <motion.tr
                    key={day.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.03 }}
                    className="hover:bg-slate-900/20 text-gray-300 transition"
                  >
                    {/* Date */}
                    <td className="py-3.5 px-4 font-serif font-medium whitespace-nowrap">
                      <div>
                        <span className="text-white block text-sm">{getArabicDateString(day.id)}</span>
                        <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">{day.id}</span>
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {isSuccess ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Trophy className="w-3 h-3" /> ملتزم 🟢
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                          <Ban className="w-3 h-3" /> خاسر 🔴
                        </span>
                      )}
                    </td>

                    {/* Completion bar */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        <span className="font-mono text-xs text-slate-350 font-bold mb-1.5">{day.completedCount} / 5</span>
                        <div className="w-24 bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${isSuccess ? "bg-emerald-400" : "bg-red-400"}`}
                            style={{ width: `${day.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Reasons */}
                    <td className="py-3.5 px-4 text-xs font-serif leading-relaxed max-w-sm">
                      {isSuccess ? (
                        <span className="text-gray-500 font-sans">لا توجد عقوبات - إتمام كامل ومثالي ✨</span>
                      ) : (
                        <span className="text-red-400/90 font-sans block">{day.reasons}</span>
                      )}
                    </td>

                    {/* Penalty */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {isSuccess ? (
                        <span className="font-mono text-sm text-gray-500">0 ج.م</span>
                      ) : (
                        <span className="font-mono text-sm text-red-400 font-extrabold flex items-center justify-center gap-1">
                          <Receipt className="w-3.5 h-3.5 text-red-400" />
                          <span>{day.penalty} ج.م</span>
                        </span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
