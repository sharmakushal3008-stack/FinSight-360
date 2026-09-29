import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Filter,
  Search,
  ArrowRight,
  Sparkles,
  Calendar,
  PhoneCall,
  ShieldAlert,
  HelpCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import CustomerBriefModal from '../components/CustomerBriefModal';
import HealthExplanationModal from '../components/HealthExplanationModal';

const PriorityCenterPage = () => {
  const navigate = useNavigate();
  const [priorities, setPriorities] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [classification, setClassification] = useState('All');
  const [segment, setSegment] = useState('All');
  const [city, setCity] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [briefData, setBriefData] = useState(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);

  const fetchPriorities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 15,
      });

      if (classification !== 'All') params.append('classification', classification);
      if (segment !== 'All') params.append('segment', segment);
      if (city !== 'All') params.append('city', city);
      if (search) params.append('search', search);

      const res = await api.get(`/priority-center?${params.toString()}`);
      if (res.data.success) {
        setPriorities(res.data.data.priorities || []);
        setStats(res.data.data.stats || {});
        setTotalPages(res.data.data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error('Failed to load priority center:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriorities();
  }, [classification, segment, city, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPriorities();
  };

  const handleGenerateBrief = async (customer, e) => {
    e.stopPropagation();
    setSelectedCustomer(customer);
    setBriefLoading(true);
    try {
      const res = await api.post(`/customers/${customer._id}/brief`);
      if (res.data.success) {
        setBriefData(res.data.data);
        setShowBriefModal(true);
      }
    } catch (err) {
      console.error('Failed to prepare customer brief:', err);
    } finally {
      setBriefLoading(false);
    }
  };

  const handleOpenHealthModal = (customer, e) => {
    e.stopPropagation();
    setSelectedCustomer(customer);
    setShowHealthModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-display">Priority Center</h1>
              <p className="text-xs text-slate-500">
                The "Why Today?" Action Engine for Relationship Managers
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPriorities}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Priority Level Stat Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => { setClassification('High Priority'); setPage(1); }}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            classification === 'High Priority'
              ? 'bg-rose-50 border-rose-300 shadow-sm ring-2 ring-rose-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">High Priority</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          </div>
          <div className="text-2xl font-bold text-rose-900 font-display mt-1">
            {stats.highPriority || 0}
          </div>
          <div className="text-[11px] text-rose-600 mt-0.5">Urgent outreach required</div>
        </button>

        <button
          onClick={() => { setClassification('Medium Priority'); setPage(1); }}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            classification === 'Medium Priority'
              ? 'bg-amber-50 border-amber-300 shadow-sm ring-2 ring-amber-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Medium Priority</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-2xl font-bold text-amber-900 font-display mt-1">
            {stats.mediumPriority || 0}
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5">Active signals / cross-sell</div>
        </button>

        <button
          onClick={() => { setClassification('Monitor'); setPage(1); }}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            classification === 'Monitor'
              ? 'bg-blue-50 border-blue-300 shadow-sm ring-2 ring-blue-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">Monitor</span>
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          </div>
          <div className="text-2xl font-bold text-blue-900 font-display mt-1">
            {stats.monitor || 0}
          </div>
          <div className="text-[11px] text-blue-600 mt-0.5">Track account behavior</div>
        </button>

        <button
          onClick={() => { setClassification('All'); setPage(1); }}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            classification === 'All'
              ? 'bg-slate-100 border-slate-400 shadow-sm ring-2 ring-slate-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">All Relationships</span>
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-display mt-1">
            {stats.totalCustomers || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Complete RM book of work</div>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search customer, ID, reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Segment Filter */}
          <select
            value={segment}
            onChange={(e) => { setSegment(e.target.value); setPage(1); }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="All">All Segments</option>
            <option value="Young Professional">Young Professional</option>
            <option value="Salaried">Salaried</option>
            <option value="Self-Employed">Self-Employed</option>
            <option value="High Value">High Value</option>
            <option value="Family Banking">Family Banking</option>
            <option value="Dormant">Dormant</option>
            <option value="New Customer">New Customer</option>
          </select>

          {/* City Filter */}
          <select
            value={city}
            onChange={(e) => { setCity(e.target.value); setPage(1); }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
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

      {/* Priority Action List Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Computing live priority rankings...</p>
        </div>
      ) : priorities.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
          No prioritized customers matching current filter criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {priorities.map((item, index) => {
            const isHigh = item.priorityClassification === 'High Priority';
            const isMed = item.priorityClassification === 'Medium Priority';

            return (
              <div
                key={item._id}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-subtle p-5 transition-all hover:shadow-card group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Customer Core Header */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      {(page - 1) * 15 + index + 1}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          onClick={() => navigate(`/customers/${item._id}`)}
                          className="font-display font-bold text-slate-900 text-base hover:text-blue-600 cursor-pointer transition-colors"
                        >
                          {item.firstName} {item.lastName}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
                          {item.segment}
                        </span>
                        <span className="text-xs text-slate-400">• ID: {item.customerId}</span>
                        <span className="text-xs text-slate-400">• {item.city}</span>
                      </div>

                      {/* "Why Today?" Explicit Reasoning List */}
                      <div className="mt-2 space-y-1">
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <span>Why Focus Today?</span>
                        </div>
                        <ul className="text-xs text-slate-600 space-y-0.5 pl-4 list-disc marker:text-amber-500">
                          {item.priorityReasons?.map((reason, rIdx) => (
                            <li key={rIdx} className="leading-relaxed">
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Priority Scores & Health Button */}
                  <div className="flex items-center gap-4 lg:flex-col lg:items-end lg:justify-center shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                        isHigh
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : isMed
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {item.priorityClassification} ({item.priorityScore})
                      </span>

                      <button
                        onClick={(e) => handleOpenHealthModal(item, e)}
                        className="text-xs text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-medium flex items-center gap-1 transition-colors"
                      >
                        <span>Health: <strong>{item.relationshipHealthScore}/100</strong></span>
                        <HelpCircle className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Last Contact: {item.lastInteraction ? new Date(item.lastInteraction).toLocaleDateString('en-IN') : 'No recorded history'}
                    </div>
                  </div>
                </div>

                {/* Recommended Action Box & Quick Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-lg">
                  <div className="text-xs text-slate-800">
                    <span className="font-bold text-blue-800">Recommended Action: </span>
                    <span className="font-medium text-slate-700">{item.recommendedAction}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleGenerateBrief(item, e)}
                      disabled={briefLoading}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Prepare Brief</span>
                    </button>

                    <button
                      onClick={() => navigate(`/customers/${item._id}`)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>Open 360</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      <CustomerBriefModal
        isOpen={showBriefModal}
        onClose={() => setShowBriefModal(false)}
        brief={briefData}
        customer={selectedCustomer}
      />

      <HealthExplanationModal
        isOpen={showHealthModal}
        onClose={() => setShowHealthModal(false)}
        customer={selectedCustomer}
      />
    </div>
  );
};

export default PriorityCenterPage;
