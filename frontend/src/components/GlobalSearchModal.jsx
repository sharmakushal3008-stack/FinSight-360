import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Briefcase, Calendar, Zap, ArrowRight, X, Loader2 } from 'lucide-react';
import api from '../services/api';

const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query.trim())}`);
        if (res.data.success) {
          setResults(res.data.data);
        }
      } catch (err) {
        console.error('Search query failed:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (url) => {
    onClose();
    navigate(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search customers, leads, follow-ups, opportunities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-slate-800 placeholder-slate-400 text-sm focus:outline-none bg-transparent"
          />
          {loading ? (
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          ) : query ? (
            <button onClick={() => setQuery('')} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-xs bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-mono">ESC</span>
          )}
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="text-center py-8 text-slate-400 text-xs">
              Type at least 2 characters to search across customers, leads, follow-ups, and active opportunities.
            </div>
          )}

          {query && !loading && results && results.totalResults === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              No matching records found for "<span className="font-semibold text-slate-700">{query}</span>"
            </div>
          )}

          {results && (
            <>
              {/* Customers Section */}
              {results.customers?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    Customers ({results.customers.length})
                  </div>
                  <div className="space-y-1">
                    {results.customers.map((c) => (
                      <button
                        key={c._id}
                        onClick={() => handleSelect(`/customers/${c._id}`)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-left transition-colors group"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-800 group-hover:text-blue-600 flex items-center gap-2">
                            <span>{c.firstName} {c.lastName}</span>
                            <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">{c.segment}</span>
                            <span className="text-xs text-slate-400">{c.city}</span>
                          </div>
                          <div className="text-xs text-slate-500">ID: {c.customerId} • Health: {c.relationshipHealthScore}/100</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Leads Section */}
              {results.leads?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    Leads ({results.leads.length})
                  </div>
                  <div className="space-y-1">
                    {results.leads.map((l) => (
                      <button
                        key={l._id}
                        onClick={() => handleSelect(`/leads`)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-left transition-colors group"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-800 group-hover:text-blue-600 flex items-center gap-2">
                            <span>{l.name}</span>
                            <span className="text-xs px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">{l.status}</span>
                          </div>
                          <div className="text-xs text-slate-500">Need: {l.requirement} • Value: ₹{l.estimatedValue?.toLocaleString('en-IN')}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Opportunities Section */}
              {results.opportunities?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Opportunities ({results.opportunities.length})
                  </div>
                  <div className="space-y-1">
                    {results.opportunities.map((o) => (
                      <button
                        key={o._id}
                        onClick={() => handleSelect(o.customerId ? `/customers/${o.customerId._id}` : '/pipeline')}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-left transition-colors group"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-800 group-hover:text-blue-600 flex items-center gap-2">
                            <span>{o.title}</span>
                            <span className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded">{o.stage}</span>
                          </div>
                          <div className="text-xs text-slate-500">Customer: {o.customerId?.firstName} {o.customerId?.lastName} • Value: ₹{o.estimatedValue?.toLocaleString('en-IN')}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-ups Section */}
              {results.followups?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    Follow-ups ({results.followups.length})
                  </div>
                  <div className="space-y-1">
                    {results.followups.map((f) => (
                      <button
                        key={f._id}
                        onClick={() => handleSelect(f.customerId ? `/customers/${f.customerId._id}` : '/followups')}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-left transition-colors group"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-800 group-hover:text-blue-600 flex items-center gap-2">
                            <span>{f.title}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${f.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                              {f.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">Customer: {f.customerId?.firstName} {f.customerId?.lastName} • Purpose: {f.purpose}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Navigate with mouse or click result</span>
          <button onClick={onClose} className="hover:text-slate-700">Close</button>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
