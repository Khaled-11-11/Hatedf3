/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { DayData, DEFAULT_TASKS, PlayerName } from "../types";
import { getArabicDateString } from "../utils/dateUtils";
import { getMissingTasksList } from "../utils/challengeLogic";
import { X, CheckSquare, Square, AlertCircle, HelpCircle, ShieldAlert, Award, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DayModalProps {
  dateKey: string;
  dayRecord: DayData | undefined;
  isToday: boolean;
  playerName: PlayerName;
  onClose: () => void;
  onSave: (tasks: boolean[], status: 'success' | 'failed' | 'none', reasons: string, penalty: number) => void;
}

export default function DayModal({ dateKey, dayRecord, isToday, playerName, onClose, onSave }: DayModalProps) {
  const [tasks, setTasks] = useState<boolean[]>([false, false, false, false, false]);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  // Default record setup if missing
  const currentStatus = dayRecord ? dayRecord.status : 'none';
  const isReadOnly = !isToday || currentStatus !== 'none';

  // Load state when day changes
  useEffect(() => {
    if (dayRecord) {
      setTasks([...dayRecord.tasks]);
    } else {
      setTasks([false, false, false, false, false]);
    }
    setShowConfirm(false);
  }, [dayRecord, dateKey]);

  // Compute live progress metrics
  const completedCount = tasks.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 5) * 100);

  const handleToggleTask = (index: number) => {
    if (isReadOnly) return;
    const updated = [...tasks];
    updated[index] = !updated[index];
    setTasks(updated);
  };

  const handleCommitClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmSubmit = () => {
    // Check if fully completed
    const allChecked = completedCount === 5;
    const finalStatus = allChecked ? "success" : "failed";
    
    let failureReasons = "";
    let penaltyAmount = 0;

    if (!allChecked) {
      const missingTasks = getMissingTasksList(tasks);
      failureReasons = `❌ تم اعتماد اليوم الحالي بمهام غير مكتملة: ${missingTasks.join("، ")}`;
      penaltyAmount = 50;
    }

    onSave(tasks, finalStatus, failureReasons, penaltyAmount);
    setShowConfirm(false);
  };

  return (
    <div className="fixed inset-0 min-h-screen z-50 flex items-center justify-center p-4">
      {/* Dimmed backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#05070fc0] backdrop-blur-sm"
      />

      {/* Modal Card content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative glass-card border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.6)] z-10 flex flex-col"
      >
        {/* Top Header line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-l from-[#6366f1] to-pink-500" />

        <div className="p-6 flex items-start justify-between border-b border-white/5">
          <div>
            <span className="text-xs font-mono text-violet-400">
              {playerName} • {dateKey}
            </span>
            <h3 className="text-xl font-bold font-sans text-white mt-1">
              {getArabicDateString(dateKey)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 transition rounded-xl text-gray-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 space-y-6 flex-1 max-h-[70vh] overflow-y-auto">
          {/* Live Progress Card */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-850">
            <div className="flex justify-between items-center mb-2 font-sans">
              <span className="text-xs text-gray-400">معدل الإنجاز العام</span>
              <span className="text-sm font-extrabold font-mono text-white">{completedCount} / 5</span>
            </div>
            
            <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden mb-1">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isReadOnly && currentStatus === "success" ? "bg-emerald-400" :
                  isReadOnly && currentStatus === "failed" ? "bg-red-400" : "bg-violet-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Read Only Status alert banner */}
          {isReadOnly && (
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${
              currentStatus === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                : 'bg-red-500/10 border-red-500/20 text-red-300'
            }`}>
              {currentStatus === 'success' ? (
                <>
                  <Award className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm font-sans mb-1">تمت المهمة بنجاح! 🟢</h4>
                    <p className="text-xs text-emerald-400/80 leading-relaxed font-sans">
                      التزمت بنجاح في هذا اليوم واعتمدت جميع المهام الخمسة قبل انتصاف ليل الموعد. الغرامة المستحقة هي <strong className="font-mono text-[13px]">0 جنيه مصري</strong>.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm font-sans mb-1">يوم خاسر ومغرم 🔴</h4>
                    <p className="text-xs text-red-400/80 leading-relaxed font-sans">
                      {dayRecord?.reasons || "❌ لم يتم إتمام المهام بنجاح أو تجاوز موعد انتصاف الليل دون اعتماد."}
                    </p>
                    <div className="mt-2 text-xs font-sans font-bold text-white flex items-center gap-1.5">
                      <span>الغرامة المالية المستحقة:</span>
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono text-[13px]">
                        50 ج.م كاش للطرف الآخر
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Checklist Area */}
          <div>
            <h4 className="text-xs font-bold font-sans text-gray-400 uppercase tracking-wider mb-3">
              قائمة تفاصيل المهام اليومية
            </h4>
            
            <div className="space-y-3">
              {DEFAULT_TASKS.map((taskName, index) => {
                const checked = tasks[index];
                return (
                  <div
                    key={taskName}
                    onClick={() => handleToggleTask(index)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all select-none ${
                      isReadOnly 
                        ? 'bg-slate-900/30 border-slate-850 cursor-default' 
                        : 'bg-slate-950/40 border-slate-850/60 hover:bg-slate-900 hover:border-violet-500/20 cursor-pointer'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {checked ? (
                        <CheckSquare className={`w-5 h-5 ${isReadOnly ? "text-gray-500" : "text-violet-400"}`} />
                      ) : (
                        <Square className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    
                    <span className={`text-sm font-serif ${
                      checked 
                        ? 'text-gray-300 line-through decoration-slate-600' 
                        : 'text-gray-100'
                    }`}>
                      {taskName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action button bar */}
        {!isReadOnly && (
          <div className="p-6 bg-slate-950/60 border-t border-slate-850 flex flex-col gap-3">
            {!showConfirm ? (
              <button
                type="button"
                onClick={handleCommitClick}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-bold text-sm shadow-[0_4px_15px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.5)] cursor-pointer transform hover:translate-y-[-1px] transition duration-200 text-center font-sans tracking-wide"
              >
                ✅ اعتماد اليوم الحالي
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200"
              >
                <div className="flex items-start gap-2.5 mb-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm font-sans text-white">تأكيد الاعتماد النهائي؟</h5>
                    <p className="text-xs text-amber-200/80 leading-relaxed font-sans mt-0.5">
                      هل أنت متأكد؟ لن تتمكن من التراجع أو تعديل هذا اليوم مرة أخرى بعد الحفظ والاعتماد.
                    </p>
                    {completedCount < 5 && (
                      <p className="text-xs text-red-300 font-sans mt-1">
                        ⚠️ انتبه: لقد أنجزت {completedCount} مهام من أصل 5. هذا يعني غرامة مالية قدرها 50 جنيه مصري!
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={handleConfirmSubmit}
                    className="flex-1 py-2 px-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-xs font-sans text-center cursor-pointer transition"
                  >
                    تأكيد وحفظ
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold text-xs font-sans text-center cursor-pointer transition"
                  >
                    تراجع
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
