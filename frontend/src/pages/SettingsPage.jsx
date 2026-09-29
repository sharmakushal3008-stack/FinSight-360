import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Shield,
  Sparkles,
  Bot,
  Database,
  RefreshCw,
  CheckCircle2,
  Server,
  Info,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SettingsPage = () => {
  const { user } = useAuth();
  const [healthStatus, setHealthStatus] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.get('/health');
        setHealthStatus(res.data);
      } catch (err) {
        console.error('Health check failed:', err);
      } finally {
        setLoadingHealth(false);
      }
    };
    checkHealth();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">System Settings & Profile</h1>
            <p className="text-xs text-slate-500">
              Relationship Manager profile, intelligence configuration, and demo infrastructure
            </p>
          </div>
        </div>
      </div>

      {/* RM Profile Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-4 h-4 text-blue-600" />
          <h2 className="font-display font-bold text-slate-900 text-sm">RM Profile Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Officer Name</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{user?.name || 'Kushagra Sharma'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Official Email</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{user?.email || 'rm@finsight.demo'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Assigned Role</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{user?.role || 'Senior RM'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Flagship Branch</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{user?.branch || 'North Zone Flagship Branch'}</span>
          </div>
        </div>
      </div>

      {/* AI & Intelligence Engine Status */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h2 className="font-display font-bold text-slate-900 text-sm">AI Engine & Fallback Architecture</h2>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800">Current AI Generation Mode:</span>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-semibold text-[11px]">
              {healthStatus?.aiEngine || 'Deterministic Rule-Based Fallback Mode Active'}
            </span>
          </div>

          <p className="text-slate-600 leading-relaxed">
            FinSight 360 utilizes Google Gemini API for natural-language customer brief synthesis. When a Gemini API key is absent or offline, the platform seamlessly runs its built-in deterministic rule-based relationship engine so zero functionality is disrupted.
          </p>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>Server Status: <strong>{healthStatus?.status || 'Online'}</strong></span>
            <span>Platform: <strong>FinSight 360 v1.0.0</strong></span>
          </div>
        </div>
      </div>

      {/* Portfolio Disclaimer */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
        <div className="font-bold flex items-center gap-1.5">
          <Info className="w-4 h-4 text-amber-600" />
          <span>Educational & Portfolio Project Disclaimer</span>
        </div>
        <p className="leading-relaxed text-amber-800">
          FinSight 360 is an independent full-stack relationship intelligence software application. It is not affiliated with any real bank. All customer records, credit limits, account numbers, and phone numbers are simulated for educational demonstration.
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
