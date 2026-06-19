/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { FirebaseConfig } from "../types";
import { getSavedFirebaseConfig, saveFirebaseConfig, clearFirebaseConfig, isFirebaseConnected } from "../firebase";
import { Database, Wifi, WifiOff, Key, Info, HelpCircle, Check, Trash2, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FirebaseSettingsProps {
  onConfigChanged: () => void;
  onClose: () => void;
}

export default function FirebaseSettings({ onConfigChanged, onClose }: FirebaseSettingsProps) {
  const [apiKey, setApiKey] = useState("");
  const [authDomain, setAuthDomain] = useState("");
  const [projectId, setProjectId] = useState("");
  const [storageBucket, setStorageBucket] = useState("");
  const [messagingSenderId, setMessagingSenderId] = useState("");
  const [appId, setAppId] = useState("");

  const [connected, setConnected] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setConnected(isFirebaseConnected());
    const saved = getSavedFirebaseConfig();
    if (saved) {
      setApiKey(saved.apiKey || "");
      setAuthDomain(saved.authDomain || "");
      setProjectId(saved.projectId || "");
      setStorageBucket(saved.storageBucket || "");
      setMessagingSenderId(saved.messagingSenderId || "");
      setAppId(saved.appId || "");
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !projectId || !appId) {
      setErrorMsg("⚠️ يرجى تعبئة الحقول الأساسية على الأقل: (API Key, Project ID, App ID)");
      return;
    }

    const config: FirebaseConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim()
    };

    try {
      saveFirebaseConfig(config);
      setSuccess(true);
      setErrorMsg("");
      setTimeout(() => {
        setSuccess(false);
        onConfigChanged();
        onClose();
        // Force full page reload to trigger fresh firebase initialization
        window.location.reload();
      }, 1500);
    } catch (e: any) {
      setErrorMsg("حدث خطأ أثناء حفظ الإعدادات: " + e.message);
    }
  };

  const handleClear = () => {
    clearFirebaseConfig();
    setApiKey("");
    setAuthDomain("");
    setProjectId("");
    setStorageBucket("");
    setMessagingSenderId("");
    setAppId("");
    setErrorMsg("");
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onConfigChanged();
      onClose();
      window.location.reload();
    }, 1200);
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

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative glass-card border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.6)] z-10 font-sans flex flex-col"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-violet-500" />

        <div className="p-6 flex items-start justify-between border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">إعدادات قاعدة بيانات Firebase</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-850 hover:bg-slate-800 rounded-xl text-gray-400 hover:text-white transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" onClick={handleClear} title="حذف الإعدادات" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5 flex-1 overflow-y-auto max-h-[70vh]">
          {/* Real-time Connection status indicator */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            connected 
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
              : 'bg-amber-500/10 border-amber-500/25 text-amber-300'
          }`}>
            <div className="flex items-center gap-2.5">
              {connected ? <Wifi className="w-5 h-5 animate-pulse" /> : <WifiOff className="w-5 h-5" />}
              <div>
                <span className="font-bold text-sm block">
                  {connected ? "متصل بقاعدة البيانات Online 🌐" : "المزامنة المحلية نشطة Offline 💾"}
                </span>
                <span className="text-xs text-current/70 block mt-0.5 leading-relaxed">
                  {connected 
                    ? "يتم مزامنة المهام وتحديث إحصائيات محمد وخالد فورياً بين الجهازين بالوقت الفعلي." 
                    : "البيانات محفوظة محلياً على جهازك تذكر، لن يرى الطرف الآخر تعديلاتك دون ضبط Firebase."}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5 mb-1.5">
                <Key className="w-3.5 h-3.5" /> API Key *
              </label>
              <input
                type="text"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-gray-700 outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1.5">Project ID *</label>
              <input
                type="text"
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="commitment-tracker-xxxxx"
                className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-gray-700 outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1.5">App ID *</label>
              <input
                type="text"
                required
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1:xxxxx:web:xxxxx"
                className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-gray-700 outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1.5">Auth Domain</label>
                <input
                  type="text"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  placeholder="xxxxx.firebaseapp.com"
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-gray-700 outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1.5">Storage Bucket</label>
                <input
                  type="text"
                  value={storageBucket}
                  onChange={(e) => setStorageBucket(e.target.value)}
                  placeholder="xxxxx.appspot.com"
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-gray-700 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1.5">Messaging Sender ID</label>
              <input
                type="text"
                value={messagingSenderId}
                onChange={(e) => setMessagingSenderId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-gray-7050 outline-none transition"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>تم تحديث الإعدادات! جاري إعادة تهيئة النظام...</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-[0_4px_12px_rgba(59,130,246,0.3)] transition cursor-pointer text-center"
            >
              حفظ وتوصيل Online
            </button>
            
            {connected && (
              <button
                type="button"
                onClick={handleClear}
                className="py-3 px-4 rounded-xl bg-red-900/30 hover:bg-red-900/50 text-red-400 font-bold border border-red-500/20 text-sm transition cursor-pointer text-center"
              >
                قطع الاتصال والرجوع للمحلي
              </button>
            )}
            
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-400 text-sm transition cursor-pointer text-center"
            >
              إلغاء
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
