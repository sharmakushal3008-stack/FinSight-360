import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Bot,
  Copy,
  Check,
  Printer,
  Target,
  MessageSquareQuote,
  ShieldCheck,
  Package,
  Layers,
  FileText,
} from 'lucide-react';

const CustomerBriefModal = ({ isOpen, onClose, brief, customer }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !brief) return null;

  const handleCopy = () => {
    const textToCopy = `
FINSIGHT 360 - CUSTOMER BRIEF
Customer: ${customer?.firstName} ${customer?.lastName} (${customer?.customerId})
Segment: ${customer?.segment} | City: ${customer?.city}
Relationship Health: ${customer?.relationshipHealthScore || 75}/100

RECOMMENDED OBJECTIVE:
${brief.recommendedObjective}

SUGGESTED TALKING POINTS:
${(brief.suggestedTalkingPoints || []).map((p, i) => `${i + 1}. ${p}`).join('\n')}

SUGGESTED PRODUCTS:
${(brief.suggestedProducts || []).join(', ')}

RATIONALE:
${brief.rationale}
Source: ${brief.source} (${brief.model || 'FinSight Intelligence Engine'})
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const isAI = brief.source === 'AI Generated';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 print:border-none print:shadow-none">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm ${
              isAI ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white' : 'bg-blue-100 text-blue-800'
            }`}>
              {isAI ? <Sparkles className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-slate-900 text-base">RM Customer Brief</h3>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${
                  isAI
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {brief.source}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Prepared for {customer?.firstName} {customer?.lastName} ({customer?.customerId})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 print:hidden">
            <button
              onClick={handleCopy}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Copy Brief"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Print Brief"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 ml-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Executive Summary Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              Customer & Relationship Context
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {brief.customerSummary}
            </p>
            {brief.relationshipHistory && (
              <p className="text-xs text-slate-500 leading-relaxed pt-1 border-t border-slate-200/60">
                <span className="font-semibold text-slate-600">History:</span> {brief.relationshipHistory}
              </p>
            )}
          </div>

          {/* Recommended Objective */}
          <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200/80">
            <div className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Target className="w-4 h-4 text-blue-600" />
              Primary Call Objective
            </div>
            <p className="text-sm font-semibold text-blue-950 leading-snug">
              {brief.recommendedObjective}
            </p>
          </div>

          {/* Suggested Talking Points */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquareQuote className="w-4 h-4 text-indigo-600" />
              Suggested Conversation Structure
            </div>

            <div className="space-y-2">
              {(brief.suggestedTalkingPoints || []).map((point, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Solutions & Products */}
          {brief.suggestedProducts?.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-teal-600" />
                Relevant Solution Categories
              </div>
              <div className="flex flex-wrap gap-2">
                {brief.suggestedProducts.map((prod, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-lg"
                  >
                    {prod}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rationale & Source Note */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700">Intelligence Rationale:</div>
            <div>{brief.rationale}</div>
            <div className="text-[10px] text-slate-400 pt-1">
              Generated by {brief.model || 'FinSight Intelligence Engine'} at {new Date(brief.generatedAt || Date.now()).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between print:hidden">
          <span className="text-[11px] text-slate-400">Strict factual basis • No assumptions</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Brief
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerBriefModal;
