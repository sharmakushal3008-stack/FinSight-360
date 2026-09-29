import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Filter,
  Users,
  ShieldCheck,
  AlertTriangle,
  Zap,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
} from 'recharts';
import api from '../services/api';

const RelationshipRadarPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [segment, setSegment] = useState('All');
  const [city, setCity] = useState('All');
  const [selectedQuadrant, setSelectedQuadrant] = useState('All');

  const fetchRadar = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (segment !== 'All') params.append('segment', segment);
      if (city !== 'All') params.append('city', city);

      const res = await api.get(`/relationship-radar?${params.toString()}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error loading relationship radar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRadar();
  }, [segment, city]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Scanning Relationship Radar...</p>
      </div>
    );
  }

  const customers = data?.customers || [];
  const quadrants = data?.quadrants || {};

  // Format scatter data
  const scatterData = customers.map((c) => ({
    id: c._id,
    name: `${c.firstName} ${c.lastName}`,
    segment: c.segment,
    city: c.city,
    health: c.relationshipHealthScore || 70,
    engagement: c.engagementScore || 65,
    value: c.totalRelationshipValue || 500000,
  }));

  const filteredCustomers = customers.filter((c) => {
    if (selectedQuadrant === 'Champions') return c.relationshipHealthScore >= 75 && c.engagementScore >= 70;
    if (selectedQuadrant === 'Dormant') return c.relationshipHealthScore < 50 && c.engagementScore < 55;
    if (selectedQuadrant === 'Needs Attention') return c.relationshipHealthScore < 65 && (c.engagementScore >= 55 || c.relationshipHealthScore >= 50);
    if (selectedQuadrant === 'High Opportunity') return c.relationshipHealthScore >= 65 && c.engagementScore < 70;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-display">Relationship Radar</h1>
              <p className="text-xs text-slate-500">
                Multi-dimensional portfolio matrix mapping Health vs. Engagement vs. Value
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-2xs"
          >
            <option value="All">All Segments</option>
            <option value="Young Professional">Young Professional</option>
            <option value="Salaried">Salaried</option>
            <option value="Self-Employed">Self-Employed</option>
            <option value="High Value">High Value</option>
            <option value="Family Banking">Family Banking</option>
            <option value="Dormant">Dormant</option>
          </select>

          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-2xs"
          >
            <option value="All">All Cities</option>
            <option value="Jaipur">Jaipur</option>
            <option value="Delhi">Delhi</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Pune">Pune</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Chennai">Chennai</option>
          </select>
        </div>
      </div>

      {/* 4 Quadrant Selector Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <button
          onClick={() => setSelectedQuadrant(selectedQuadrant === 'Champions' ? 'All' : 'Champions')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedQuadrant === 'Champions'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Champions</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-900 font-display mt-1">
            {quadrants.championsCount || 0}
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5">High Health • High Engagement</div>
        </button>

        <button
          onClick={() => setSelectedQuadrant(selectedQuadrant === 'High Opportunity' ? 'All' : 'High Opportunity')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedQuadrant === 'High Opportunity'
              ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">High Opportunity</span>
            <Zap className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-900 font-display mt-1">
            {quadrants.highOpportunityCount || 0}
          </div>
          <div className="text-[11px] text-indigo-700 mt-0.5">High Health • Expansion Potential</div>
        </button>

        <button
          onClick={() => setSelectedQuadrant(selectedQuadrant === 'Needs Attention' ? 'All' : 'Needs Attention')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedQuadrant === 'Needs Attention'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Needs Attention</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-900 font-display mt-1">
            {quadrants.needsAttentionCount || 0}
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5">Sub-optimal Health • Action Needed</div>
        </button>

        <button
          onClick={() => setSelectedQuadrant(selectedQuadrant === 'Dormant' ? 'All' : 'Dormant')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedQuadrant === 'Dormant'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">Dormant</span>
            <ShieldCheck className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-900 font-display mt-1">
            {quadrants.dormantCount || 0}
          </div>
          <div className="text-[11px] text-rose-700 mt-0.5">Low Health • Inactive &gt;60 Days</div>
        </button>
      </div>

      {/* Scatter Matrix Chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-sm">
              Portfolio Scatter Distribution: Health (X) vs Engagement (Y)
            </h3>
            <p className="text-xs text-slate-500">Bubble size indicates Total Relationship Value</p>
          </div>
          <div className="text-xs text-slate-400">
            Plotting {scatterData.length} Relationships
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
              <XAxis
                type="number"
                dataKey="health"
                name="Health Score"
                domain={[20, 100]}
                unit=" pts"
                tick={{ fontSize: 10, fill: '#64748B' }}
              />
              <YAxis
                type="number"
                dataKey="engagement"
                name="Engagement Score"
                domain={[20, 100]}
                unit=" pts"
                tick={{ fontSize: 10, fill: '#64748B' }}
              />
              <ZAxis type="number" dataKey="value" range={[50, 400]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#0F2744] text-white p-3 rounded-lg shadow-xl text-xs space-y-1">
                        <div className="font-bold text-sm">{data.name}</div>
                        <div className="text-slate-300">{data.segment} • {data.city}</div>
                        <div className="pt-1 border-t border-slate-700 text-[11px]">
                          Health: <strong>{data.health}/100</strong> | Engagement: <strong>{data.engagement}/100</strong>
                        </div>
                        <div className="text-amber-300 font-mono text-[11px]">
                          Value: ₹{data.value?.toLocaleString('en-IN')}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Customers" data={scatterData}>
                {scatterData.map((entry, index) => {
                  let fillColor = '#3B82F6';
                  if (entry.health >= 75 && entry.engagement >= 70) fillColor = '#10B981';
                  else if (entry.health < 50 && entry.engagement < 55) fillColor = '#EF4444';
                  else if (entry.health < 65) fillColor = '#F59E0B';
                  else fillColor = '#8B5CF6';

                  return <Cell key={`cell-${index}`} fill={fillColor} />;
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quadrant Filtered Customer Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-display font-bold text-slate-900 text-sm">
            Quadrant Drilldown: <span className="text-blue-600">{selectedQuadrant}</span> ({filteredCustomers.length})
          </h3>
          <span className="text-xs text-slate-400">Click row to open Customer 360</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="table-header">Customer</th>
                <th className="table-header">Segment</th>
                <th className="table-header">City</th>
                <th className="table-header">Health</th>
                <th className="table-header">Engagement</th>
                <th className="table-header">Total Value</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((c) => (
                <tr
                  key={c._id}
                  onClick={() => navigate(`/customers/${c._id}`)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="table-cell font-semibold text-slate-900">
                    {c.firstName} {c.lastName}
                  </td>
                  <td className="table-cell text-xs text-slate-600">{c.segment}</td>
                  <td className="table-cell text-xs text-slate-600">{c.city}</td>
                  <td className="table-cell font-mono font-bold text-slate-900 text-xs">
                    {c.relationshipHealthScore}/100
                  </td>
                  <td className="table-cell font-mono text-slate-700 text-xs">
                    {c.engagementScore}/100
                  </td>
                  <td className="table-cell font-mono font-bold text-blue-950 text-xs">
                    ₹{(c.totalRelationshipValue || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="table-cell text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/customers/${c._id}`);
                      }}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded font-medium flex items-center gap-1 ml-auto"
                    >
                      <span>360</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RelationshipRadarPage;
