/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { PlayerStats } from "../utils/challengeLogic";
import { Sword, Zap, Trophy, ShieldAlert, Sparkles, Scale, Swords } from "lucide-react";
import { motion } from "motion/react";

interface ArenaProps {
  mohamedStats: PlayerStats;
  khaledStats: PlayerStats;
}

export default function Arena({ mohamedStats, khaledStats }: ArenaProps) {
  // Determine who has the Crown 👑
  // Based on success count, and if even, lowest penalty
  let leader: "محمد" | "خالد" | "tie" = "tie";
  if (mohamedStats.successfulDays > khaledStats.successfulDays) {
    leader = "محمد";
  } else if (khaledStats.successfulDays > mohamedStats.successfulDays) {
    leader = "خالد";
  } else {
    // Under equal success, whoever has least penalties
    if (mohamedStats.totalPenalties < khaledStats.totalPenalties) {
      leader = "محمد";
    } else if (khaledStats.totalPenalties < mohamedStats.totalPenalties) {
      leader = "خالد";
    } else {
      leader = "tie";
    }
  }

  // Row definition for direct comparisons
  const compareRows = [
    {
      label: "الأيام الناجحة 🟢",
      moValue: mohamedStats.successfulDays,
      khValue: khaledStats.successfulDays,
      suffix: " أيام",
      isLowerBetter: false,
    },
    {
      label: "الأيام الخاسرة 🔴",
      moValue: mohamedStats.failedDays,
      khValue: khaledStats.failedDays,
      suffix: " أيام",
      isLowerBetter: true,
    },
    {
      label: "الغرامات المستحقة 💸",
      moValue: mohamedStats.totalPenalties,
      khValue: khaledStats.totalPenalties,
      suffix: " ج.م",
      isLowerBetter: true,
    },
    {
      label: "نسبة الالتزام 📊",
      moValue: mohamedStats.commitmentRate,
      khValue: khaledStats.commitmentRate,
      suffix: "%",
      isLowerBetter: false,
    },
    {
      label: "أطول سلسلة نجاح 🔥",
      moValue: mohamedStats.longestStreak,
      khValue: khaledStats.longestStreak,
      suffix: " أيام",
      isLowerBetter: false,
    },
  ];

  return (
    <div className="glass-card p-6 rounded-2xl mb-8 relative overflow-hidden border-b-4 border-b-amber-500 shadow-xl">
      {/* Background neon elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-gradient-to-b from-[#6366f1]/15 via-transparent to-transparent hidden md:block" />
      
      <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <Swords className="w-5.5 h-5.5 text-[#6366f1] animate-pulse" />
          <h2 className="text-lg font-extrabold font-sans text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-100">
            لوحة التنافس المباشر • Arena Showdown
          </h2>
        </div>
        
        {leader === "tie" ? (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-300 font-sans flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-slate-400" /> تعادل حالياً
          </span>
        ) : (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-sans flex items-center gap-1 shadow-[0_0_12px_rgba(251,191,36,0.2)]">
            <Trophy className="w-3.5 h-3.5 text-yellow-500" /> المتصدر الحالي: {leader} 👑
          </span>
        )}
      </div>

      {/* Side-by-Side Players */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-center">
        {/* Mohamed Col */}
        <div className="relative group p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:border-blue-500/20 transition-all duration-300">
          {leader === "محمد" && (
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.5)] flex items-center gap-1 font-mono">
              👑 متصدر
            </div>
          )}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 mb-2 border border-blue-500/20">
            <Sword className="w-6 h-6 rotate-45" />
          </div>
          <h3 className="text-base font-black text-blue-400 font-sans">محمّد ⚔️</h3>
          <p className="text-xs text-blue-400/50 font-mono mt-0.5">البلو هلمت</p>
        </div>

        {/* Khaled Col */}
        <div className="relative group p-4 rounded-xl bg-pink-500/5 border border-pink-500/10 hover:border-pink-500/20 transition-all duration-300">
          {leader === "خالد" && (
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.5)] flex items-center gap-1 font-mono">
              👑 متصدر
            </div>
          )}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 mb-2 border border-pink-500/20">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-pink-400 font-sans">خالد ⚡</h3>
          <p className="text-xs text-pink-400/50 font-mono mt-0.5">الصاعقة الوردية</p>
        </div>
      </div>

      {/* Comparisons Rows */}
      <div className="space-y-4">
        {compareRows.map((row) => {
          const isMohamedWinner = row.isLowerBetter 
            ? row.moValue < row.khValue 
            : row.moValue > row.khValue;
            
          const isKhaledWinner = row.isLowerBetter 
            ? row.khValue < row.moValue 
            : row.khValue > row.moValue;

          const isTie = row.moValue === row.khValue;

          return (
            <div key={row.label} className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <span className="text-sm text-gray-400 font-sans text-center md:text-right font-medium">
                {row.label}
              </span>
              
              <div className="grid grid-cols-2 gap-4 w-full md:w-3/5 text-center items-center">
                {/* Mohamed Value */}
                <div className="flex items-center justify-center gap-1.5">
                  <span className={`text-base font-bold font-mono ${isMohamedWinner ? "text-emerald-400 font-extrabold" : isTie ? "text-gray-300" : "text-gray-500"}`}>
                    {row.moValue}{row.suffix}
                  </span>
                  {isMohamedWinner && <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
                </div>

                {/* Khaled Value */}
                <div className="flex items-center justify-center gap-1.5">
                  <span className={`text-base font-bold font-mono ${isKhaledWinner ? "text-emerald-400 font-extrabold" : isTie ? "text-gray-300" : "text-gray-500"}`}>
                    {row.khValue}{row.suffix}
                  </span>
                  {isKhaledWinner && <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fine Print Note */}
      <div className="mt-4 pt-4 border-t border-slate-850 text-center text-[10px] text-gray-500 font-sans">
        * يتم تحديد الصدارة أولاً بناءً على الأيام الناجحة، وثانياً كمعيار كسر تعادل بناءً على الأقل في قيمة الغرامات المالية المتراكمة.
      </div>
    </div>
  );
}
