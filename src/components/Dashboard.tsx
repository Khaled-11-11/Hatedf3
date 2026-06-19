/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { PlayerName } from "../types";
import { PlayerStats } from "../utils/challengeLogic";
import { CheckCircle, XCircle, Coins, Percent, Flame, CalendarRange } from "lucide-react";
import { motion } from "motion/react";

interface DashboardProps {
  stats: PlayerStats;
  playerName: PlayerName;
}

export default function Dashboard({ stats, playerName }: DashboardProps) {
  const cardData = [
    {
      title: "الأيام الناجحة",
      value: stats.successfulDays + " أيام",
      icon: CheckCircle,
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      description: "التزام كامل بجميع المهام الخمسة",
      badgeColor: "bg-emerald-500/10 text-emerald-400",
      id: "stats-success"
    },
    {
      title: "الأيام الخاسرة",
      value: stats.failedDays + " أيام",
      icon: XCircle,
      textColor: "text-red-400",
      borderColor: "border-red-500/30",
      description: "مهام فائتة أو تجاوز منتصف الليل",
      badgeColor: "bg-red-500/10 text-red-400",
      id: "stats-failed"
    },
    {
      title: "إجمالي الغرامات",
      value: stats.totalPenalties + " ج.م",
      icon: Coins,
      textColor: "text-amber-400",
      borderColor: "border-amber-500/30",
      description: "مستحقة كاش فوري للطرف الآخر",
      badgeColor: "bg-amber-500/10 text-amber-300",
      id: "stats-penalty"
    },
    {
      title: "نسبة الالتزام",
      value: stats.commitmentRate + "%",
      icon: Percent,
      textColor: "text-violet-400",
      borderColor: "border-violet-500/30",
      description: "معدل النجاح من مجموع الأيام الكلية",
      badgeColor: "bg-violet-500/10 text-violet-400",
      id: "stats-rate"
    },
    {
      title: "أطول سلسلة نجاح",
      value: stats.longestStreak + " يوم متتالي",
      icon: Flame,
      textColor: "text-orange-400",
      borderColor: "border-orange-500/30",
      description: "الرقم القياسي للأيام المتتابعة الناجحة",
      badgeColor: "bg-orange-500/10 text-orange-400",
      id: "stats-streak"
    },
    {
      title: "أيام التقييم",
      value: stats.totalRecordedDays + " أيام",
      icon: CalendarRange,
      textColor: "text-slate-4050",
      borderColor: "border-slate-700/40",
      description: "مجموع الأيام التي تلت البداية وجرى حسابها",
      badgeColor: "bg-slate-500/10 text-slate-400",
      id: "stats-recorded"
    }
  ];

  return (
    <div className="glass-card rounded-2xl p-6 mb-8 border-r-4 border-r-indigo-500 shadow-xl relative overflow-hidden">
      {/* Background Accent glow */}
      <div className="absolute -left-12 -top-12 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex items-center gap-2.5 mb-6">
        <span className="w-2.5 h-5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
        <h3 className="text-lg font-extrabold tracking-tight text-white font-sans">
          إحصائيات لوحة {playerName}
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        {cardData.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              id={card.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className={`relative overflow-hidden bg-slate-900/60 p-5 rounded-xl border ${card.borderColor} flex flex-col justify-between shadow-md transition-all duration-300`}
            >
              {/* Card internal subtle highlight */}
              <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-white/[0.01] blur-xl pointer-events-none" />

              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-xs md:text-sm font-semibold text-gray-400 font-sans">
                  {card.title}
                </span>
                <div className={`p-2 rounded-lg ${card.badgeColor} border border-current/10 shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className={`text-xl md:text-2xl font-black tracking-tight font-sans block mb-1 stat-value ${card.textColor}`}>
                  {card.value}
                </span>
                <span className="text-[11px] text-gray-400 font-sans leading-tight block">
                  {card.description}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
