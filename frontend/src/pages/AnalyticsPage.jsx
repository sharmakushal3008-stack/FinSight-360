import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  CalendarCheck,
  HeartPulse,
  Filter,
  PieChart as PieIcon,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
} from 'recharts';
import api from '../services/api';

const AnalyticsPage = () => {
  const [timeframe, setTimeframe] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/analytics/dashboard?timeframe=${timeframe}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Computing Portfolio Analytics & Trends...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const funnel = data?.funnel || [];
  const healthTiers = data?.healthTiers || [];
  const productDistribution = data?.productDistribution || [];
  const opportunityBreakdown = data?.opportunityBreakdown || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-display">Executive Analytics</h1>
              <p className="text-xs text-slate-500">
                Portfolio health trends, pipeline velocity, and product cross-sell performance
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: '90d', label: '90 Days' },
            { id: '6m', label: '6 Months' },
            { id: '1y', label: '1 Year' },
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeframe === tf.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="text-xs font-semibold text-slate-500 uppercase">New Clients ({timeframe})</div>
          <div className="text-2xl font-bold text-slate-900 font-display mt-1">
            {metrics.newCustomersInPeriod || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Total portfolio: {metrics.totalCustomers}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="text-xs font-semibold text-slate-500 uppercase">Lead Conversion</div>
          <div className="text-2xl font-bold text-emerald-700 font-display mt-1">
            {metrics.conversionRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{metrics.convertedLeads} converted leads</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="text-xs font-semibold text-slate-500 uppercase">Task Reliability</div>
          <div className="text-2xl font-bold text-blue-700 font-display mt-1">
            {metrics.followUpSuccessRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{metrics.followupsCompleted} follow-ups completed</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="text-xs font-semibold text-slate-500 uppercase">Opportunity Pipeline</div>
          <div className="text-2xl font-bold text-indigo-900 font-display mt-1">
            ₹{((metrics.opportunityPipelineValue || 0) / 100000).toFixed(1)}L
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{metrics.opportunityCount} active deals</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Conversion Funnel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5 space-y-4">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-sm">Lead Conversion Funnel</h3>
            <p className="text-xs text-slate-500">Pipeline stage distribution</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="stage" tick={{ fontSize: 9, fill: '#64748B' }} interval={0} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F2744', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portfolio Health Tier Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5 space-y-4">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-sm">Relationship Health Distribution</h3>
            <p className="text-xs text-slate-500">Breakdown of customer portfolio health tiers</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={healthTiers} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#64748B' }} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F2744', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {healthTiers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Adoption Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5 space-y-4">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-sm">Product Penetration & Adoption</h3>
            <p className="text-xs text-slate-500">Active account categories held by customers</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productDistribution} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="category" tick={{ fontSize: 9, fill: '#64748B' }} interval={0} angle={-20} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F2744', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#0D9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Opportunity Breakdown by Category */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5 space-y-4">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-sm">Opportunity Pipeline by Solution</h3>
            <p className="text-xs text-slate-500">Pipeline volume across product categories</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={opportunityBreakdown} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="category" tick={{ fontSize: 9, fill: '#64748B' }} interval={0} angle={-20} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F2744', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
