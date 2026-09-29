import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import api from '../services/api';

const KYCCompliancePage = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');

  const fetchKYC = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status !== 'All') params.append('status', status);
      if (search) params.append('search', search);

      const res = await api.get(`/kyc/all?${params.toString()}`);
      if (res.data.success) {
        setRecords(res.data.data.records || []);
        setStats(res.data.data.stats || {});
      }
    } catch (err) {
      console.error('Error fetching KYC records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKYC();
  }, [status]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchKYC();
  };

  const handleVerify = async (custDocId) => {
    try {
      await api.put(`/customers/${custDocId}/kyc`, {
        status: 'Verified',
        remarks: 'Simulated verification completed successfully.',
        identityProofStatus: 'Verified',
        addressProofStatus: 'Verified',
        panStatus: 'Verified',
      });
      fetchKYC();
    } catch (err) {
      console.error('KYC update failed:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">KYC & Compliance Simulation</h1>
            <p className="text-xs text-slate-500">
              Demo regulatory identity verification and document compliance management
            </p>
          </div>
        </div>
      </div>

      {/* Compliance Disclaimer Banner */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
        <span>
          <strong>Simulated Compliance Workflow:</strong> This module demonstrates KYC document audits for educational and portfolio demonstration. No real regulatory databases are queried.
        </span>
      </div>

      {/* Status Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <button
          onClick={() => setStatus('Verified')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            status === 'Verified'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">Verified</div>
          <div className="text-2xl font-bold text-emerald-900 font-display mt-1">
            {stats.verifiedCount || 0}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Compliant relationships</div>
        </button>

        <button
          onClick={() => setStatus('Pending')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            status === 'Pending'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-amber-800">Pending</div>
          <div className="text-2xl font-bold text-amber-900 font-display mt-1">
            {stats.pendingCount || 0}
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">Awaiting document upload</div>
        </button>

        <button
          onClick={() => setStatus('Additional Information Required')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            status === 'Additional Information Required'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-rose-800">Action Required</div>
          <div className="text-2xl font-bold text-rose-900 font-display mt-1">
            {stats.actionRequiredCount || 0}
          </div>
          <div className="text-[11px] text-rose-600 mt-0.5">Address proof / Form 16</div>
        </button>

        <button
          onClick={() => setStatus('All')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            status === 'All'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700">All Records</div>
          <div className="text-2xl font-bold text-slate-900 font-display mt-1">
            {stats.total || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Total customer book</div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle flex items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search KYC records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
          />
        </form>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="table-header">Customer & Record ID</th>
                <th className="table-header">Segment / City</th>
                <th className="table-header">Identity Proof</th>
                <th className="table-header">Address Proof</th>
                <th className="table-header">PAN Status</th>
                <th className="table-header">KYC Status</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
                    <span className="text-xs text-slate-500">Loading compliance records...</span>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400 text-xs">
                    No KYC records found matching filter.
                  </td>
                </tr>
              ) : (
                records.map((r) => {
                  const cust = r.customerId;
                  if (!cust) return null;

                  return (
                    <tr
                      key={r._id}
                      onClick={() => navigate(`/customers/${cust._id}`)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="table-cell">
                        <div className="font-semibold text-slate-900">{cust.firstName} {cust.lastName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{r.recordId} • {cust.customerId}</div>
                      </td>

                      <td className="table-cell text-xs text-slate-600">
                        <div>{cust.segment}</div>
                        <div className="text-[10px] text-slate-400">{cust.city}</div>
                      </td>

                      <td className="table-cell text-xs">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          r.identityProof?.status === 'Verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {r.identityProof?.status || 'Pending'}
                        </span>
                      </td>

                      <td className="table-cell text-xs">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          r.addressProof?.status === 'Verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {r.addressProof?.status || 'Missing'}
                        </span>
                      </td>

                      <td className="table-cell text-xs">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          r.panCard?.status === 'Verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {r.panCard?.status || 'Pending'}
                        </span>
                      </td>

                      <td className="table-cell">
                        <span className={`text-xs px-2.5 py-0.5 rounded font-semibold ${
                          r.status === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'Additional Information Required'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>

                      <td className="table-cell text-right" onClick={(e) => e.stopPropagation()}>
                        {r.status !== 'Verified' ? (
                          <button
                            onClick={() => handleVerify(cust._id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-2xs"
                          >
                            Simulate Verify
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/customers/${cust._id}`)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium"
                          >
                            View 360
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KYCCompliancePage;
