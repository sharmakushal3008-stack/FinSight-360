import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  HeartPulse,
  AlertTriangle,
  Briefcase,
  CalendarCheck,
  TrendingUp,
  Zap,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Sparkles,
  ShieldCheck,
  Layers,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import api from '../services/api';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading RM Command Center...</p>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const topPriorities = data?.topPriorities || [];
  const recentSignals = data?.recentSignals || [];
  const followupQueue = data?.followupQueue || [];
  const pipelineStages = data?.pipelineStages || [];
  const segmentDistribution = data?.segmentDistribution || [];

  const healthData = [
    { name: 'Critical (<50)', count: data?.healthDistribution?.find((d) => d._id === 0)?.count || 0, color: '#EF4444' },
    { name: 'Needs Attention (50-69)', count: data?.healthDistribution?.find((d) => d._id === 40)?.count || 0, color: '#F59E0B' },
    { name: 'Good (70-79)', count: data?.healthDistribution?.find((d) => d._id === 60)?.count || 0, color: '#3B82F6' },
    { name: 'Champion (80+)', count: data?.healthDistribution?.find((d) => d._id === 80)?.count || 0, color: '#10B981' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 font-display">RM Command Center</h1>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
              Live Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Know Your Customers. Know What Matters Next.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboard}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/priority-center')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Open Priority Center</span>
          </button>
        </div>
      </div>

      {/* Fresh Portfolio Onboarding Banner if 0 customers */}
      {kpis.totalCustomers === 0 && (
        <div className="p-5 bg-linear-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-200/80 rounded-2xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold tracking-wider uppercase rounded-md">
                  Fresh Portfolio
                </span>
                <h2 className="text-base font-bold text-slate-900 font-display">
                  Welcome to Your FinSight 360 Workspace
                </h2>
              </div>
              <p className="text-xs text-slate-600 max-w-2xl">
                Your portfolio is ready and clean. Add your first Customer relationship or create a Lead to start tracking AI health scores, opportunity alerts, and automated call briefs.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate('/customers')}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                <span>+ Add Customer</span>
              </button>
              <button
                onClick={() => navigate('/leads')}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                <span>+ New Lead</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top 8 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Total Customers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Portfolio</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-display mt-1">
            {kpis.totalCustomers}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
            <span>Active: <strong className="text-emerald-700">{kpis.activeRelationships}</strong></span>
            <span>Dormant: <strong className="text-slate-700">{kpis.dormantCount}</strong></span>
          </div>
        </div>

        {/* Avg Health */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Health</span>
            <HeartPulse className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-display mt-1 flex items-baseline gap-1">
            <span>{kpis.averageRelationshipHealth}</span>
            <span className="text-xs font-normal text-slate-400">/ 100</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Portfolio Healthy Benchmark</span>
          </div>
        </div>

        {/* Needs Attention */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Attention Needed</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 font-display mt-1">
            {kpis.needingAttention}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Dormant or health drop risk
          </div>
        </div>

        {/* Open Opportunities */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Open Pipeline</span>
            <Briefcase className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-900 font-display mt-1">
            ₹{(kpis.totalOpportunityPipelineValue / 100000).toFixed(1)}L
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            across <strong>{kpis.openOpportunities}</strong> detected deals
          </div>
        </div>

        {/* Pending Follow-ups */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Tasks</span>
            <CalendarCheck className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-display mt-1">
            {kpis.pendingFollowUps}
          </div>
          <div className="text-[11px] text-rose-600 mt-0.5 font-medium">
            {kpis.overdueFollowUps > 0 ? `${kpis.overdueFollowUps} overdue tasks` : 'All tasks on schedule'}
          </div>
        </div>

        {/* New Leads */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">New Leads</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-teal-800 font-display mt-1">
            {kpis.newLeads}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Total active leads: {kpis.totalLeads}
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Conversion Rate</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-display mt-1">
            {kpis.conversionRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Lead to customer conversion
          </div>
        </div>

        {/* Avg Engagement */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Engagement</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-display mt-1 flex items-baseline gap-1">
            <span>{kpis.averageEngagement}</span>
            <span className="text-xs font-normal text-slate-400">/ 100</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Responsiveness index
          </div>
        </div>
      </div>

      {/* Main Grid: Priority Action List & Health Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Priorities Action List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-subtle p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display font-bold text-slate-900 text-sm">
                  Today's Top Relationship Priorities
                </h2>
                <p className="text-[11px] text-slate-500">
                  Deterministic "Why Today?" ranking derived from dormancy, overdue follow-ups, and detected needs
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/priority-center')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {topPriorities.length === 0 ? (
              <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Zap className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No Priority Items Yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
                  As you add customer relationships and log interactions, our deterministic engine will automatically calculate priority scores and recommend actions here.
                </p>
              </div>
            ) : (
              topPriorities.map((item, index) => (
                <div
                  key={item._id}
                  onClick={() => navigate(`/customers/${item._id}`)}
                  className="p-3.5 bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 hover:border-slate-300 rounded-xl cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                            {item.firstName} {item.lastName}
                          </span>
                          <span className="text-[11px] px-2 py-0.2 bg-white border border-slate-200 text-slate-600 rounded">
                            {item.segment}
                          </span>
                          <span className="text-xs text-slate-400">({item.city})</span>
                        </div>

                        {/* "Why" Reason bullet */}
                        <div className="mt-1 text-xs text-slate-600">
                          <span className="font-semibold text-slate-700">Why: </span>
                          <span>{item.priorityReasons?.[0] || 'Scheduled for quarterly relationship review'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        item.priorityClassification === 'High Priority'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {item.priorityClassification} ({item.priorityScore})
                      </span>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Health: <strong>{item.relationshipHealthScore}/100</strong>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Next Action Banner */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-blue-700">
                    <span className="font-medium">
                      Recommended Action: <span className="text-slate-800">{item.recommendedAction}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Relationship Health Distribution & Signals */}
        <div className="space-y-6">
          {/* Health Tier Chart */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5 space-y-3">
            <h3 className="font-display font-bold text-slate-900 text-sm">Portfolio Health Tiers</h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={healthData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F2744', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {healthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Signals Feed */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-900 text-sm">Relationship Signals</h3>
              <span className="text-[11px] text-slate-400">Live Triggers</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {recentSignals.length === 0 ? (
                <div className="text-center py-6 px-2 text-slate-400 text-xs">
                  No active signals detected.
                </div>
              ) : (
                recentSignals.map((sig) => (
                  <div
                    key={sig._id}
                    onClick={() => sig.customerId && navigate(`/customers/${sig.customerId._id}`)}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/70 text-xs cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{sig.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                        sig.severity === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {sig.severity}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-1">{sig.reason}</p>
                    <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                      <span>{sig.customerId?.firstName} {sig.customerId?.lastName}</span>
                      <span>{new Date(sig.detectedDate).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Follow-up Queue & Pipeline Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Follow-up Queue */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-blue-600" />
              <h3 className="font-display font-bold text-slate-900 text-sm">Follow-up Queue</h3>
            </div>
            <button
              onClick={() => navigate('/followups')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              View All ({kpis.pendingFollowUps || 0})
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {followupQueue.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No pending follow-ups scheduled.
              </div>
            ) : (
              followupQueue.map((f) => (
                <div key={f._id} className="py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">{f.title}</div>
                    <div className="text-[11px] text-slate-500">
                      Customer: <strong>{f.customerId?.firstName} {f.customerId?.lastName}</strong> • {f.purpose}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-medium text-slate-700">
                      {new Date(f.scheduledDate).toLocaleDateString('en-IN')}
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                      new Date(f.scheduledDate) < new Date() ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {new Date(f.scheduledDate) < new Date() ? 'Overdue' : 'Upcoming'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Customer Segment Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="font-display font-bold text-slate-900 text-sm">Portfolio Segmentation</h3>
            </div>
            <button
              onClick={() => navigate('/segments')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              Analyze Segments
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {segmentDistribution.length === 0 ? (
              <div className="col-span-2 text-center py-6 text-xs text-slate-400">
                No segment data available yet.
              </div>
            ) : (
              segmentDistribution.slice(0, 6).map((seg) => (
                <div
                  key={seg._id}
                  onClick={() => navigate('/segments')}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer transition-colors"
                >
                  <div className="text-xs font-bold text-slate-800">{seg._id}</div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                    <span>Count: <strong>{seg.count}</strong></span>
                    <span>Health: <strong>{Math.round(seg.avgHealth)}/100</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
