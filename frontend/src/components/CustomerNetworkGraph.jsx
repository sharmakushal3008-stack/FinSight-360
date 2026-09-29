import React, { useState } from 'react';
import {
  CreditCard,
  Target,
  Zap,
  Briefcase,
  Calendar,
  MessageSquare,
  User,
  Info,
  CheckCircle2,
} from 'lucide-react';

const CustomerNetworkGraph = ({ customer, interactions = [], followups = [], signals = [], opportunities = [] }) => {
  const [selectedNode, setSelectedNode] = useState({
    type: 'customer',
    title: `${customer?.firstName} ${customer?.lastName}`,
    subtitle: `${customer?.segment} Segment • Health: ${customer?.relationshipHealthScore || 75}/100`,
    details: `Customer ID: ${customer?.customerId} | City: ${customer?.city} | Total Value: ₹${(customer?.totalRelationshipValue || 0).toLocaleString('en-IN')}`,
  });

  const activeProducts = customer?.existingProducts || [];
  const activeSignals = signals || [];
  const activeOpps = opportunities || [];
  const activeFollowups = followups || [];
  const goals = customer?.financialGoals || [];

  // Nodes configuration
  const nodes = [
    {
      id: 'center',
      type: 'customer',
      label: `${customer?.firstName} ${customer?.lastName}`,
      sublabel: `Health: ${customer?.relationshipHealthScore || 75}/100`,
      icon: User,
      x: 350,
      y: 200,
      color: '#0F2744',
      bg: '#E2E8F0',
      count: null,
      data: {
        title: `${customer?.firstName} ${customer?.lastName}`,
        subtitle: `Segment: ${customer?.segment} | Status: ${customer?.relationshipStatus}`,
        details: `Age: ${customer?.age} | Occupation: ${customer?.occupation} | Priority: ${customer?.priorityClassification}`,
      },
    },
    {
      id: 'products',
      type: 'products',
      label: 'Active Products',
      sublabel: `${activeProducts.length} Holding(s)`,
      icon: CreditCard,
      x: 180,
      y: 90,
      color: '#0284C7',
      bg: '#E0F2FE',
      count: activeProducts.length,
      data: {
        title: 'Banking Products & Holdings',
        subtitle: `${activeProducts.length} Active Accounts`,
        details: activeProducts.map((p) => `• ${p.productName || p.category} (Limit/Bal: ₹${(p.balanceOrLimit || 0).toLocaleString('en-IN')})`).join('\n') || 'No active products',
      },
    },
    {
      id: 'needs',
      type: 'needs',
      label: 'Financial Goals',
      sublabel: `${goals.length} Goal(s)`,
      icon: Target,
      x: 520,
      y: 90,
      color: '#10B981',
      bg: '#D1FAE5',
      count: goals.length,
      data: {
        title: 'Stated Financial Goals & Needs',
        subtitle: `${goals.length} Stated Goals`,
        details: goals.map((g) => `• ${g.goal} (Target: ₹${(g.targetAmount || 0).toLocaleString('en-IN')} by ${g.targetYear || 2026})`).join('\n') || 'No explicit goals recorded',
      },
    },
    {
      id: 'signals',
      type: 'signals',
      label: 'Relationship Signals',
      sublabel: `${activeSignals.length} Signal(s)`,
      icon: Zap,
      x: 550,
      y: 230,
      color: '#F59E0B',
      bg: '#FEF3C7',
      count: activeSignals.length,
      data: {
        title: 'Detected Relationship Signals',
        subtitle: `${activeSignals.length} Active Intelligence Triggers`,
        details: activeSignals.map((s) => `• [${s.severity}] ${s.title}: ${s.reason}`).join('\n') || 'No active risk signals',
      },
    },
    {
      id: 'opportunities',
      type: 'opportunities',
      label: 'Opportunities',
      sublabel: `${activeOpps.length} Deal(s)`,
      icon: Briefcase,
      x: 480,
      y: 330,
      color: '#8B5CF6',
      bg: '#EDE9FE',
      count: activeOpps.length,
      data: {
        title: 'Potential Solution Opportunities',
        subtitle: `${activeOpps.length} Cross-sell Prospects`,
        details: activeOpps.map((o) => `• ${o.title} (Est. Val: ₹${(o.estimatedValue || 0).toLocaleString('en-IN')})`).join('\n') || 'No active opportunities',
      },
    },
    {
      id: 'followups',
      type: 'followups',
      label: 'Follow-ups',
      sublabel: `${activeFollowups.length} Task(s)`,
      icon: Calendar,
      x: 220,
      y: 330,
      color: '#EC4899',
      bg: '#FCE7F3',
      count: activeFollowups.length,
      data: {
        title: 'Follow-up Queue & Commitments',
        subtitle: `${activeFollowups.length} Scheduled Follow-ups`,
        details: activeFollowups.map((f) => `• ${f.title} (${f.status} on ${new Date(f.scheduledDate).toLocaleDateString('en-IN')})`).join('\n') || 'No pending follow-ups',
      },
    },
    {
      id: 'interactions',
      type: 'interactions',
      label: 'Interactions',
      sublabel: `${interactions.length} Logged`,
      icon: MessageSquare,
      x: 140,
      y: 210,
      color: '#6366F1',
      bg: '#E0E7FF',
      count: interactions.length,
      data: {
        title: 'Recent Interaction History',
        subtitle: `${interactions.length} Total Touchpoints`,
        details: interactions.slice(0, 3).map((i) => `• [${new Date(i.date).toLocaleDateString('en-IN')}] ${i.type}: ${i.summary}`).join('\n') || 'No recorded interactions',
      },
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-slate-900 text-sm">Interactive Relationship Graph</h3>
          <p className="text-xs text-slate-500">Click any connected node to explore relationship linkages</p>
        </div>
        <div className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 font-medium">
          Live Entity Map
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <svg viewBox="0 0 700 400" className="w-full h-80 select-none">
          {/* Connector Lines */}
          {nodes.slice(1).map((node) => (
            <g key={`line-${node.id}`}>
              <line
                x1={nodes[0].x}
                y1={nodes[0].y}
                x2={node.x}
                y2={node.y}
                stroke="#CBD5E1"
                strokeWidth="2"
                strokeDasharray="4,4"
              />
              {/* Pulse animation dot */}
              <circle
                cx={(nodes[0].x + node.x) / 2}
                cy={(nodes[0].y + node.y) / 2}
                r="3"
                fill={node.color}
                opacity="0.8"
              />
            </g>
          ))}

          {/* Node Elements */}
          {nodes.map((node) => {
            const isCenter = node.id === 'center';
            const isSelected = selectedNode?.title === node.data.title;

            return (
              <g
                key={node.id}
                onClick={() => setSelectedNode(node.data)}
                className="cursor-pointer transition-transform duration-150 hover:scale-105"
                transform={`translate(${node.x}, ${node.y})`}
              >
                {/* Outer Ring */}
                <circle
                  cx="0"
                  cy="0"
                  r={isCenter ? 44 : 32}
                  fill={node.bg}
                  stroke={isSelected ? '#1E40AF' : node.color}
                  strokeWidth={isSelected ? 3 : 1.5}
                  className="shadow-md"
                />

                {/* Inner Circle / Icon Background */}
                <circle
                  cx="0"
                  cy="0"
                  r={isCenter ? 36 : 24}
                  fill="white"
                  stroke="#E2E8F0"
                  strokeWidth="1"
                />

                {/* Label text */}
                <text
                  x="0"
                  y={isCenter ? 58 : 44}
                  textAnchor="middle"
                  className={`text-[11px] font-semibold ${isCenter ? 'fill-slate-900 font-bold' : 'fill-slate-700'}`}
                >
                  {node.label}
                </text>

                <text
                  x="0"
                  y={isCenter ? 72 : 56}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-400 font-medium"
                >
                  {node.sublabel}
                </text>

                {/* Counter Badge */}
                {node.count !== null && node.count > 0 && (
                  <g transform="translate(18, -18)">
                    <circle cx="0" cy="0" r="10" fill={node.color} />
                    <text x="0" y="3.5" textAnchor="middle" fill="white" className="text-[10px] font-bold">
                      {node.count}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              {selectedNode.title}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">{selectedNode.subtitle}</span>
          </div>
          <div className="text-xs text-slate-600 whitespace-pre-line leading-relaxed pt-1">
            {selectedNode.details}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerNetworkGraph;
