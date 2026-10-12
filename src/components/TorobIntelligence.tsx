import React from 'react';
import { Product, CurrencyUnit } from '../types';
import { formatPrice, formatPercent, calculateMargin } from '../utils/formatters';
import {
  Zap,
  Award,
  AlertTriangle,
  TrendingDown,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  BarChart3,
} from 'lucide-react';

interface TorobIntelligenceProps {
  products: Product[];
  isPersian: boolean;
  currencyUnit: CurrencyUnit;
  onSyncProduct: (id: string) => void;
  onSimulateCompetitorMove: (productId: string, dropAmount: number) => void;
}

export const TorobIntelligence: React.FC<TorobIntelligenceProps> = ({
  products,
  isPersian,
  currencyUnit,
  onSyncProduct,
  onSimulateCompetitorMove,
}) => {
  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-semibold mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>{isPersian ? 'دیده‌بان هوشمند ترب (Torob Buy-Box)' : 'Torob Buy-Box Radar'}</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {isPersian
                ? 'رصد بلادرنگ قیمت‌های رقبا در ترب و دیجی‌کالا'
                : 'Real-Time Competitor Price Monitoring on Torob & Digikala'}
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              {isPersian
                ? 'موتور UpPriceAPI به صورت مداوم لیست فروشندگان ترب را خزش کرده و به محض تغییر قیمت رقبا، قیمت پیشنهادی جدید شما را با در نظر گرفتن کف سود مطمئن محاسبه می‌کند.'
                : 'UpPriceAPI monitors seller listings on Torob and immediately recalculates your optimal undercut pricing without violating minimum profit margins.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSimulateCompetitorMove(products[0]?.id, 400000)}
              className="px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <TrendingDown className="w-4 h-4 text-amber-400" />
              <span>{isPersian ? 'شبیه‌سازی افت قیمت رقیب (-۴۰۰ هزار)' : 'Simulate Competitor Drop'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Competitor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((prod) => {
          const lowestComp = prod.competitors.find((c) => c.isLowest);
          const isWinning = !lowestComp || prod.currentPriceToman <= lowestComp.priceToman;
          const currentMargin = calculateMargin(prod.currentPriceToman, prod.baseCostToman);
          const suggestedMargin = calculateMargin(prod.suggestedPriceToman, prod.baseCostToman);

          return (
            <div
              key={prod.id}
              className={`rounded-xl border p-4 transition flex flex-col justify-between ${
                isWinning
                  ? 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/40'
                  : 'bg-slate-900/90 border-amber-500/30 shadow-lg shadow-amber-950/10'
              }`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-semibold">
                    {prod.sku}
                  </span>
                  {isWinning ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      <Award className="w-3 h-3" />
                      <span>{isPersian ? 'رتبه ۱ ترب (لیدر)' : 'Winning Buy-Box'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{isPersian ? 'از دست رفته' : 'Lost Buy-Box'}</span>
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-white text-xs line-clamp-1 mb-3">
                  {isPersian ? prod.titleFa : prod.titleEn}
                </h3>

                {/* Price Matrix */}
                <div className="space-y-2 rounded-lg bg-slate-950/70 p-3 border border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{isPersian ? 'قیمت فروشگاه ما:' : 'Our Shop:'}</span>
                    <span className="font-bold text-white">
                      {formatPrice(prod.currentPriceToman, currencyUnit, isPersian)}
                    </span>
                  </div>

                  {lowestComp && (
                    <div className="flex items-center justify-between">
                      <div className="text-slate-400 flex items-center gap-1">
                        <span>{isPersian ? 'کمترین رقیب:' : 'Lowest Competitor:'}</span>
                        <span className="text-[10px] text-slate-500">({lowestComp.sellerName})</span>
                      </div>
                      <span className="font-semibold text-amber-300">
                        {formatPrice(lowestComp.priceToman, currencyUnit, isPersian)}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-cyan-400 font-medium">
                      {isPersian ? 'پیشنهاد UpPriceAPI:' : 'Suggested Fix:'}
                    </span>
                    <span className="font-extrabold text-cyan-300">
                      {formatPrice(prod.suggestedPriceToman, currencyUnit, isPersian)}
                    </span>
                  </div>
                </div>

                {/* Margins & Floor safety */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>
                    {isPersian ? 'حاشیه سود فعلی:' : 'Current Margin:'}{' '}
                    <strong className="text-slate-200">{formatPercent(currentMargin, isPersian)}</strong>
                  </span>
                  <span>
                    {isPersian ? 'سود در قیمت جدید:' : 'New Margin:'}{' '}
                    <strong className="text-cyan-300">{formatPercent(suggestedMargin, isPersian)}</strong>
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isPersian ? 'کف سود محفوظ' : 'Floor protected'}</span>
                </div>

                <div className="flex items-center gap-2">
                  {prod.syncStatus !== 'SYNCED' && (
                    <button
                      onClick={() => onSyncProduct(prod.id)}
                      className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition"
                    >
                      {isPersian ? 'همگام‌سازی' : 'Apply Sync'}
                    </button>
                  )}
                  {prod.torobUrl && (
                    <a
                      href={prod.torobUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                      title="Open Torob"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
