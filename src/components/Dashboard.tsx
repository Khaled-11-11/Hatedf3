/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { PlayerStats } from "../utils/challengeLogic";
import { motion } from "motion/react";

interface DashboardProps {
  mohamedStats: PlayerStats;
  khaledStats: PlayerStats;
}

export default function Dashboard({ mohamedStats, khaledStats }: DashboardProps) {
  const cards = [
    {
      title: "الأيام الناجحة 🟢",
      mohamedValue: mohamedStats.successfulDays,
      khaledValue: khaledStats.successfulDays,
      id: "stats-success"
    },
    {
      title: "الأيام الخاسرة 🔴",
      mohamedValue: mohamedStats.failedDays,
      khaledValue: khaledStats.failedDays,
      id: "stats-failed"
    },
    {
      title: "الغرامات المستحقة 💸",
      mohamedValue: `${mohamedStats.totalPenalties} ج.م`,
      khaledValue: `${khaledStats.totalPenalties} ج.م`,
      id: "stats-penalty"
    },
    {
      title: "نسبة الالتزام 📊",
      mohamedValue: `${mohamedStats.commitmentRate}%`,
      khaledValue: `${khaledStats.commitmentRate}%`,
      id: "stats-rate"
    },
    {
      title: "أطول سلسلة نجاح 🔥",
      mohamedValue: mohamedStats.longestStreak,
      khaledValue: khaledStats.longestStreak,
      id: "stats-streak"
    }
  ];

  return (
    <div className="glass-card rounded-2xl p-6 mb-8 border-r-4 border-r-indigo-500 shadow-xl relative overflow-hidden">
      {/* Background Accent glow */}
      <div className="absolute -left-12 -top-12 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex items-center gap-2.5 mb-6">
        <span className="w-2.5 h-5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
        <h3 className="text-lg font-extrabold tracking-tight text-white font-sans">
          لوحة الإحصائيات العامة • Dashboard
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            id={card.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.04 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="glass-card rounded-2xl p-4 flex items-center justify-between bg-slate-900/60 border border-white/5 shadow-md"
          >
            {/* Right: Spec Title */}
            <span className="text-sm font-bold text-gray-300 font-sans">
              {card.title}
            </span>
            
            {/* Left: Players stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-xs text-blue-400 font-bold mb-1 font-sans">محمد ⚔️</div>
                <div className="text-lg font-extrabold text-white font-sans">{card.mohamedValue}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-pink-400 font-bold mb-1 font-sans">خالد ⚡</div>
                <div className="text-lg font-extrabold text-white font-sans">{card.khaledValue}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

