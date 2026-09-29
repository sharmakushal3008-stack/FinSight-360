import React from 'react';
import { ShieldAlert, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-3 px-6 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-2 mt-auto">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-700">FinSight 360</span>
        <span className="text-slate-300">|</span>
        <span>AI Relationship Intelligence & Opportunity Engine</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Portfolio Demonstration — All customer data is fictional. No real banking infrastructure.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
