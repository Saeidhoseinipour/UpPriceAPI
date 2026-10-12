import React from 'react';
import { CurrencyUnit } from '../types';
import {
  RefreshCw,
  Rss,
  Zap,
  Globe2,
  DollarSign,
  Layers,
  Activity,
  CheckCircle2,
} from 'lucide-react';

interface HeaderProps {
  isPersian: boolean;
  setIsPersian: (val: boolean) => void;
  currencyUnit: CurrencyUnit;
  setCurrencyUnit: (val: CurrencyUnit) => void;
  onSyncAll: () => void;
  isSyncing: boolean;
  onOpenFeedModal: () => void;
  onSimulateCompetitorMove: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  outOfSyncCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isPersian,
  setIsPersian,
  currencyUnit,
  setCurrencyUnit,
  onSyncAll,
  isSyncing,
  onOpenFeedModal,
  onSimulateCompetitorMove,
  activeTab,
  setActiveTab,
  outOfSyncCount,
}) => {
  const tabs = [
    { id: 'dashboard', labelEn: 'Overview', labelFa: 'داشبورد کلی', icon: Activity },
    {
      id: 'products',
      labelEn: 'Products & Prices',
      labelFa: 'محصولات و قیمت‌ها',
      icon: Layers,
      badge: outOfSyncCount > 0 ? outOfSyncCount : undefined,
    },
    { id: 'torob', labelEn: 'Torob Intelligence', labelFa: 'پایش قیمت ترب', icon: Zap },
    { id: 'rules', labelEn: 'Pricing Rules', labelFa: 'قوانین قیمت‌گذاری', icon: CheckCircle2 },
    { id: 'rates', labelEn: 'FX & Inflation', labelFa: 'نرخ ارز و تتر', icon: DollarSign },
    { id: 'api', labelEn: 'API & Sandbox', labelFa: 'مستندات و تست API', icon: Globe2 },
    { id: 'history', labelEn: 'Audit Logs', labelFa: 'تاریخچه تغییرات', icon: RefreshCw },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 text-lg tracking-tighter">
                  UP
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white tracking-tight">UpPriceAPI</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 font-medium">
                  Iran E-Commerce Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {isPersian
                  ? 'پلتفرم همگام‌سازی هوشمند قیمت فروشگاه‌های اینترنتی با ترب و دیجی‌کالا'
                  : 'Automated pricing sync engine for Iranian marketplaces'}
              </p>
            </div>
          </div>

          {/* Action Tools & Toggles */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Unit Toggle */}
            <div className="inline-flex p-0.5 bg-slate-800/90 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setCurrencyUnit('TOMAN')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  currencyUnit === 'TOMAN'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Display prices in Tomans"
              >
                {isPersian ? 'تومان' : 'Toman'}
              </button>
              <button
                onClick={() => setCurrencyUnit('RIAL')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  currencyUnit === 'RIAL'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Display prices in Rials (IRR)"
              >
                {isPersian ? 'ریال' : 'Rial'}
              </button>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setIsPersian(!isPersian)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
              title="Toggle Persian / English"
            >
              <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isPersian ? 'EN' : 'فارسی'}</span>
            </button>

            {/* Torob Feed Button */}
            <button
              onClick={onOpenFeedModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-medium transition"
              title="Get Torob XML / JSON Feed URL"
            >
              <Rss className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isPersian ? 'فید ترب' : 'Torob Feed'}</span>
            </button>

            {/* Simulate Competitor Move */}
            <button
              onClick={onSimulateCompetitorMove}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 text-xs font-medium transition"
              title="Simulate competitor price cut on Torob"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{isPersian ? 'تست افت قیمت رقیب' : 'Simulate Drop'}</span>
            </button>

            {/* Sync All Button */}
            <button
              onClick={onSyncAll}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-medium text-xs shadow-md shadow-cyan-900/30 disabled:opacity-50 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? (isPersian ? 'در حال هماهنگی...' : 'Syncing...') : (isPersian ? 'همگام‌سازی همه' : 'Sync All Prices')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-t border-slate-800/80 bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{isPersian ? tab.labelFa : tab.labelEn}</span>
                  {tab.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
