import React, { useState } from 'react';
import { Product, CurrencyUnit } from '../types';
import { formatPrice } from '../utils/formatters';
import {
  Sparkles,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  ShieldCheck,
  Building2,
  TrendingDown,
} from 'lucide-react';

interface AiPriceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selectedProduct: Product | null;
  isPersian: boolean;
  currencyUnit: CurrencyUnit;
  onApplyDiscoveredPrice: (productId: string, priceToman: number, sellerName: string, sourceUrl: string) => void;
}

export const AiPriceSearchModal: React.FC<AiPriceSearchModalProps> = ({
  isOpen,
  onClose,
  products,
  selectedProduct,
  isPersian,
  currencyUnit,
  onApplyDiscoveredPrice,
}) => {
  const [selectedId, setSelectedId] = useState<string>(selectedProduct?.id || products[0]?.id || '');
  const [customSearchQuery, setCustomSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedProduct) {
      setSelectedId(selectedProduct.id);
      setCustomSearchQuery(selectedProduct.titleFa || selectedProduct.titleEn);
    }
  }, [selectedProduct, isOpen]);

  if (!isOpen) return null;

  const currentProd = products.find((p) => p.id === selectedId);

  const handleSearch = async () => {
    setIsSearching(true);
    setResult(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v1/ai/find-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedId,
          query: customSearchQuery || (currentProd ? (currentProd.titleFa || currentProd.titleEn) : ''),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Search failed');
      }

      if (data.found && data.discovered) {
        setResult(data);
      } else {
        setErrorMsg(data.message || 'No confirmed prices found in search results.');
        if (data.sources) {
          setResult({ sources: data.sources });
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing AI search.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleApply = () => {
    if (!result?.discovered || !selectedId) return;
    onApplyDiscoveredPrice(
      selectedId,
      result.discovered.lowestPriceToman,
      result.discovered.sellerName,
      result.discovered.sourceUrl || result.sources?.[0]?.uri || ''
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 text-white shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isPersian ? 'کشف زنده قیمت با هوش مصنوعی (Gemini Search)' : 'AI Live Price Discovery (Gemini)'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                  Grounding Live
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isPersian
                  ? 'جستجوی زنده در ترب، دیجی‌کالا و فروشگاه‌های آنلاین ایران بدون مسدود شدن توسط ربات‌گیر'
                  : 'Live online search across Torob, Digikala, and Iranian web stores via Google Search Grounding'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input / Target Selection */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {isPersian ? 'انتخاب کالا از انبار:' : 'Select Target Product:'}
            </label>
            <select
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                const p = products.find((x) => x.id === e.target.value);
                if (p) setCustomSearchQuery(p.titleFa || p.titleEn);
              }}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} — {p.titleFa || p.titleEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {isPersian ? 'عبارت جستجوی هوشمند (قابل ویرایش):' : 'Search Query for Gemini:'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customSearchQuery}
                onChange={(e) => setCustomSearchQuery(e.target.value)}
                placeholder={isPersian ? 'نام مدل کالا و مشخصات فنی...' : 'e.g. Samsung Galaxy S24 256GB'}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 font-medium"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow disabled:opacity-50 transition"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>{isSearching ? (isPersian ? 'در حال جستجو...' : 'Searching...') : (isPersian ? 'جستجوی زنده در وب' : 'Search Live Web')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading Banner */}
        {isSearching && (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-800/40 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
            <div className="text-xs">
              <span className="font-semibold text-white block">
                {isPersian ? 'در حال خزش صفحات وب با Google Search Grounding...' : 'Crawling web pages via Google Search Grounding...'}
              </span>
              <span className="text-slate-400 text-[11px]">
                {isPersian
                  ? 'بررسی قیمت‌های لحظه‌ای در ترب، دیجی‌کالا، ایمالز و استخراج کمترین قیمت موجود'
                  : 'Analyzing real-time prices on Torob, Digikala, and extracting lowest verified seller'}
              </span>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && !isSearching && (
          <div className="p-3.5 rounded-lg bg-amber-950/50 border border-amber-800/60 text-xs text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">{isPersian ? 'پیام جستجو:' : 'Search notice:'}</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Results Card */}
        {result?.discovered && !isSearching && (
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isPersian ? 'قیمت واقعی کشف شد' : 'Real Online Price Found'}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Confidence: {Math.round((result.discovered.confidenceScore || 0.95) * 100)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">
                  {isPersian ? 'کمترین قیمت در بازار آنلاین:' : 'Discovered Lowest Price:'}
                </span>
                <span className="text-xl font-extrabold text-emerald-400 tracking-tight">
                  {formatPrice(result.discovered.lowestPriceToman, currencyUnit, isPersian)}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">
                  {isPersian ? 'فروشنده و پلتفرم:' : 'Seller & Platform:'}
                </span>
                <span className="font-bold text-white text-sm">
                  {result.discovered.sellerName}
                </span>
                <span className="text-[11px] text-cyan-400 block mt-0.5">
                  ({result.discovered.platform})
                </span>
              </div>
            </div>

            {result.discovered.summaryFa && (
              <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                {result.discovered.summaryFa}
              </p>
            )}

            {/* Citations & Sources */}
            {result.sources?.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  {isPersian ? 'منابع استناد شده در وب:' : 'Web Grounding Sources:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.sources.slice(0, 3).map((s: any, idx: number) => (
                    <a
                      key={idx}
                      href={s.uri}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-cyan-400 flex items-center gap-1 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">{s.title || s.uri}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Apply Action */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleApply}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isPersian
                    ? 'اعمال قیمت کشف‌شده روی این کالا و محاسبه مجدد'
                    : 'Apply Discovered Price to SKU'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
