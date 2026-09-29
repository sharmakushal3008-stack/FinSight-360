import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Users,
  HeartPulse,
  Sparkles,
  TrendingUp,
  ChevronRight,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import api from '../services/api';

const segmentDescriptions = {
  'Young Professional': 'Early to mid-career tech, consulting, and corporate individuals with high career mobility and aspirational credit/auto goals.',
  'Salaried': 'Established corporate and government salaried individuals with recurring payroll deposits and primary mortgage needs.',
  'Self-Employed': 'Business owners, entrepreneurs, and independent professionals requiring high liquidity, merchant services, and tax planning.',
  'High Value': 'Affluent relationships with high portfolio balances (&gt;₹50L), wealth management advisory, and premium concierge credit cards.',
  'Family Banking': 'Multi-generational household accounts with education savings trusts, child portfolios, and term life protection.',
  'New Customer': 'Onboarded within the rolling 60-day window. Critical onboarding window for engagement activation.',
  'Dormant': 'Inactive accounts with no customer touchpoint for &gt;60 days. High churn risk requiring re-engagement outreach.',
};

const SegmentationPage = () => {
  const navigate = useNavigate();
  const [segments, setSegments] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState('High Value');
  const [segmentCustomers, setSegmentCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setSegments(res.data.data.segmentDistribution || []);
      }
    } catch (err) {
      console.error('Failed to load segments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSegmentCustomers = async (segName) => {
    try {
      setLoadingCustomers(true);
      const res = await api.get(`/customers?segment=${encodeURIComponent(segName)}&limit=20`);
      if (res.data.success) {
        setSegmentCustomers(res.data.data.customers || []);
      }
    } catch (err) {
      console.error('Failed to load segment customers:', err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  useEffect(() => {
    if (selectedSegment) {
      fetchSegmentCustomers(selectedSegment);
    }
  }, [selectedSegment]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Analyzing Customer Segments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">Customer Segmentation</h1>
            <p className="text-xs text-slate-500">
              Live portfolio breakdown across demographic and relationship segments
            </p>
          </div>
        </div>
      </div>

      {/* Segment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.map((seg) => {
          const isSelected = selectedSegment === seg._id;

          return (
            <div
              key={seg._id}
              onClick={() => setSelectedSegment(seg._id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-blue-50/50 border-blue-400 shadow-md ring-2 ring-blue-200'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-subtle hover:shadow-card'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-base">{seg._id}</h3>
                  <div className="text-2xl font-bold text-slate-900 font-display mt-1">
                    {seg.count} <span className="text-xs font-normal text-slate-400">clients</span>
                  </div>
                </div>

                <span className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold shadow-2xs">
                  {Math.round(seg.avgHealth)} / 100 Health
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                {segmentDescriptions[seg._id] || 'Target banking segment.'}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Total Value: <strong className="text-slate-900 font-mono">₹{((seg.totalValue || 0) / 100000).toFixed(1)}L</strong></span>
                <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                  <span>Drilldown</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Segment Customer Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden space-y-3 p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-sm">
              Drilldown: <span className="text-blue-600">{selectedSegment}</span> Segment Portfolio
            </h3>
            <p className="text-xs text-slate-500">{segmentDescriptions[selectedSegment]}</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {segmentCustomers.length} Customers Loaded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="table-header">Customer Name & ID</th>
                <th className="table-header">City / Occupation</th>
                <th className="table-header">Relationship Health</th>
                <th className="table-header">Priority</th>
                <th className="table-header">Portfolio Value</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingCustomers ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-xs text-slate-500">
                    Loading segment relationships...
                  </td>
                </tr>
              ) : segmentCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-xs text-slate-400">
                    No customers found in this segment.
                  </td>
                </tr>
              ) : (
                segmentCustomers.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => navigate(`/customers/${c._id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="table-cell">
                      <div className="font-semibold text-slate-900">{c.firstName} {c.lastName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{c.customerId}</div>
                    </td>

                    <td className="table-cell text-xs text-slate-600">
                      <div>{c.city}</div>
                      <div className="text-[10px] text-slate-400">{c.occupation}</div>
                    </td>

                    <td className="table-cell">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {c.relationshipHealthScore}/100
                      </span>
                    </td>

                    <td className="table-cell">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        c.priorityClassification === 'High Priority' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {c.priorityClassification}
                      </span>
                    </td>

                    <td className="table-cell font-mono font-bold text-xs text-slate-900">
                      ₹{(c.totalRelationshipValue || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="table-cell text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customers/${c._id}`);
                        }}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded font-medium ml-auto flex items-center gap-1"
                      >
                        <span>Customer 360</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SegmentationPage;
