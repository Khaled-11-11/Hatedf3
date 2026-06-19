/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { DayData, DEFAULT_TASKS } from "../types";
import { generateChallengeDaysList, getArabicDateString } from "../utils/dateUtils";
import { Lock, CheckCircle2, AlertTriangle, Calendar, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface JournalProps {
  daysData: { [key: string]: DayData };
  todayStr: string;
  onOpenDay: (dateString: string) => void;
}

export default function Journal({ daysData, todayStr, onOpenDay }: JournalProps) {
  const daysList = useMemo(() => generateChallengeDaysList(), []);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed' | 'pending'>('all');

  // Group days by month for beautiful organizational panels
  const groupedByMonth = useMemo(() => {
    const groups: { [key: string]: { name: string; key: string; days: string[] } } = {
      "06": { name: "يونيو 2026", key: "06", days: [] },
      "07": { name: "يوليو 2026", key: "07", days: [] },
      "08": { name: "أغسطس 2026", key: "08", days: [] },
      "09": { name: "سبتمبر 2026", key: "09", days: [] },
      "10": { name: "أكتوبر 2026", key: "10", days: [] },
      "11": { name: "نوفمبر 2026", key: "11", days: [] },
      "12": { name: "ديسمبر 2026", key: "12", days: [] },
    };

    daysList.forEach((dateKey) => {
      const monthPart = dateKey.split("-")[1];
      if (groups[monthPart]) {
        groups[monthPart].days.push(dateKey);
      }
    });

    const monthKeys = ["06", "07", "08", "09", "10", "11", "12"];
    return monthKeys.map(key => groups[key]);
  }, [daysList]);

  // Collapsible tracking states - auto-expand today's simulated month
  const todayMonthKey = todayStr ? todayStr.split("-")[1] : "06";
  const [expandedMonths, setExpandedMonths] = useState<{ [key: string]: boolean }>({
    [todayMonthKey]: true // Expand today's month by default
  });

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/40 p-5 rounded-2xl border border-white/5 space-y-4">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-lg font-black font-sans text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-150">
              دفتر الالتزام اليومي • Journal Grid
            </h2>
            <p className="text-xs text-gray-400 font-sans mt-1">
              انقر على اليوم للتقييم واعتماد المهام الخمسة، أو عاين غرامات الأيام السابقة.
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono bg-slate-950/60 px-3 py-1.5 rounded-lg border border-white/5">
            <span>التحدي الرسمي: شهر 6 إلي شهر 12</span>
          </div>
        </div>

        {/* Filters Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Month Filter Deck */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-gray-400 block">تصفية حسب الشهر:</span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
              <button
                onClick={() => setSelectedMonth("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans shrink-0 cursor-pointer transition-all ${
                  selectedMonth === "all"
                    ? "bg-[#6366f1] text-white font-bold shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                    : "bg-slate-950/70 border border-white/5 text-gray-400 hover:text-white"
                }`}
              >
                الشهور كلها
              </button>
              
              {groupedByMonth.map((group) => (
                <button
                  key={group.key}
                  onClick={() => {
                    setSelectedMonth(group.key);
                    setExpandedMonths((prev) => ({ ...prev, [group.key]: true }));
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans shrink-0 cursor-pointer transition-all ${
                    selectedMonth === group.key
                      ? "bg-[#6366f1] text-white font-bold shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                      : "bg-slate-950/70 border border-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  {group.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter Deck */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-gray-400 block">تصفية حسب حالة الالتزام:</span>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans shrink-0 cursor-pointer transition-all ${
                  statusFilter === "all"
                    ? "bg-indigo-600 text-white font-bold"
                    : "bg-slate-950/70 border border-white/5 text-gray-400 hover:text-white"
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setStatusFilter("success")}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans shrink-0 cursor-pointer transition-all flex items-center gap-1.5 ${
                  statusFilter === "success"
                    ? "bg-emerald-600 text-white font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    : "bg-slate-950/70 border border-white/5 text-emerald-450 hover:bg-emerald-500/10"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                ملتزم 🟢
              </button>
              <button
                onClick={() => setStatusFilter("failed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans shrink-0 cursor-pointer transition-all flex items-center gap-1.5 ${
                  statusFilter === "failed"
                    ? "bg-red-600 text-white font-bold shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                    : "bg-slate-950/70 border border-white/5 text-red-450 hover:bg-red-500/10"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                مقصر 🔴
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans shrink-0 cursor-pointer transition-all flex items-center gap-1.5 ${
                  statusFilter === "pending"
                    ? "bg-amber-600 text-slate-950 font-black shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                    : "bg-slate-950/70 border border-white/5 text-amber-400 hover:bg-amber-500/10"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                بانتظار التقيم 🟡
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Render Lists of Months */}
      <div className="space-y-4">
        {groupedByMonth.map((monthGroup) => {
          // If a specific month is selected and it doesn't match, skip
          if (selectedMonth !== "all" && selectedMonth !== monthGroup.key) {
            return null;
          }

          const isExpanded = !!expandedMonths[monthGroup.key];
          const daysInGroup = monthGroup.days;
          
          // Apply status-level filters
          const filteredDays = daysInGroup.filter((dateKey) => {
            const dayRecord = daysData[dateKey];
            const isFuture = dateKey > todayStr;
            const dayStatus = dayRecord ? dayRecord.status : "none";

            if (statusFilter === "all") return true;
            if (statusFilter === "success") return dayStatus === "success";
            if (statusFilter === "failed") return dayStatus === "failed";
            if (statusFilter === "pending") return !isFuture && dayStatus !== "success" && dayStatus !== "failed";
            return true;
          });

          return (
            <div key={monthGroup.key} className="glass-card rounded-2xl overflow-hidden border border-white/5 shadow-lg">
              {/* Collapsible Header */}
              <button
                onClick={() => toggleMonth(monthGroup.key)}
                className="w-full flex items-center justify-between p-4 bg-slate-900/30 hover:bg-slate-900/60 transition-all font-sans cursor-pointer text-right border-b border-slate-950"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#6366f1]" />
                  <span className="font-bold text-sm text-gray-300">{monthGroup.name}</span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-gray-400 font-sans">
                    {filteredDays.length} {filteredDays.length === 1 ? "يوم" : "أيام"} {statusFilter !== "all" && "مطابقة"}
                  </span>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {/* Grid block */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {filteredDays.length === 0 ? (
                        <div className="col-span-full py-10 text-center text-xs text-gray-500 font-sans">
                          🔍 لا توجد أيام مطابقة هنا للفلترة المحددة.
                        </div>
                      ) : (
                        filteredDays.map((dateKey) => {
                          const dayRecord = daysData[dateKey];
                          const isToday = dateKey === todayStr;
                          const isFuture = dateKey > todayStr;

                          // Default day structural mapping
                          const dayStatus = dayRecord ? dayRecord.status : "none";
                          const completedCount = dayRecord ? dayRecord.completedCount : 0;
                          const progress = dayRecord ? dayRecord.progress : 0;

                          // Styling states
                          let bgStyle = "bg-slate-900/40 border-slate-8050 hover:border-violet-500/50 cursor-pointer text-gray-300";
                          let statusLine = "في انتظار الاعتماد";
                          let statusIcon = <HelpCircle className="w-4 h-4 text-gray-500" />;

                          if (isFuture) {
                            bgStyle = "bg-slate-950/90 border-slate-900 text-gray-600 cursor-not-allowed border-dashed";
                            statusLine = "مغلق مستقبلياً";
                            statusIcon = <Lock className="w-4 h-4 text-gray-700" />;
                          } else if (dayStatus === "success") {
                            bgStyle = "bg-emerald-950/20 border-emerald-500/30 text-emerald-300 hover:border-emerald-500 cursor-pointer shadow-[inset_0_0_15px_rgba(16,185,129,0.05)]";
                            statusLine = "ملتزم 🟢";
                            statusIcon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
                          } else if (dayStatus === "failed") {
                            bgStyle = "bg-red-950/20 border-red-500/30 text-red-300 hover:border-red-500 cursor-pointer shadow-[inset_0_0_15px_rgba(239,68,68,0.05)]";
                            statusLine = "خاسر ومغرم 🔴";
                            statusIcon = <AlertTriangle className="w-4 h-4 text-red-400" />;
                          } else if (isToday) {
                            bgStyle = "bg-violet-950/35 border-violet-500/50 hover:border-violet-400 text-violet-300 cursor-pointer ring-1 ring-violet-500/30 animate-pulse-subtle";
                            statusLine = "اليوم الحالي ⚡";
                            statusIcon = <span className="inline-block w-2 bg-violet-450 rounded-full animate-ping" />;
                          }

                          // Date Parts
                          const pieces = dateKey.split("-");
                          const dayNum = parseInt(pieces[2], 10);

                          return (
                            <motion.div
                              key={dateKey}
                              id={`day-${dateKey}`}
                              type="button"
                              whileHover={isFuture ? {} : { scale: 1.02 }}
                              whileTap={isFuture ? {} : { scale: 0.98 }}
                              onClick={() => {
                                if (!isFuture) onOpenDay(dateKey);
                              }}
                              className={`p-3 rounded-xl border flex flex-col justify-between h-28 relative overflow-hidden group select-none transition-all duration-3050 ${bgStyle}`}
                            >
                              <div className="flex items-start justify-between">
                                <span className="text-xl font-extrabold font-mono tracking-tight group-hover:text-white transition-colors">
                                  {dayNum}
                                </span>
                                
                                <div className="text-right">
                                  <span className={`text-[10px] font-sans font-medium px-1.5 py-0.5 rounded-md ${
                                    isToday ? "bg-violet-500/20 text-violet-300" :
                                    isFuture ? "bg-slate-900 text-gray-500" :
                                    dayStatus === 'success' ? "bg-emerald-500/10 text-emerald-400" :
                                    dayStatus === 'failed' ? "bg-red-500/10 text-red-400 animate-pulse" :
                                    "bg-slate-800 text-gray-450"
                                  }`}>
                                    {isToday ? "اليوم" : statusLine.replace(" 🟢", "").replace(" 🔴", "")}
                                  </span>
                                </div>
                              </div>

                              {/* Center Section: Task Progress */}
                              {!isFuture && (
                                <div className="my-2">
                                  <div className="flex justify-between items-center text-[10px] text-gray-500 mb-1 font-sans">
                                    <span>المهام:</span>
                                    <span className="font-mono text-xs text-gray-400 font-semibold">{completedCount}/5</span>
                                  </div>
                                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className={`h-full transition-all duration-500 ${
                                        dayStatus === "success" ? "bg-emerald-400" :
                                        dayStatus === "failed" ? "bg-red-400" : "bg-violet-500"
                                      }`}
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Bottom Footer Details */}
                              <div className="flex items-center justify-between mt-1 text-[10px] text-gray-500 border-t border-slate-900 pt-1.5">
                                <span className="font-mono truncate max-w-[80px]">
                                  {pieces[2]}/{pieces[1]}
                                </span>
                                <span>{statusIcon}</span>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
