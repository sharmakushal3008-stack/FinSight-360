import React from 'react';
import { X, HelpCircle, Activity, ShieldCheck, Clock, Layers, Calendar } from 'lucide-react';

const HealthExplanationModal = ({ isOpen, onClose, customer, intelligence }) => {
  if (!isOpen) return null;

  const score = customer?.relationshipHealthScore || intelligence?.relationshipHealthScore || 75;
  const breakdown = customer?.healthBreakdown || intelligence?.healthBreakdown || {};

  const dimensions = [
    {
      label: 'Engagement Score',
      weight: '25%',
      value: breakdown.engagement || customer?.engagementScore || 75,
      icon: Activity,
      color: 'bg-blue-500',
      description: 'Customer responsiveness and meeting/call reception quality.',
    },
    {
      label: 'Recency Metric',
      weight: '25%',
      value: breakdown.recency || 70,
      icon: Clock,
      color: 'bg-emerald-500',
      description: 'Elapsed days since the last documented interaction.',
    },
    {
      label: 'Interaction Frequency',
      weight: '15%',
      value: breakdown.interactionFrequency || 75,
      icon: Layers,
      color: 'bg-indigo-500',
      description: 'Cumulative touchpoint cadence over rolling 90-day window.',
    },
    {
      label: 'Follow-up Reliability',
      weight: '15%',
      value: breakdown.followupReliability || 80,
      icon: Calendar,
      color: 'bg-amber-500',
      description: 'Punctuality of completed vs overdue follow-up milestones.',
    },
    {
      label: 'Relationship Depth',
      weight: '10%',
      value: breakdown.relationshipDepth || 70,
      icon: Layers,
      color: 'bg-teal-500',
      description: 'Total active product holdings & total relationship value.',
    },
    {
      label: 'KYC & Compliance',
      weight: '10%',
      value: breakdown.kycCompliance || 100,
      icon: ShieldCheck,
      color: 'bg-sky-500',
      description: 'Regulatory identity verification and checklist status.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 text-base">
                Relationship Health Breakdown: {score} / 100
              </h3>
              <p className="text-xs text-slate-500">
                Transparent multi-factor score for {customer?.firstName} {customer?.lastName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Main Score Banner */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase text-slate-400">Current Health Indicator</span>
              <div className="text-2xl font-bold font-display text-slate-900 mt-0.5 flex items-baseline gap-2">
                <span>{score} <span className="text-sm font-normal text-slate-400">/ 100</span></span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  score >= 80 ? 'bg-emerald-100 text-emerald-800' : score >= 60 ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {customer?.relationshipStatus || 'Active'}
                </span>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500 max-w-[240px]">
              {breakdown.rationale || 'Derived using deterministic multi-variable relationship weights.'}
            </div>
          </div>

          {/* Metric Dimensions List */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Score Component Weightings</h4>

            {dimensions.map((dim) => {
              const Icon = dim.icon;
              return (
                <div key={dim.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-medium text-slate-800">
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{dim.label}</span>
                      <span className="text-[10px] text-slate-400">({dim.weight} weight)</span>
                    </div>
                    <span className="font-bold font-mono text-slate-900">{dim.value} / 100</span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${dim.color} transition-all duration-500 rounded-full`}
                      style={{ width: `${Math.min(100, Math.max(5, dim.value))}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400">{dim.description}</div>
                </div>
              );
            })}
          </div>

          {/* Disclaimer Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            <strong>Portfolio Disclosure:</strong> This is a deterministic demo Relationship Health Indicator designed for relationship management workflow prioritization.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthExplanationModal;
