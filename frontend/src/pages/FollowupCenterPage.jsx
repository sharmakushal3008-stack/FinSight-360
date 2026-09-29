import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Loader2,
  X,
} from 'lucide-react';
import api from '../services/api';

const FollowupCenterPage = () => {
  const navigate = useNavigate();
  const [followups, setFollowups] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [priority, setPriority] = useState('All');
  const [search, setSearch] = useState('');

  // Add Follow-up modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [customersList, setCustomersList] = useState([]);
  const [formData, setFormData] = useState({
    customerId: '',
    title: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '11:00 AM',
    purpose: 'Relationship Review',
    priority: 'High',
    notes: '',
  });

  // Complete modal
  const [completingItem, setCompletingItem] = useState(null);
  const [outcomeNotes, setOutcomeNotes] = useState('');

  const fetchFollowups = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ filter });
      if (priority !== 'All') params.append('priority', priority);
      if (search) params.append('search', search);

      const res = await api.get(`/followups?${params.toString()}`);
      if (res.data.success) {
        setFollowups(res.data.data.followups || []);
        setStats(res.data.data.stats || {});
      }
    } catch (err) {
      console.error('Failed to load follow-ups:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await api.get('/customers?limit=100');
      if (res.data.success) {
        setCustomersList(res.data.data.customers || []);
        if (res.data.data.customers?.length > 0) {
          setFormData((prev) => ({ ...prev, customerId: res.data.data.customers[0]._id }));
        }
      }
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, [filter, priority]);

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFollowups();
  };

  const handleCreateFollowup = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/followups', formData);
      if (res.data.success) {
        setShowAddModal(false);
        fetchFollowups();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!completingItem) return;
    try {
      await api.put(`/followups/${completingItem._id}/complete`, {
        outcome: outcomeNotes || 'Follow-up completed successfully.',
      });
      setCompletingItem(null);
      setOutcomeNotes('');
      fetchFollowups();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Follow-up Center</h1>
          <p className="text-xs text-slate-500">
            Punctuality and commitment tracking for relationship management
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Task</span>
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
            filter === 'all'
              ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>All Tasks</span>
          <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded-full font-bold">
            {stats.total || 0}
          </span>
        </button>

        <button
          onClick={() => setFilter('today')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
            filter === 'today'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Today's Follow-ups</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${filter === 'today' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {stats.todayCount || 0}
          </span>
        </button>

        <button
          onClick={() => setFilter('overdue')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
            filter === 'overdue'
              ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-2xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Overdue Tasks</span>
          <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded-full font-bold">
            {stats.overdueCount || 0}
          </span>
        </button>

        <button
          onClick={() => setFilter('upcoming')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
            filter === 'upcoming'
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Upcoming</span>
          <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full font-bold">
            {stats.upcomingCount || 0}
          </span>
        </button>

        <button
          onClick={() => setFilter('completed')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
            filter === 'completed'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Completed</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
            {stats.completedCount || 0}
          </span>
        </button>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5 space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
            <span className="text-xs text-slate-500">Loading follow-ups...</span>
          </div>
        ) : followups.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No follow-ups matching current filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {followups.map((fol) => {
              const isOverdue = fol.status === 'Pending' && new Date(fol.scheduledDate) < new Date();

              return (
                <div key={fol._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">{fol.title}</span>
                      <span className={`text-[10px] px-2 py-0.2 rounded font-bold uppercase tracking-wider ${
                        fol.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {fol.priority}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3">
                      <span>Customer: <strong className="text-slate-700">{fol.customerId?.firstName} {fol.customerId?.lastName}</strong></span>
                      <span>Purpose: <strong className="text-slate-700">{fol.purpose}</strong></span>
                      <span>Time: <strong>{new Date(fol.scheduledDate).toLocaleDateString('en-IN')} at {fol.scheduledTime}</strong></span>
                    </div>

                    {fol.notes && <p className="text-xs text-slate-600 italic">"{fol.notes}"</p>}
                    {fol.outcome && (
                      <p className="text-[11px] text-emerald-700 font-medium">Outcome: {fol.outcome}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2.5 py-0.5 rounded font-medium ${
                      fol.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : isOverdue
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isOverdue ? 'Overdue' : fol.status}
                    </span>

                    {fol.status !== 'Completed' && (
                      <button
                        onClick={() => setCompletingItem(fol)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                    )}

                    {fol.customerId && (
                      <button
                        onClick={() => navigate(`/customers/${fol.customerId._id || fol.customerId}`)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                      >
                        360
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Complete Task Modal */}
      {completingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 p-6 space-y-4">
            <h3 className="font-display font-bold text-slate-900 text-base">Complete Follow-up Task</h3>
            <p className="text-xs text-slate-500">"{completingItem.title}" with {completingItem.customerId?.firstName} {completingItem.customerId?.lastName}</p>

            <form onSubmit={handleCompleteSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Call Outcome / Next Steps</label>
                <textarea
                  required
                  rows="3"
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  placeholder="Record customer response and commitments agreed upon..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingItem(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                >
                  Confirm Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-900 text-base">Schedule New Task</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFollowup} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Select Customer</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1"
                >
                  {customersList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.firstName} {c.lastName} ({c.customerId} • {c.segment})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Task Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Deposit Renewal Discussion"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Time</label>
                  <input
                    type="text"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Purpose</label>
                  <select
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1"
                  >
                    <option value="Relationship Review">Relationship Review</option>
                    <option value="Vehicle Loan Discussion">Vehicle Loan Discussion</option>
                    <option value="Home Loan Consultation">Home Loan Consultation</option>
                    <option value="Wealth & Investment Advisory">Wealth & Investment Advisory</option>
                    <option value="Deposit Renewal">Deposit Renewal</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowupCenterPage;
