import React, { useState } from 'react';
import { FXRate, Product, CurrencyUnit } from '../types';
import { formatPrice } from '../utils/formatters';
import {
  DollarSign,
  TrendingUp,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface FxRatesManagerProps {
  fxRates: FXRate[];
  products: Product[];
  isPersian: boolean;
  currencyUnit: CurrencyUnit;
  onUpdateRate: (code: string, newRateToman: number) => void;
}

export const FxRatesManager: React.FC<FxRatesManagerProps> = ({
  fxRates,
  products,
  isPersian,
  currencyUnit,
  onUpdateRate,
}) => {
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [rateInput, setRateInput] = useState<string>('');
  const [simulationPercent, setSimulationPercent] = useState<number>(0);

  const startEdit = (rate: FXRate) => {
    setEditingCode(rate.code);
    setRateInput(rate.rateToman.toString());
  };

  const saveEdit = (code: string) => {
    const num = Number(rateInput);
    if (num && num > 0) {
      onUpdateRate(code, num);
    }
    setEditingCode(null);
  };

  // Dollar pegged products
  const peggedProducts = products.filter((p) => p.baseCostUsd && p.baseCostUsd > 0);
  const activeUsdtRate = fxRates.find((r) => r.code === 'USDT')?.rateToman || 93000;
  const simulatedRate = Math.round(activeUsdtRate * (1 + simulationPercent / 100));

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-semibold mb-2">
            <Coins className="w-3.5 h-3.5" />
            <span>{isPersian ? 'مرجع نرخ ارز و مدیریت تورم' : 'FX & Inflation Sync'}</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {isPersian
              ? 'همگام‌سازی لحظه‌ای با نوسانات نرخ ارز و تتر'
              : 'Real-Time FX & Tether (USDT) Rate Management'}
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            {isPersian
              ? 'با تغییر هر یک از نرخ‌ها، قیمت تمام کالاهای متصل به ارز دلاری به صورت بلادرنگ بازتولید شده و فید ترب و ووکامرس به‌روزرسانی می‌شوند.'
              : 'Updating exchange rates automatically recalculates all pegged product suggested prices and updates the Torob e-commerce feed.'}
          </p>
        </div>
      </div>

      {/* FX Rates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {fxRates.map((rate) => {
          const isEditing = editingCode === rate.code;

          return (
            <div
              key={rate.id}
              className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold">
                    {rate.code}
                  </span>
                  <span
                    className={`text-xs font-bold flex items-center ${
                      rate.change24h >= 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {rate.change24h >= 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {rate.change24h > 0 ? `+${rate.change24h}` : rate.change24h}%
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm mb-1">
                  {isPersian ? rate.nameFa : rate.name}
                </h3>
                <p className="text-[10px] text-slate-500 mb-4">
                  {isPersian ? 'آخرین به‌روزرسانی: ' : 'Updated: '}
                  {new Date(rate.updatedAt).toLocaleTimeString()}
                </p>

                {isEditing ? (
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 block font-medium">
                      {isPersian ? 'نرخ جدید به تومان:' : 'New Rate (Tomans):'}
                    </label>
                    <input
                      type="number"
                      value={rateInput}
                      onChange={(e) => setRateInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-cyan-500 text-sm font-mono text-cyan-300 focus:outline-none"
                      autoFocus
                    />
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => saveEdit(rate.code)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                      >
                        {isPersian ? 'ذخیره و اعمال' : 'Apply Rate'}
                      </button>
                      <button
                        onClick={() => setEditingCode(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs"
                      >
                        {isPersian ? 'انصراف' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-baseline justify-between pt-2">
                    <span className="text-2xl font-extrabold text-white tracking-tight">
                      {formatPrice(rate.rateToman, currencyUnit, isPersian)}
                    </span>
                    <button
                      onClick={() => startEdit(rate)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                    >
                      {isPersian ? 'ویرایش' : 'Edit'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Currency Shock / What-If Simulator */}
      <div className="rounded-xl bg-slate-900/80 border border-cyan-900/40 p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              {isPersian
                ? 'شبیه‌ساز شوک ارزی و پیش‌نمایش تاثیر بر قیمت فروش'
                : 'Currency Shock & Price Elasticity Simulator'}
            </h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono font-bold">
            {simulationPercent >= 0 ? `+${simulationPercent}%` : `${simulationPercent}%`} FX Shift
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          {isPersian
            ? 'با جابجایی اسلایدر زیر، تاثیر افزایش یا کاهش فرضی نرخ تتر را بر روی قیمت تمام‌شده و قیمت فروش کالاهای دلاری مشاهده کنید:'
            : 'Move the slider to simulate currency fluctuation and evaluate the impact on retail prices of pegged items:'}
        </p>

        {/* Slider */}
        <div className="space-y-2 mb-6">
          <input
            type="range"
            min="-10"
            max="20"
            step="1"
            value={simulationPercent}
            onChange={(e) => setSimulationPercent(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>-10%</span>
            <span>0% (Current: {formatPrice(activeUsdtRate, currencyUnit, isPersian)})</span>
            <span className="text-cyan-400 font-bold">
              Simulated: {formatPrice(simulatedRate, currencyUnit, isPersian)}
            </span>
            <span>+20%</span>
          </div>
        </div>

        {/* Pegged Products Preview */}
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 font-semibold text-[11px] border-b border-slate-800">
                <th className="py-2.5 px-3">{isPersian ? 'کالای دلاری' : 'Pegged SKU'}</th>
                <th className="py-2.5 px-3">{isPersian ? 'قیمت خرید ارزی' : 'USD Cost'}</th>
                <th className="py-2.5 px-3">{isPersian ? 'قیمت فعلی ما' : 'Active Price'}</th>
                <th className="py-2.5 px-3">{isPersian ? 'قیمت شبیه‌سازی‌شده' : 'Simulated Price'}</th>
                <th className="py-2.5 px-3 text-right">{isPersian ? 'اختلاف' : 'Delta'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {peggedProducts.map((prod) => {
                const simulatedPriceToman = Math.round(
                  (prod.baseCostUsd || 100) * simulatedRate * 1.09
                );
                const roundedSimulated = Math.round(simulatedPriceToman / 10000) * 10000;
                const delta = roundedSimulated - prod.currentPriceToman;

                return (
                  <tr key={prod.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-200">
                        {isPersian ? prod.titleFa : prod.titleEn}
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">{prod.sku}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-cyan-400">
                      ${prod.baseCostUsd} USD
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {formatPrice(prod.currentPriceToman, currencyUnit, isPersian)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">
                      {formatPrice(roundedSimulated, currencyUnit, isPersian)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      <span
                        className={
                          delta > 0
                            ? 'text-emerald-400 font-bold'
                            : delta < 0
                            ? 'text-rose-400 font-bold'
                            : 'text-slate-500'
                        }
                      >
                        {delta > 0 ? '+' : ''}
                        {formatPrice(delta, currencyUnit, isPersian)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {simulationPercent !== 0 && (
          <div className="mt-4 flex items-center justify-end">
            <button
              onClick={() => onUpdateRate('USDT', simulatedRate)}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition"
            >
              {isPersian
                ? `اعمال نرخ تتر ${formatPrice(simulatedRate, currencyUnit, isPersian)} روی همه کالاها`
                : `Commit Simulated Rate (${formatPrice(simulatedRate, currencyUnit, isPersian)})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
