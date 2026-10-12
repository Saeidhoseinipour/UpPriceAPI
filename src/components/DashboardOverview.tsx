import React from 'react';
import { Product, FXRate, CurrencyUnit } from '../types';
import { formatPrice, formatPercent } from '../utils/formatters';
import {
  TrendingUp,
  AlertTriangle,
  Award,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Zap,
  Clock,
  Sparkles,
} from 'lucide-react';

interface DashboardOverviewProps {
  products: Product[];
  fxRates: FXRate[];
  isPersian: boolean;
  currencyUnit: CurrencyUnit;
  onNavigateTab: (tab: string) => void;
  onSyncProduct: (id: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  products,
  fxRates,
  isPersian,
  currencyUnit,
  onNavigateTab,
  onSyncProduct,
}) => {
  const totalProducts = products.length;
  const outOfSync = products.filter((p) => p.syncStatus !== 'SYNCED');
  const marginRisks = products.filter((p) => p.syncStatus === 'MARGIN_RISK');

  // Buy Box estimation
  let buyBoxCount = 0;
  products.forEach((p) => {
    const lowest = p.competitors.find((c) => c.isLowest);
    if (!lowest || p.currentPriceToman <= lowest.priceToman) {
      buyBoxCount++;
    }
  });
  const buyBoxRate = totalProducts > 0 ? Math.round((buyBoxCount / totalProducts) * 100) : 100;

  // Average margin
  const avgMargin = Math.round(
    products.reduce((acc, p) => {
      const margin = ((p.currentPriceToman - p.baseCostToman) / p.currentPriceToman) * 100;
      return acc + margin;
    }, 0) / (totalProducts || 1)
  );

  const usdtRate = fxRates.find((r) => r.code === 'USDT') || fxRates[0];

  return (
    <div className="space-y-6">
      {/* Alert Banner if products need sync */}
      {outOfSync.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900/60 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-amber-950/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {isPersian
                  ? `${outOfSync.length} کالا نیازمند به‌روزرسانی فوری قیمت هستند`
                  : `${outOfSync.length} SKUs require immediate price synchronization`}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isPersian
                  ? 'برخی رقبا در ترب و دیجی‌کالا قیمت را کاهش داده‌اند یا نرخ تتر جابجا شده است. برای حفظ رتبه اول فروش، قیمت‌های پیشنهادی را بررسی کنید.'
                  : 'Competitors have dropped prices on Torob or the Tether peg has shifted. Apply suggested prices to maintain optimal sales ranking.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('products')}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition flex items-center gap-1.5 shadow"
          >
            <span>{isPersian ? 'بررسی کالاها' : 'Review SKUs'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total SKUs */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {isPersian ? 'تعداد کالاهای تحت پایش' : 'Total Monitored SKUs'}
            </span>
            <div className="p-2 rounded-lg bg-slate-800 text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white tracking-tight">{totalProducts}</span>
            <span className="text-xs text-slate-400 font-mono">SKUs</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3" />
            <span>{isPersian ? 'همگام با ووکامرس و ترب' : 'Synced with WooCommerce & Torob'}</span>
          </p>
        </div>

        {/* Card 2: Buy Box Win Rate */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {isPersian ? 'نرخ لیدری ترب (کمترین قیمت)' : 'Torob Buy-Box Win Rate'}
            </span>
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400 tracking-tight">
              {formatPercent(buyBoxRate, isPersian)}
            </span>
            <span className="text-xs text-slate-400">
              ({buyBoxCount} / {totalProducts})
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {isPersian ? 'سهم قرارگیری در ردیف اول ترب' : 'Lowest verified offer in Torob'}
          </p>
        </div>

        {/* Card 3: Average Profit Margin */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {isPersian ? 'میانگین حاشیه سود ناخالص' : 'Avg Profit Margin'}
            </span>
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-cyan-400 tracking-tight">
              {formatPercent(avgMargin, isPersian)}
            </span>
            <span className="text-xs text-slate-400 font-mono">Net Markup</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {isPersian ? 'کف حاشیه سود امن: ۵٪' : 'Safe floor threshold: 5.0%'}
          </p>
        </div>

        {/* Card 4: Live USDT Rate */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {isPersian ? 'نرخ زنده تتر (پایه محاسبه)' : 'Live Tether Peg Rate'}
            </span>
            <button
              onClick={() => onNavigateTab('rates')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Edit rates"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-white tracking-tight">
              {formatPrice(usdtRate.rateToman, currencyUnit, isPersian)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`text-[11px] font-bold flex items-center ${
                usdtRate.change24h >= 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {usdtRate.change24h >= 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {usdtRate.change24h > 0 ? `+${usdtRate.change24h}` : usdtRate.change24h}%
            </span>
            <span className="text-[11px] text-slate-500 font-mono">24h change</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Priority Attention Table & Real-time Market Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Urgent Price Discrepancies */}
        <div className="lg:col-span-2 rounded-xl bg-slate-900/80 border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{isPersian ? 'کالاهای دارای اختلاف قیمت' : 'Price Discrepancy Queue'}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {isPersian
                  ? 'کالاهایی که قیمت فعلی با قانون تعریف‌شده تفاوت دارد'
                  : 'SKUs where current shop price deviates from the active pricing algorithm'}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              <span>{isPersian ? 'مشاهده همه کالاها' : 'View Catalog'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-2.5 px-3">{isPersian ? 'کالا و کد SKU' : 'SKU & Title'}</th>
                  <th className="py-2.5 px-3">{isPersian ? 'قیمت فعلی' : 'Current Price'}</th>
                  <th className="py-2.5 px-3">{isPersian ? 'قیمت پیشنهادی' : 'Suggested'}</th>
                  <th className="py-2.5 px-3">{isPersian ? 'کمترین در ترب' : 'Torob Lowest'}</th>
                  <th className="py-2.5 px-3 text-right">{isPersian ? 'عملیات' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {products.slice(0, 5).map((prod) => {
                  const lowestComp = prod.competitors.find((c) => c.isLowest);
                  const diff = prod.suggestedPriceToman - prod.currentPriceToman;
                  return (
                    <tr key={prod.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200">
                          {isPersian ? prod.titleFa : prod.titleEn}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{prod.sku}</div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-300 whitespace-nowrap">
                        {formatPrice(prod.currentPriceToman, currencyUnit, isPersian)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-bold text-cyan-400">
                          {formatPrice(prod.suggestedPriceToman, currencyUnit, isPersian)}
                        </div>
                        {diff !== 0 && (
                          <span
                            className={`text-[10px] font-mono ${
                              diff < 0 ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
                            {diff > 0 ? '+' : ''}
                            {formatPrice(diff, currencyUnit, isPersian)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {lowestComp ? (
                          <div>
                            <span className="font-medium text-slate-300">
                              {formatPrice(lowestComp.priceToman, currencyUnit, isPersian)}
                            </span>
                            <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                              {lowestComp.sellerName}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {prod.syncStatus !== 'SYNCED' ? (
                          <button
                            onClick={() => onSyncProduct(prod.id)}
                            className="px-2.5 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-[11px] shadow-sm transition"
                          >
                            {isPersian ? 'اعمال قیمت' : 'Apply Sync'}
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            {isPersian ? 'همگام' : 'Synced'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Platform & Rates Glance */}
        <div className="space-y-4">
          {/* Marketplace Status Box */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{isPersian ? 'وضعیت کانال‌های فروشگاهی' : 'Store Channels & Crawlers'}</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <div>
                    <span className="text-xs font-semibold text-slate-200">Torob Crawler Feed</span>
                    <p className="text-[10px] text-slate-400">XML/JSON API • Active</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-medium">200 OK</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <div>
                    <span className="text-xs font-semibold text-slate-200">WooCommerce Webhook</span>
                    <p className="text-[10px] text-slate-400">Bidirectional Sync</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-medium">Connected</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                  <div>
                    <span className="text-xs font-semibold text-slate-200">Digikala Seller API</span>
                    <p className="text-[10px] text-slate-400">Marketplace Stock/Price</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 font-medium">Ready</span>
              </div>
            </div>
          </div>

          {/* Quick Rates Glance */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">
                {isPersian ? 'خلاصه نرخ ارز بازار' : 'Market FX Rates'}
              </h3>
              <button
                onClick={() => onNavigateTab('rates')}
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                {isPersian ? 'مدیریت' : 'Manage'}
              </button>
            </div>
            <div className="divide-y divide-slate-800 text-xs">
              {fxRates.slice(0, 4).map((rate) => (
                <div key={rate.id} className="py-2 flex items-center justify-between">
                  <div>
                    <span className="text-slate-300 font-medium">
                      {isPersian ? rate.nameFa : rate.name}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1 font-mono">({rate.code})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-200">
                      {formatPrice(rate.rateToman, currencyUnit, isPersian)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
