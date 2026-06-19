/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { DayData, PlayerData, PlayerName } from "./types";
import { getSecondsUntilMidnight, getTodayDateString, formatDuration, getArabicDateString, setVirtualDate, resetVirtualDate } from "./utils/dateUtils";
import { calculatePlayerStats, reconcilePlayerDays } from "./utils/challengeLogic";
import { listenToPlayerData, savePlayerData, isFirebaseConnected } from "./firebase";

// Components
import Splash from "./components/Splash";
import Dashboard from "./components/Dashboard";
import Arena from "./components/Arena";
import Journal from "./components/Journal";
import DayModal from "./components/DayModal";
import HistoryTable from "./components/HistoryTable";

// Icons
import { LogOut, Swords, Database, CalendarDays, Key, Wifi, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Session details
  const [activePlayer, setActivePlayer] = useState<PlayerName | null>(null);
  
  // Players data state
  const [mohamedData, setMohamedData] = useState<PlayerData>({ days: {} });
  const [khaledData, setKhaledData] = useState<PlayerData>({ days: {} });

  // Date Simulation State
  const [simulatedDate, setSimulatedDate] = useState<string>(() => {
    return getTodayDateString(new Date());
  });

  // Countdown clock state
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  // Modal handlers
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [isDbSettingsOpen, setIsDbSettingsOpen] = useState<boolean>(false);

  // Restore preferred user session on boot
  useEffect(() => {
    const pref = localStorage.getItem("active_player_preference") as PlayerName | null;
    if (pref === "محمد" || pref === "خالد") {
      setActivePlayer(pref);
    }
  }, []);

  // Update simulation date changes
  useEffect(() => {
    setVirtualDate(simulatedDate);
    
    // Trigger reconciliations for both players with the new simulated date
    if (mohamedData.days && Object.keys(mohamedData.days).length > 0) {
      const { updatedData, changed } = reconcilePlayerDays(mohamedData, simulatedDate);
      if (changed) {
        savePlayerData("محمد", updatedData).then(() => setMohamedData(updatedData)).catch(console.error);
      }
    }
    if (khaledData.days && Object.keys(khaledData.days).length > 0) {
      const { updatedData, changed } = reconcilePlayerDays(khaledData, simulatedDate);
      if (changed) {
        savePlayerData("خالد", updatedData).then(() => setKhaledData(updatedData)).catch(console.error);
      }
    }
  }, [simulatedDate]);

  // Real-time Database Bindings
  useEffect(() => {
    // 1. Listen to Mohamed's data
    const unsubMohamed = listenToPlayerData(
      "محمد",
      (data) => {
        // Run reconciliation immediately on freshly fetched data
        const { updatedData, changed } = reconcilePlayerDays(data, simulatedDate);
        if (changed) {
          savePlayerData("محمد", updatedData).catch(console.error);
        }
        setMohamedData(updatedData);
      },
      (err) => console.error("Error listening to Mohamed data", err)
    );

    // 2. Listen to Khaled's data
    const unsubKhaled = listenToPlayerData(
      "خالد",
      (data) => {
        const { updatedData, changed } = reconcilePlayerDays(data, simulatedDate);
        if (changed) {
          savePlayerData("خالد", updatedData).catch(console.error);
        }
        setKhaledData(updatedData);
      },
      (err) => console.error("Error listening to Khaled data", err)
    );

    return () => {
      unsubMohamed();
      unsubKhaled();
    };
  }, [simulatedDate]);

  // Midnight ticking clock trigger
  useEffect(() => {
    // Initial sync
    setSecondsLeft(getSecondsUntilMidnight());

    const timer = setInterval(() => {
      const left = getSecondsUntilMidnight();
      setSecondsLeft(left);

      // Roll over checklist automatically when countdown hits exactly 0
      if (left <= 0) {
        const nextDateStr = getTodayDateString(new Date());
        setSimulatedDate(nextDateStr);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [simulatedDate]);

  // Stats Computations
  const mohamedStats = useMemo(() => calculatePlayerStats(mohamedData, simulatedDate), [mohamedData, simulatedDate]);
  const khaledStats = useMemo(() => calculatePlayerStats(khaledData, simulatedDate), [khaledData, simulatedDate]);

  const activePlayerData = activePlayer === "محمد" ? mohamedData : khaledData;
  const activePlayerStats = activePlayer === "محمد" ? mohamedStats : khaledStats;

  const handleSelectPlayer = (name: PlayerName) => {
    setActivePlayer(name);
    localStorage.setItem("active_player_preference", name);
  };

  const handleLogOut = () => {
    setActivePlayer(null);
    localStorage.removeItem("active_player_preference");
  };

  const handleSaveActiveDay = async (
    tasksChecked: boolean[],
    status: 'success' | 'failed' | 'none',
    reasons: string,
    penalty: number
  ) => {
    if (!activePlayer || !selectedDateKey) return;

    // Strict validation: Only the active simulated day can be edited or committed
    if (selectedDateKey !== simulatedDate) {
      console.warn("Attempted to modify a past or future day.");
      return;
    }

    // Strict validation: If the day is already committed, prevent re-saving
    const existingDay = activePlayerData.days[selectedDateKey];
    if (existingDay && existingDay.status !== 'none' && existingDay.status !== 'none') {
      console.warn("Attempted to modify an already finalized day.");
      return;
    }

    const daysCopy = { ...activePlayerData.days };
    daysCopy[selectedDateKey] = {
      id: selectedDateKey,
      dateString: getArabicDateString(selectedDateKey),
      status,
      progress: Math.round((tasksChecked.filter(Boolean).length / 5) * 100),
      completedCount: tasksChecked.filter(Boolean).length,
      tasks: [...tasksChecked],
      reasons,
      penalty,
      finalCommitTimestamp: new Date().toISOString()
    };

    const updatedData: PlayerData = { days: daysCopy };
    
    // Save locally or firestore
    try {
      await savePlayerData(activePlayer, updatedData);
      // Trigger local state updates
      if (activePlayer === "محمد") setMohamedData(updatedData);
      else setKhaledData(updatedData);
      setSelectedDateKey(null);
    } catch (e) {
      console.error("Failed to commit day data", e);
    }
  };

  // Timer highlights
  const countdownHrs = Math.floor(secondsLeft / 3600);
  let countdownColor = "text-emerald-400";
  if (countdownHrs < 1) {
    countdownColor = "text-red-500 animate-pulse font-extrabold";
  } else if (countdownHrs < 2) {
    countdownColor = "text-orange-400 animate-pulse";
  }

  const isDbOnline = isFirebaseConnected();

  return (
    <div className="min-h-screen pb-16 relative selection:bg-violet-500/30 selection:text-white">
      {/* Dynamic Splash router */}
      <AnimatePresence mode="wait">
        {!activePlayer ? (
          <Splash onSelectPlayer={handleSelectPlayer} key="splash" />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-7xl mx-auto px-4 py-8 font-sans"
            key="application"
          >
            {/* Upper application bar */}
            <header className="glass-card flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl border-r-4 border-r-[#6366f1] shadow-xl mb-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#6366f1]/5 rounded-full blur-3xl pointer-events-none" />
              
              {/* Right side: App Title & branding */}
              <div className="flex items-center gap-3 text-right relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#6366f1]/15 border border-[#6366f1]/30 flex items-center justify-center text-[#6366f1] shadow-[0_0_15px_rgba(99,102,241,0.15)] flex-shrink-0">
                  <Swords className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-white font-sans">
                     نظام تحدي الالتزام اليومي 💀
                  </h1>
                  <span className="text-[11px] text-indigo-300 font-mono">
                     محمد ⚔️ خالد • 20 يونيو 2026 - 31 ديسمبر 2026
                  </span>
                </div>
              </div>

              {/* Left side: Balanced Status and Controls bar */}
              <div className="flex items-center gap-2 flex-wrap md:flex-nowrap justify-end relative z-10 w-full md:w-auto">
                {/* Firebase Connection Icon Indicator */}
                <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold ${
                  isDbOnline
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-red-500/10 border-red-500/20 text-red-400 animate-pulse"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isDbOnline ? "bg-emerald-400" : "bg-red-400"}`} />
                  {isDbOnline ? "متصل بـ Firebase 🟢" : "غير متصل 🔴"}
                </div>

                {/* Simulated Custom Date Controller */}
                <div className="bg-slate-950/80 border border-white/5 p-1.5 rounded-xl flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-[#6366f1]" />
                  <span className="text-[10px] text-gray-400 font-sans">تاريخ الاختبار:</span>
                  <input
                    type="date"
                    min="2026-06-15"
                    max="2026-12-31"
                    value={simulatedDate}
                    onChange={(e) => setSimulatedDate(e.target.value)}
                    className="bg-slate-900/80 text-[10px] px-2 py-0.5 rounded-lg border border-white/5 text-white font-mono outline-none cursor-pointer focus:ring-1 focus:ring-violet-500/50"
                  />
                </div>

                {/* Overdue Limit Clock */}
                <div className="bg-slate-950/80 border border-white/5 px-2.5 py-1.5 rounded-xl flex items-center gap-2 shadow-[inset_0_1px_3px_rgba(255,255,255,0.01)]">
                  <span className="text-[10px] text-gray-400 font-sans whitespace-nowrap">الوقت لمنتصف الليل:</span>
                  <span className={`font-mono text-xs font-bold tracking-tight ${countdownColor}`}>
                    {formatDuration(secondsLeft)}
                  </span>
                </div>

                {/* Identity selector pill */}
                <div className="bg-slate-950/80 border border-white/5 p-1 rounded-xl flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-2 py-1 rounded-lg border ${
                    activePlayer === "محمد"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                      : "bg-pink-500/10 text-pink-400 border-pink-500/20 shadow-[0_0_10px_rgba(244,114,182,0.1)]"
                  }`}>
                    {activePlayer === "محمد" ? "محمد ⚔️" : "خالد ⚡"}
                  </span>
                  
                  <button
                    onClick={handleLogOut}
                    className="text-[10px] font-bold text-gray-400 hover:text-white transition flex items-center gap-1 cursor-pointer font-sans px-1"
                  >
                    <LogOut className="w-3 h-3 text-gray-400" />
                    <span>تبديل</span>
                  </button>
                </div>
              </div>
            </header>

            {/* Statistics Section Dashboard */}
            <Dashboard mohamedStats={mohamedStats} khaledStats={khaledStats} />

            {/* Direct Confrontation Arena showdown */}
            <Arena mohamedStats={mohamedStats} khaledStats={khaledStats} />

            {/* Journal grid */}
            <Journal
              daysData={activePlayerData.days}
              todayStr={simulatedDate}
              onOpenDay={(dateStr) => setSelectedDateKey(dateStr)}
            />

            {/* Historic audited Table ledger */}
            <div className="mt-8">
              <HistoryTable
                daysData={activePlayerData.days}
                todayStr={simulatedDate}
                playerName={activePlayer || "محمد"}
              />
            </div>

            {/* Floating popups overlay layout */}
            <AnimatePresence>
              {selectedDateKey && (
                <DayModal
                  dateKey={selectedDateKey}
                  dayRecord={activePlayerData.days[selectedDateKey]}
                  isToday={selectedDateKey === simulatedDate}
                  playerName={activePlayer || "محمد"}
                  onClose={() => setSelectedDateKey(null)}
                  onSave={handleSaveActiveDay}
                />
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
