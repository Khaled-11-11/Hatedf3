/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { PlayerName } from "../types";
import { Sword, Zap } from "lucide-react";
import { motion } from "motion/react";

interface SplashProps {
  onSelectPlayer: (player: PlayerName) => void;
  key?: string;
}

export default function Splash({ onSelectPlayer }: SplashProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#05070f] text-white px-4 py-8 select-none relative overflow-hidden">
      {/* Background Cyberpunk Accents */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[130px]" />
      <div className="absolute bottom-[-25%] right-[-25%] w-[60%] h-[60%] rounded-full bg-pink-600/10 blur-[130px]" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10 max-w-xl mb-12"
      >
        <span className="inline-block px-3 py-1 mb-4 text-xs font-mono tracking-widest text-[#6366f1] uppercase border border-[#6366f1]/30 bg-[#6366f1]/10 rounded-full">
          تحدي الالتزام اليومي • 2026
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-yellow-300 mb-4 font-sans leading-tight">
          💀 هتدفع هوريك اللي عمرك ما شفته
        </h1>
        <p className="text-base text-gray-400 font-sans max-w-md mx-auto leading-relaxed">
          تحدي حديدي بين محمد وخالد. اليوم اللي يعدي من غير اعتماد للـ 5 مهام بـ 50 جنيه كاش فوري. المرجع الرسمي لتوثيق الالتزام والنتائج.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl z-10">
        {/* Mohamed Player Card */}
        <motion.div
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onClick={() => onSelectPlayer("محمد")}
          className="relative group cursor-pointer bg-slate-900/40 backdrop-blur-md p-8 rounded-2xl border border-blue-500/20 hover:border-blue-500/60 transition-all duration-300 text-center shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-t-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right" />
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 mb-6 group-hover:bg-blue-500 group-hover:text-slate-900 transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.15)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]">
            <Sword className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors font-sans mb-2">
            لوحة محمد
          </h2>
          <p className="text-sm text-gray-500 font-sans">⚔️ السيف القاطع والالتزام البلاتيني</p>
          <div className="mt-6 inline-flex items-center gap-2 text-xs font-mono text-blue-400/80 group-hover:text-blue-300">
            <span>دخول اللوحة</span>
            <span>←</span>
          </div>
        </motion.div>

        {/* Khaled Player Card */}
        <motion.div
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onClick={() => onSelectPlayer("خالد")}
          className="relative group cursor-pointer bg-slate-900/40 backdrop-blur-md p-8 rounded-2xl border border-pink-500/20 hover:border-pink-500/60 transition-all duration-300 text-center shadow-[0_0_20px_rgba(244,114,182,0.1)] hover:shadow-[0_0_30px_rgba(244,114,182,0.25)]"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-pink-600 to-rose-400 rounded-t-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-pink-400 mb-6 group-hover:bg-pink-500 group-hover:text-slate-900 transition-all duration-300 shadow-[0_0_15px_rgba(244,114,182,0.15)] group-hover:shadow-[0_0_25px_rgba(244,114,182,0.4)]">
            <Zap className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-pink-400 group-hover:text-pink-300 transition-colors font-sans mb-2">
            لوحة خالد
          </h2>
          <p className="text-sm text-gray-500 font-sans">⚡ الصاعقة والمثابرة الحديدية</p>
          <div className="mt-6 inline-flex items-center gap-2 text-xs font-mono text-pink-400/80 group-hover:text-pink-300">
            <span>دخول اللوحة</span>
            <span>←</span>
          </div>
        </motion.div>
      </div>

      <div className="mt-16 text-xs text-gray-600 font-mono z-10 flex flex-col items-center gap-1">
        <span>يبدأ التحدي من 20 يونيو 2026 إلى 31 ديسمبر 2026</span>
        <span>بمعدل غرامة 50 ج.م كاش عن كل يوم غير مكتمل</span>
      </div>
    </div>
  );
}
