import React from 'react';
import { PriceAuditLog, CurrencyUnit } from '../types';
import { formatPrice } from '../utils/formatters';
import {
  History,
  RotateCcw,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Tag,
  CheckCircle,
} from 'lucide-react';

interface HistoryAuditProps {
  logs: PriceAuditLog[];
  isPersian: boolean;
  currencyUnit: CurrencyUnit;
  onRollback: (logId: string) => void;
}

export const HistoryAudit: React.FC<HistoryAuditProps> = ({
  logs,
  isPersian,
  currencyUnit,
  onRollback,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <span>{isPersian ? 'تاریخچه تغییرات قیمت و بازگردانی (Rollback)' : 'Price Audit Trail & Rollback'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {isPersian
              ? 'تمام تغییرات اعمال‌شده بر قیمت‌ها ثبت شده و در صورت لزوم می‌توانید با یک کلیک قیمت را به مقدار پیشین بازگردانید.'
              : 'Every price shift triggered by competitor movements, FX rates, or API calls is recorded here with one-click rollback.'}
          </p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold text-[11px]">
                <th className="py-3 px-4">{isPersian ? 'زمان تغییر' : 'Timestamp'}</th>
                <th className="py-3 px-3">{isPersian ? 'نام کالا' : 'Product / Target'}</th>
                <th className="py-3 px-3">{isPersian ? 'قیمت قبلی' : 'Old Price'}</th>
                <th className="py-3 px-3">{isPersian ? 'قیمت جدید' : 'New Price'}</th>
                <th className="py-3 px-3">{isPersian ? 'دلیل و منبع تغییر' : 'Reason & Source'}</th>
                <th className="py-3 px-4 text-right">{isPersian ? 'بازگردانی' : 'Rollback'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              {logs.map((log) => {
                const diff = log.newPriceToman - log.oldPriceToman;
                const date = new Date(log.timestamp);

                return (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {date.toLocaleTimeString()} <span className="text-slate-600">({date.toLocaleDateString()})</span>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-200">
                      {log.productTitle}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-400">
                      {formatPrice(log.oldPriceToman, currencyUnit, isPersian)}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-white">
                        {formatPrice(log.newPriceToman, currencyUnit, isPersian)}
                      </div>
                      {diff !== 0 && (
                        <span
                          className={`text-[10px] font-mono ${
                            diff > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {diff > 0 ? '+' : ''}
                          {formatPrice(diff, currencyUnit, isPersian)}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-slate-300 text-xs font-medium">
                        {isPersian ? log.changeReasonFa : log.changeReason}
                      </div>
                      <span className="inline-block mt-1 font-mono text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                        {log.source}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {log.productId !== 'SYSTEM_FX' && (
                        <button
                          onClick={() => onRollback(log.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium inline-flex items-center gap-1 transition"
                          title="Revert price back to old price"
                        >
                          <RotateCcw className="w-3 h-3 text-cyan-400" />
                          <span>{isPersian ? 'بازگردانی' : 'Rollback'}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
