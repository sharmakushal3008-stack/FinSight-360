import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Zap,
  Users,
  UserCheck,
  Compass,
  Briefcase,
  Kanban,
  CalendarCheck,
  Layers,
  BarChart3,
  ShieldCheck,
  Package,
  Settings,
  X,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { path: '/priority-center', label: 'Priority Center', icon: Zap, badge: 'Why Today?', highlight: true },
  { path: '/customers', label: 'Customers', icon: Users, badge: null },
  { path: '/radar', label: 'Relationship Radar', icon: Compass, badge: null },
  { path: '/leads', label: 'Leads', icon: Briefcase, badge: null },
  { path: '/pipeline', label: 'Sales Pipeline', icon: Kanban, badge: null },
  { path: '/followups', label: 'Follow-ups', icon: CalendarCheck, badge: null },
  { path: '/segments', label: 'Segments', icon: Layers, badge: null },
  { path: '/analytics', label: 'Analytics', icon: BarChart3, badge: null },
  { path: '/kyc', label: 'KYC & Compliance', icon: ShieldCheck, badge: 'Demo' },
  { path: '/products', label: 'Product Catalog', icon: Package, badge: null },
  { path: '/settings', label: 'Settings', icon: Settings, badge: null },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F2744] text-white flex items-center justify-center font-display font-bold text-base shadow-sm">
              F3
            </div>
            <div>
              <span className="font-display font-bold text-slate-900 text-base tracking-tight">FinSight 360</span>
              <span className="text-[10px] block text-slate-400 font-medium -mt-1">RM Intelligence Engine</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Relationship Intelligence
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive: exactActive }) => {
                  const active = item.path === '/dashboard' ? exactActive : isActive;
                  return `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`;
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      item.highlight
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer Callout */}
        <div className="p-3 m-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>"Why Today?" Engine</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
            Deterministic prioritization derived from customer dormancy, open needs, and overdue milestones.
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
