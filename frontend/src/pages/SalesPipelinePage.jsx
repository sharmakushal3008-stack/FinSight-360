import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Kanban,
  Plus,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  ChevronRight,
  UserPlus,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';

const stages = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'DOCUMENTATION', 'CONVERTED', 'LOST'];

const stageColors = {
  NEW: 'border-t-blue-500 bg-blue-50/20',
  CONTACTED: 'border-t-sky-500 bg-sky-50/20',
  QUALIFIED: 'border-t-indigo-500 bg-indigo-50/20',
  PROPOSAL: 'border-t-purple-500 bg-purple-50/20',
  DOCUMENTATION: 'border-t-amber-500 bg-amber-50/20',
  CONVERTED: 'border-t-emerald-500 bg-emerald-50/20',
  LOST: 'border-t-slate-400 bg-slate-50/20',
};

const SalesPipelinePage = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPipeline = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leads?limit=150');
      if (res.data.success) {
        setLeads(res.data.data.leads || []);
      }
    } catch (err) {
      console.error('Failed to load pipeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  const handleMoveStage = async (leadId, nextStatus) => {
    try {
      // Optimistic update
      setLeads((prev) =>
        prev.map((l) => (l._id === leadId ? { ...l, status: nextStatus } : l))
      );
      await api.put(`/leads/${leadId}/status`, { status: nextStatus });
    } catch (err) {
      console.error('Failed to move stage:', err);
      fetchPipeline();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading Kanban Sales Pipeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Kanban className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-display">Sales Pipeline</h1>
              <p className="text-xs text-slate-500">
                Interactive Kanban pipeline for deal structuring and progression
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPipeline}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/leads')}
            className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
          >
            Lead Table View
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[70vh]">
        {stages.map((stage, sIdx) => {
          const stageLeads = leads.filter((l) => l.status === stage);
          const totalStageVal = stageLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

          return (
            <div
              key={stage}
              className={`w-72 shrink-0 bg-white rounded-xl border border-slate-200 shadow-subtle flex flex-col max-h-[80vh] border-t-4 ${stageColors[stage]}`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{stage}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full font-bold">
                      {stageLeads.length}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    ₹{(totalStageVal / 100000).toFixed(1)}L Total
                  </div>
                </div>
              </div>

              {/* Cards List */}
              <div className="p-2.5 overflow-y-auto space-y-2.5 flex-1">
                {stageLeads.length === 0 ? (
                  <div className="text-center py-8 text-slate-300 text-xs italic">
                    No leads in {stage}
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead._id}
                      className="p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 shadow-2xs space-y-2 group transition-all"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="font-semibold text-slate-900 text-xs leading-tight">
                          {lead.name}
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                          lead.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {lead.priority}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 leading-snug">
                        {lead.requirement}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                        <span className="font-bold text-indigo-950 font-mono">
                          ₹{lead.estimatedValue?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400">{lead.city}</span>
                      </div>

                      {/* Stage Move Controls */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-[10px]">
                        {sIdx > 0 ? (
                          <button
                            onClick={() => handleMoveStage(lead._id, stages[sIdx - 1])}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 flex items-center gap-0.5"
                            title={`Move back to ${stages[sIdx - 1]}`}
                          >
                            <ArrowLeft className="w-3 h-3" />
                            <span>Prev</span>
                          </button>
                        ) : (
                          <span></span>
                        )}

                        {sIdx < stages.length - 1 && (
                          <button
                            onClick={() => handleMoveStage(lead._id, stages[sIdx + 1])}
                            className="p-1 hover:bg-blue-50 text-blue-600 hover:text-blue-800 rounded font-semibold flex items-center gap-0.5 ml-auto"
                            title={`Advance to ${stages[sIdx + 1]}`}
                          >
                            <span>Next</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SalesPipelinePage;
