import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Plus,
  Filter,
  ArrowRight,
  UserPlus,
  ChevronRight,
  CheckCircle2,
  Trash2,
  Loader2,
  X,
} from 'lucide-react';
import api from '../services/api';

const LeadsPage = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [city, setCity] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // New Lead Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Jaipur',
    requirement: '',
    productCategory: 'Vehicle Financing',
    priority: 'High',
    estimatedValue: 1200000,
    source: 'Digital Campaign',
    segment: 'Salaried',
    notes: '',
  });

  // Conversion Confirmation Modal
  const [convertingLead, setConvertingLead] = useState(null);
  const [converting, setConverting] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 15,
      });

      if (status !== 'All') params.append('status', status);
      if (priority !== 'All') params.append('priority', priority);
      if (city !== 'All') params.append('city', city);
      if (search) params.append('search', search);

      const res = await api.get(`/leads?${params.toString()}`);
      if (res.data.success) {
        setLeads(res.data.data.leads || []);
        setTotalPages(res.data.data.pagination?.pages || 1);
        setTotalCount(res.data.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [status, priority, city, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/leads', {
        ...formData,
        estimatedValue: Number(formData.estimatedValue),
      });
      if (res.data.success) {
        setShowAddModal(false);
        fetchLeads();
      }
    } catch (err) {
      console.error('Create lead failed:', err);
    }
  };

  const handleConvertLead = async () => {
    if (!convertingLead) return;
    setConverting(true);
    try {
      const res = await api.post(`/leads/${convertingLead._id}/convert`);
      if (res.data.success) {
        setConvertingLead(null);
        fetchLeads();
        navigate(`/customers/${res.data.data.customer._id}`);
      }
    } catch (err) {
      console.error('Lead conversion failed:', err);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Lead Management</h1>
          <p className="text-xs text-slate-500">
            Prospective banking clients and product inquiries ({totalCount})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/pipeline')}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Kanban Pipeline
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status */}
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="QUALIFIED">QUALIFIED</option>
            <option value="PROPOSAL">PROPOSAL</option>
            <option value="DOCUMENTATION">DOCUMENTATION</option>
            <option value="CONVERTED">CONVERTED</option>
            <option value="LOST">LOST</option>
          </select>

          {/* Priority */}
          <select
            value={priority}
            onChange={(e) => { setPriority(e.target.value); setPage(1); }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* City */}
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
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="table-header">Lead Name & ID</th>
                <th className="table-header">Requirement</th>
                <th className="table-header">Est. Value</th>
                <th className="table-header">City / Source</th>
                <th className="table-header">Priority</th>
                <th className="table-header">Status</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
                    <span className="text-xs text-slate-500">Loading leads...</span>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400 text-xs">
                    No leads found matching criteria.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50 transition-colors">
                    <td className="table-cell font-semibold text-slate-900">
                      <div>{lead.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{lead.leadId} • {lead.phone}</div>
                    </td>

                    <td className="table-cell">
                      <div className="text-xs font-medium text-slate-800">{lead.requirement}</div>
                      <div className="text-[10px] text-slate-400">{lead.productCategory}</div>
                    </td>

                    <td className="table-cell font-mono font-bold text-slate-900 text-xs">
                      ₹{lead.estimatedValue?.toLocaleString('en-IN')}
                    </td>

                    <td className="table-cell text-xs text-slate-600">
                      <div>{lead.city}</div>
                      <div className="text-[10px] text-slate-400">{lead.source}</div>
                    </td>

                    <td className="table-cell">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        lead.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {lead.priority}
                      </span>
                    </td>

                    <td className="table-cell">
                      <span className={`text-xs px-2.5 py-0.5 rounded font-semibold ${
                        lead.status === 'CONVERTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : lead.status === 'LOST'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {lead.status}
                      </span>
                    </td>

                    <td className="table-cell text-right">
                      {lead.status === 'CONVERTED' && lead.customerId ? (
                        <button
                          onClick={() => navigate(`/customers/${lead.customerId._id || lead.customerId}`)}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold hover:bg-emerald-100 ml-auto"
                        >
                          View Customer 360
                        </button>
                      ) : (
                        <button
                          onClick={() => setConvertingLead(lead)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-semibold flex items-center gap-1 ml-auto"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Convert to Customer</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Showing page {page} of {totalPages} ({totalCount} total)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Convert to Customer Modal */}
      {convertingLead && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900 text-base">
                  Convert Lead to Active Customer
                </h3>
                <p className="text-xs text-slate-500">Establish full Customer 360 relationship record</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div><strong>Lead:</strong> {convertingLead.name} ({convertingLead.email})</div>
              <div><strong>Requirement:</strong> {convertingLead.requirement}</div>
              <div><strong>Initial Relationship Value:</strong> ₹{convertingLead.estimatedValue?.toLocaleString('en-IN')}</div>
            </div>

            <p className="text-xs text-slate-600">
              This will create a new Customer document, initialize the primary product, generate an initial KYC verification record, and trigger relationship intelligence scoring.
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setConvertingLead(null)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConvertLead}
                disabled={converting}
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 flex items-center gap-1.5"
              >
                {converting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Confirm Conversion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-900 text-base">Add New Lead</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">City</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1"
                  >
                    <option value="Jaipur">Jaipur</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Pune">Pune</option>
                    <option value="Bengaluru">Bengaluru</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Requirement Description</label>
                <input
                  type="text"
                  required
                  value={formData.requirement}
                  onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                  placeholder="e.g. Electric Sedan Financing"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Product Category</label>
                  <select
                    value={formData.productCategory}
                    onChange={(e) => setFormData({ ...formData, productCategory: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1"
                  >
                    <option value="Vehicle Financing">Vehicle Financing</option>
                    <option value="Home Financing">Home Financing</option>
                    <option value="Wealth & Investments">Wealth & Investments</option>
                    <option value="Credit Cards">Credit Cards</option>
                    <option value="Savings & Deposits">Savings & Deposits</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Est. Value (₹)</label>
                  <input
                    type="number"
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
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
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsPage;
