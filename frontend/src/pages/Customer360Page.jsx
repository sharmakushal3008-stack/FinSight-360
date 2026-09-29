import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  HeartPulse,
  Activity,
  Zap,
  Briefcase,
  Calendar,
  MessageSquare,
  CreditCard,
  Target,
  ShieldCheck,
  History,
  Sparkles,
  HelpCircle,
  Clock,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Loader2,
  X,
  FileCheck,
} from 'lucide-react';
import api from '../services/api';
import CustomerBriefModal from '../components/CustomerBriefModal';
import HealthExplanationModal from '../components/HealthExplanationModal';
import CustomerNetworkGraph from '../components/CustomerNetworkGraph';

const Customer360Page = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [briefData, setBriefData] = useState(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);

  // Log Interaction Modal
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [interactionForm, setInteractionForm] = useState({
    type: 'Phone Call',
    channel: 'Outbound Call',
    summary: '',
    outcome: 'Positive - Follow-up Requested',
    sentiment: 'Positive',
    nextActionNeeded: '',
  });

  // Schedule Follow-up Modal
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [followupForm, setFollowupForm] = useState({
    title: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '11:00 AM',
    purpose: 'Relationship Review',
    priority: 'High',
    notes: '',
  });

  const fetchCustomer360 = async () => {
    try {
      setLoading(true);
      const [resCust, resTimeline] = await Promise.all([
        api.get(`/customers/${id}`),
        api.get(`/customers/${id}/timeline`),
      ]);

      if (resCust.data.success) {
        setData(resCust.data.data);
      }
      if (resTimeline.data.success) {
        setTimeline(resTimeline.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching Customer 360:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer360();
  }, [id]);

  const handlePrepareBrief = async () => {
    setBriefLoading(true);
    try {
      const res = await api.post(`/customers/${id}/brief`);
      if (res.data.success) {
        setBriefData(res.data.data);
        setShowBriefModal(true);
      }
    } catch (err) {
      console.error('Failed to generate brief:', err);
    } finally {
      setBriefLoading(false);
    }
  };

  const handleCreateInteraction = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/customers/${id}/interactions`, interactionForm);
      if (res.data.success) {
        setShowInteractionModal(false);
        setInteractionForm({
          type: 'Phone Call',
          channel: 'Outbound Call',
          summary: '',
          outcome: 'Positive - Follow-up Requested',
          sentiment: 'Positive',
          nextActionNeeded: '',
        });
        fetchCustomer360();
      }
    } catch (err) {
      console.error('Interaction logging failed:', err);
    }
  };

  const handleCreateFollowup = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/followups`, {
        ...followupForm,
        customerId: data.customer._id,
      });
      if (res.data.success) {
        setShowFollowupModal(false);
        setFollowupForm({
          title: '',
          scheduledDate: new Date().toISOString().split('T')[0],
          scheduledTime: '11:00 AM',
          purpose: 'Relationship Review',
          priority: 'High',
          notes: '',
        });
        fetchCustomer360();
      }
    } catch (err) {
      console.error('Schedule follow-up failed:', err);
    }
  };

  const handleCompleteFollowup = async (followUpId) => {
    try {
      await api.put(`/followups/${followUpId}/complete`, {
        outcome: 'Follow-up completed during Customer 360 review session.',
      });
      fetchCustomer360();
    } catch (err) {
      console.error('Error completing follow-up:', err);
    }
  };

  const handleVerifyKYC = async () => {
    try {
      await api.put(`/customers/${id}/kyc`, {
        status: 'Verified',
        remarks: 'All documents reviewed and approved in demo compliance simulation.',
        identityProofStatus: 'Verified',
        addressProofStatus: 'Verified',
        panStatus: 'Verified',
      });
      fetchCustomer360();
    } catch (err) {
      console.error('Error updating KYC:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Assembling Customer 360 Intelligence...</p>
      </div>
    );
  }

  if (!data || !data.customer) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
        <p className="text-sm text-slate-600">Customer record not found.</p>
        <button
          onClick={() => navigate('/customers')}
          className="px-4 py-2 bg-slate-900 text-white text-xs rounded-lg font-semibold"
        >
          Return to Customer Directory
        </button>
      </div>
    );
  }

  const { customer, interactions, followups, signals, opportunities, kycRecord, changes } = data;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: HeartPulse },
    { id: 'network', label: 'Relationship Graph', icon: Activity, badge: 'Live' },
    { id: 'timeline', label: 'Relationship Timeline', icon: History, count: timeline.length },
    { id: 'products', label: 'Products & Holdings', icon: CreditCard, count: customer.existingProducts?.length },
    { id: 'signals', label: 'Signals', icon: Zap, count: signals?.length },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase, count: opportunities?.length },
    { id: 'followups', label: 'Follow-ups', icon: Calendar, count: followups?.length },
    { id: 'interactions', label: 'Interactions', icon: MessageSquare, count: interactions?.length },
    { id: 'kyc', label: 'KYC & Compliance', icon: ShieldCheck, badge: customer.kycStatus },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back Button & Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-xs text-slate-400">
          Customer 360 Intelligence Profile
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Customer Identity */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0F2744] to-[#1E40AF] text-white flex items-center justify-center font-display font-bold text-xl shadow-md shrink-0">
              {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold text-slate-900 font-display">
                  {customer.firstName} {customer.lastName}
                </h1>
                <span className="text-xs px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-semibold">
                  {customer.segment}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  customer.priorityClassification === 'High Priority'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {customer.priorityClassification} ({customer.priorityScore})
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-1.5">
                <span><strong>ID:</strong> {customer.customerId}</span>
                <span><strong>City:</strong> {customer.city}</span>
                <span><strong>Occupation:</strong> {customer.occupation}</span>
                <span><strong>Age:</strong> {customer.age} yrs</span>
                <span><strong>Income:</strong> {customer.incomeRange}</span>
                <span><strong>Tenure:</strong> Since {new Date(customer.customerSince).getFullYear()}</span>
              </div>
            </div>
          </div>

          {/* Right Scores & Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Health Score Box with "Why?" trigger */}
            <button
              onClick={() => setShowHealthModal(true)}
              className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors flex items-center gap-3 shadow-2xs group"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Relationship Health
                </span>
                <div className="text-xl font-bold font-display text-slate-900 flex items-baseline gap-1">
                  <span>{customer.relationshipHealthScore}</span>
                  <span className="text-xs font-normal text-slate-400">/ 100</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold group-hover:underline">
                <span>Why?</span>
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Engagement Score */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Engagement Index
              </span>
              <div className="text-xl font-bold font-display text-slate-900 flex items-baseline gap-1">
                <span>{customer.engagementScore}</span>
                <span className="text-xs font-normal text-slate-400">/ 100</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={handlePrepareBrief}
                disabled={briefLoading}
                className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                {briefLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-300" />
                )}
                <span>Prepare AI Brief</span>
              </button>

              <button
                onClick={() => setShowFollowupModal(true)}
                className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
              >
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Schedule Follow-up</span>
              </button>

              <button
                onClick={() => setShowInteractionModal(true)}
                className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Log Interaction</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-t border-slate-100 mt-6 pt-3 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full font-bold">
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                    tab.badge === 'Verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Panels */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Priority Action & "What Changed?" Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Priority Reason & Next Action */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-subtle p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h3 className="font-display font-bold text-slate-900 text-sm">
                    Priority Intelligence & Recommended Action
                  </h3>
                </div>
                <span className="text-xs text-slate-400">Score: {customer.priorityScore}/100</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="text-xs font-bold text-blue-900">
                  Recommended Action: <span className="font-normal text-slate-800">{customer.recommendedAction}</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-700">Identified Triggers:</div>
                  <ul className="list-disc pl-4 space-y-0.5 marker:text-amber-500">
                    {customer.priorityReasons?.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* "What Changed?" Trend Analysis */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-slate-900 text-sm">"What Changed?" Analysis</h3>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>

              <div className="space-y-2">
                {changes?.map((chg, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span>{chg.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                        chg.type === 'Decline' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {chg.type}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{chg.description}</p>
                    <div className="text-[11px] text-blue-700 font-medium pt-0.5">
                      Action: {chg.action}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Signals & Open Opportunities Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Signals */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h3 className="font-display font-bold text-slate-900 text-sm">Active Signals ({signals?.length})</h3>
                </div>
                <button onClick={() => setActiveTab('signals')} className="text-xs text-blue-600 font-semibold">View All</button>
              </div>

              <div className="space-y-2">
                {signals?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No active signals.</p>
                ) : (
                  signals.slice(0, 3).map((s) => (
                    <div key={s._id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>{s.title}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                          s.severity === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {s.severity}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-1">{s.reason}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Open Opportunities */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-display font-bold text-slate-900 text-sm">Detected Opportunities ({opportunities?.length})</h3>
                </div>
                <button onClick={() => setActiveTab('opportunities')} className="text-xs text-blue-600 font-semibold">View All</button>
              </div>

              <div className="space-y-2">
                {opportunities?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No active opportunities detected.</p>
                ) : (
                  opportunities.slice(0, 3).map((o) => (
                    <div key={o._id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{o.title}</span>
                        <span className="text-xs font-bold text-indigo-900 font-mono">
                          ₹{o.estimatedValue?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-1">{o.detectedReason}</p>
                      <div className="text-[11px] text-blue-700 font-medium mt-1">
                        Suggested Action: {o.suggestedAction}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Interactive Network Graph */}
      {activeTab === 'network' && (
        <CustomerNetworkGraph
          customer={customer}
          interactions={interactions}
          followups={followups}
          signals={signals}
          opportunities={opportunities}
        />
      )}

      {/* Tab: Visual Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-6 space-y-4">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-sm">
              Unified Chronological Relationship Timeline
            </h3>
            <p className="text-xs text-slate-500">
              Database-verified progression of customer onboarding, holdings, interactions, and signals
            </p>
          </div>

          <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 pt-2">
            {timeline.map((evt) => (
              <div key={evt.id} className="relative group">
                {/* Dot */}
                <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                  evt.badgeColor === 'blue'
                    ? 'bg-blue-600'
                    : evt.badgeColor === 'teal'
                    ? 'bg-teal-600'
                    : evt.badgeColor === 'red'
                    ? 'bg-rose-500'
                    : evt.badgeColor === 'green'
                    ? 'bg-emerald-500'
                    : 'bg-indigo-600'
                }`} />

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{evt.title}</span>
                    <span className="text-slate-400 font-mono">
                      {new Date(evt.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{evt.description}</p>
                  {evt.outcome && (
                    <div className="text-[11px] text-slate-500">
                      Outcome: <strong className="text-slate-700">{evt.outcome}</strong>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Products & Holdings */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm">Active Product Portfolio</h3>
              <p className="text-xs text-slate-500">Currently held banking and credit accounts</p>
            </div>
            <div className="text-xs text-slate-600 font-semibold">
              Total Value: ₹{(customer.totalRelationshipValue || 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customer.existingProducts?.map((prod, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-900 text-sm">{prod.productName || prod.category}</div>
                  <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-medium">
                    {prod.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Account: {prod.accountNumber || 'ACC-982301'}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  <span className="text-slate-500">Balance / Credit Limit:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    ₹{(prod.balanceOrLimit || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Signals */}
      {activeTab === 'signals' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-6 space-y-4">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-sm">Detected Relationship Signals</h3>
            <p className="text-xs text-slate-500">Deterministic triggers detected by FinSight intelligence engine</p>
          </div>

          <div className="space-y-3">
            {signals?.map((s) => (
              <div key={s._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <span>{s.title}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded">
                      {s.category}
                    </span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    s.severity === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {s.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{s.reason}</p>
                <div className="text-[11px] text-slate-400 pt-1">
                  Detected on {new Date(s.detectedDate).toLocaleDateString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Opportunities */}
      {activeTab === 'opportunities' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-6 space-y-4">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-sm">Solution Opportunities</h3>
            <p className="text-xs text-slate-500">Cross-sell and advisory matching based on customer goals and signals</p>
          </div>

          <div className="space-y-3">
            {opportunities?.map((opp) => (
              <div key={opp._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{opp.title}</div>
                    <span className="text-xs text-slate-500">{opp.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-indigo-900 font-mono">
                      ₹{opp.estimatedValue?.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-medium">
                      Confidence: {opp.confidenceScore}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600">{opp.detectedReason}</p>
                <div className="p-2.5 bg-blue-50 text-blue-900 text-xs rounded-lg font-medium">
                  <strong>Suggested Next Action:</strong> {opp.suggestedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Follow-ups */}
      {activeTab === 'followups' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm">Follow-up Tasks</h3>
              <p className="text-xs text-slate-500">Scheduled touchpoints and commitments</p>
            </div>
            <button
              onClick={() => setShowFollowupModal(true)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Follow-up</span>
            </button>
          </div>

          <div className="space-y-3">
            {followups?.map((fol) => (
              <div key={fol._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-slate-900 text-xs">{fol.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Purpose: <strong>{fol.purpose}</strong> • Date: {new Date(fol.scheduledDate).toLocaleDateString('en-IN')} ({fol.scheduledTime})
                  </div>
                  {fol.notes && <p className="text-xs text-slate-600 mt-1">{fol.notes}</p>}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2.5 py-0.5 rounded font-medium ${
                    fol.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {fol.status}
                  </span>

                  {fol.status !== 'Completed' && (
                    <button
                      onClick={() => handleCompleteFollowup(fol._id)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Interactions */}
      {activeTab === 'interactions' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm">Interaction History Log</h3>
              <p className="text-xs text-slate-500">Every recorded call, meeting, and email</p>
            </div>
            <button
              onClick={() => setShowInteractionModal(true)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Interaction</span>
            </button>
          </div>

          <div className="space-y-3">
            {interactions?.map((int) => (
              <div key={int._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <span>{int.type}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded font-mono">
                      {int.channel}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(int.date).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{int.summary}</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                  <span>Outcome: <strong className="text-slate-700">{int.outcome}</strong></span>
                  <span>Sentiment: <strong className="text-blue-700">{int.sentiment}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: KYC & Compliance */}
      {activeTab === 'kyc' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm">KYC & Compliance Checklist</h3>
              <p className="text-xs text-slate-500">Simulated regulatory identity and address verification</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
              customer.kycStatus === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              Status: {customer.kycStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-slate-700">Identity Proof</div>
              <div className="text-xs text-slate-500">{kycRecord?.identityProof?.docType || 'Passport / Aadhaar'}</div>
              <div className="text-[11px] text-emerald-700 font-medium">Status: {kycRecord?.identityProof?.status || 'Verified'}</div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-slate-700">Address Proof</div>
              <div className="text-xs text-slate-500">{kycRecord?.addressProof?.docType || 'Utility Bill'}</div>
              <div className="text-[11px] text-emerald-700 font-medium">Status: {kycRecord?.addressProof?.status || 'Verified'}</div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-slate-700">PAN Card</div>
              <div className="text-xs text-slate-500 font-mono">{kycRecord?.panCard?.panNumber || 'ABCDE1234F'}</div>
              <div className="text-[11px] text-emerald-700 font-medium">Status: {kycRecord?.panCard?.status || 'Verified'}</div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-700">Compliance Audit Checklist:</div>
            <div className="space-y-1.5">
              {(kycRecord?.complianceChecklist || []).map((chk, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{chk.item}</span>
                </div>
              ))}
            </div>
          </div>

          {customer.kycStatus !== 'Verified' && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleVerifyKYC}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <FileCheck className="w-4 h-4" />
                <span>Simulate Document Verification & Mark Verified</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Log Interaction Modal */}
      {showInteractionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-900 text-base">Record Relationship Interaction</h3>
              <button onClick={() => setShowInteractionModal(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInteraction} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Interaction Type</label>
                  <select
                    value={interactionForm.type}
                    onChange={(e) => setInteractionForm({ ...interactionForm, type: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1 focus:outline-none"
                  >
                    <option value="Phone Call">Phone Call</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Portfolio Review">Portfolio Review</option>
                    <option value="Branch Visit">Branch Visit</option>
                    <option value="Email">Email</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Channel</label>
                  <select
                    value={interactionForm.channel}
                    onChange={(e) => setInteractionForm({ ...interactionForm, channel: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1 focus:outline-none"
                  >
                    <option value="Outbound Call">Outbound Call</option>
                    <option value="In-Person">In-Person</option>
                    <option value="Inbound Call">Inbound Call</option>
                    <option value="Digital / Email">Digital / Email</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Discussion Summary & Key Takeaways</label>
                <textarea
                  required
                  rows="3"
                  value={interactionForm.summary}
                  onChange={(e) => setInteractionForm({ ...interactionForm, summary: e.target.value })}
                  placeholder="Summarize customer interaction notes..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Outcome</label>
                  <select
                    value={interactionForm.outcome}
                    onChange={(e) => setInteractionForm({ ...interactionForm, outcome: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1 focus:outline-none"
                  >
                    <option value="Positive - Opportunity Identified">Positive - Opportunity Identified</option>
                    <option value="Positive - Follow-up Requested">Positive - Follow-up Requested</option>
                    <option value="Neutral - Information Provided">Neutral - Information Provided</option>
                    <option value="Requirement Gathered">Requirement Gathered</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Sentiment</label>
                  <select
                    value={interactionForm.sentiment}
                    onChange={(e) => setInteractionForm({ ...interactionForm, sentiment: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1 focus:outline-none"
                  >
                    <option value="Positive">Positive</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Hesitant">Hesitant</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInteractionModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                >
                  Save Interaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Follow-up Modal */}
      {showFollowupModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-900 text-base">Schedule Relationship Follow-up</h3>
              <button onClick={() => setShowFollowupModal(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFollowup} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Follow-up Title</label>
                <input
                  type="text"
                  required
                  value={followupForm.title}
                  onChange={(e) => setFollowupForm({ ...followupForm, title: e.target.value })}
                  placeholder="e.g. Vehicle Financing Rate Discussion"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={followupForm.scheduledDate}
                    onChange={(e) => setFollowupForm({ ...followupForm, scheduledDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Scheduled Time</label>
                  <input
                    type="text"
                    value={followupForm.scheduledTime}
                    onChange={(e) => setFollowupForm({ ...followupForm, scheduledTime: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Purpose</label>
                  <select
                    value={followupForm.purpose}
                    onChange={(e) => setFollowupForm({ ...followupForm, purpose: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1 focus:outline-none"
                  >
                    <option value="Relationship Review">Relationship Review</option>
                    <option value="Vehicle Loan Discussion">Vehicle Loan Discussion</option>
                    <option value="Home Loan Consultation">Home Loan Consultation</option>
                    <option value="Wealth & Investment Advisory">Wealth & Investment Advisory</option>
                    <option value="KYC Documentation Follow-up">KYC Documentation Follow-up</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Priority</label>
                  <select
                    value={followupForm.priority}
                    onChange={(e) => setFollowupForm({ ...followupForm, priority: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1 focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Agenda / Notes</label>
                <textarea
                  rows="2"
                  value={followupForm.notes}
                  onChange={(e) => setFollowupForm({ ...followupForm, notes: e.target.value })}
                  placeholder="Notes for the call..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFollowupModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Brief Modal */}
      <CustomerBriefModal
        isOpen={showBriefModal}
        onClose={() => setShowBriefModal(false)}
        brief={briefData}
        customer={customer}
      />

      {/* Health Explanation Modal */}
      <HealthExplanationModal
        isOpen={showHealthModal}
        onClose={() => setShowHealthModal(false)}
        customer={customer}
      />
    </div>
  );
};

export default Customer360Page;
