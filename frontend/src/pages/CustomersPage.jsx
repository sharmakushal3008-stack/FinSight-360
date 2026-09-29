import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  HeartPulse,
  Sparkles,
  Loader2,
  X,
} from 'lucide-react';
import api from '../services/api';
import CustomerBriefModal from '../components/CustomerBriefModal';

const CustomersPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState('All');
  const [city, setCity] = useState('All');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [sortBy, setSortBy] = useState('priorityScore');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // New Customer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: 'Jaipur',
    occupation: 'Software Engineer',
    age: 30,
    incomeRange: '10-25 LPA',
    segment: 'Young Professional',
  });

  // Brief modal state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [briefData, setBriefData] = useState(null);
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [briefLoading, setBriefLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 15,
        sortBy,
        order,
      });

      if (search) params.append('search', search);
      if (segment !== 'All') params.append('segment', segment);
      if (city !== 'All') params.append('city', city);
      if (status !== 'All') params.append('status', status);
      if (priority !== 'All') params.append('priority', priority);

      const res = await api.get(`/customers?${params.toString()}`);
      if (res.data.success) {
        setCustomers(res.data.data.customers || []);
        setTotalPages(res.data.data.pagination?.pages || 1);
        setTotalCount(res.data.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [segment, city, status, priority, sortBy, order, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/customers', {
        ...formData,
        age: Number(formData.age),
        existingProducts: [
          {
            productName: 'Premier Advantage Savings',
            category: 'Savings & Deposits',
            accountNumber: `ACC-${Math.floor(1000000 + Math.random() * 9000000)}`,
            balanceOrLimit: 250000,
            status: 'Active',
          },
        ],
      });

      if (res.data.success) {
        setShowAddModal(false);
        fetchCustomers();
        navigate(`/customers/${res.data.data._id}`);
      }
    } catch (err) {
      console.error('Create customer failed:', err);
      alert(err.response?.data?.message || 'Failed to create customer');
    } finally {
      setCreating(false);
    }
  };

  const handlePrepareBrief = async (cust, e) => {
    e.stopPropagation();
    setSelectedCustomer(cust);
    setBriefLoading(true);
    try {
      const res = await api.post(`/customers/${cust._id}/brief`);
      if (res.data.success) {
        setBriefData(res.data.data);
        setShowBriefModal(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBriefLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Customer Portfolio</h1>
          <p className="text-xs text-slate-500">
            Total active banking relationships ({totalCount})
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer Profile</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, ID, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Segment */}
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
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Chennai">Chennai</option>
          </select>

          {/* Priority */}
          <select
            value={priority}
            onChange={(e) => { setPriority(e.target.value); setPage(1); }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="High Priority">High Priority</option>
            <option value="Medium Priority">Medium Priority</option>
            <option value="Monitor">Monitor</option>
            <option value="Low Priority">Low Priority</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="priorityScore">Sort by Priority</option>
            <option value="relationshipHealthScore">Sort by Health</option>
            <option value="engagementScore">Sort by Engagement</option>
            <option value="customerSince">Sort by Tenure</option>
          </select>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="table-header">Customer Name & ID</th>
                <th className="table-header">Segment</th>
                <th className="table-header">City</th>
                <th className="table-header">Health Score</th>
                <th className="table-header">Priority</th>
                <th className="table-header">KYC</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
                    <span className="text-xs text-slate-500">Loading portfolio directory...</span>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400 text-xs">
                    No customers found matching filter criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => navigate(`/customers/${c._id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="table-cell">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {c.firstName} {c.lastName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {c.customerId} • {c.occupation}
                      </div>
                    </td>

                    <td className="table-cell">
                      <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {c.segment}
                      </span>
                    </td>

                    <td className="table-cell text-slate-600 text-xs font-medium">
                      {c.city}
                    </td>

                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold font-mono ${
                          c.relationshipHealthScore >= 80 ? 'text-emerald-700' : c.relationshipHealthScore >= 60 ? 'text-blue-700' : 'text-rose-700'
                        }`}>
                          {c.relationshipHealthScore}/100
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                          c.relationshipStatus === 'Dormant' ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {c.relationshipStatus}
                        </span>
                      </div>
                    </td>

                    <td className="table-cell">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        c.priorityClassification === 'High Priority'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : c.priorityClassification === 'Medium Priority'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {c.priorityClassification} ({c.priorityScore})
                      </span>
                    </td>

                    <td className="table-cell">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        c.kycStatus === 'Verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {c.kycStatus}
                      </span>
                    </td>

                    <td className="table-cell text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => handlePrepareBrief(c, e)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded font-medium flex items-center gap-1 shadow-2xs"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          <span>Brief</span>
                        </button>
                        <button
                          onClick={() => navigate(`/customers/${c._id}`)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded font-medium flex items-center gap-0.5"
                        >
                          <span>360</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
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

      {/* Add New Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-900 text-base">
                Create New Customer Relationship
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1 focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Kushagra"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1 focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Sharma"
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
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1 focus:outline-none focus:border-blue-500"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1 focus:outline-none focus:border-blue-500"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">City</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1 focus:outline-none"
                  >
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

                <div>
                  <label className="text-xs font-semibold text-slate-700">Age</label>
                  <input
                    type="number"
                    min="18"
                    max="90"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Segment</label>
                  <select
                    value={formData.segment}
                    onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1 focus:outline-none"
                  >
                    <option value="Young Professional">Young Professional</option>
                    <option value="Salaried">Salaried</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="High Value">High Value</option>
                    <option value="Family Banking">Family Banking</option>
                    <option value="New Customer">New Customer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Occupation</label>
                <input
                  type="text"
                  required
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1 focus:outline-none"
                  placeholder="e.g. Lead Architect"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5"
                >
                  {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Create Relationship</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brief Modal */}
      <CustomerBriefModal
        isOpen={showBriefModal}
        onClose={() => setShowBriefModal(false)}
        brief={briefData}
        customer={selectedCustomer}
      />
    </div>
  );
};

export default CustomersPage;
