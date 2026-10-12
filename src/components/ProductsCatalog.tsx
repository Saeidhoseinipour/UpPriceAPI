import React, { useState } from 'react';
import { Product, PricingRule, CurrencyUnit } from '../types';
import { formatPrice, formatPercent, calculateMargin } from '../utils/formatters';
import {
  Search,
  Plus,
  RefreshCw,
  Edit2,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Tag,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface ProductsCatalogProps {
  products: Product[];
  rules: PricingRule[];
  isPersian: boolean;
  currencyUnit: CurrencyUnit;
  onSyncProduct: (id: string) => void;
  onUpdateProductPrice: (id: string, newPriceToman: number) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (product: Product) => void;
  onOpenAiSearchProduct?: (product: Product) => void;
  onBatchSync: (mode: 'OUT_OF_SYNC' | 'ALL') => void;
  isSyncing: boolean;
}

export const ProductsCatalog: React.FC<ProductsCatalogProps> = ({
  products,
  rules,
  isPersian,
  currencyUnit,
  onSyncProduct,
  onUpdateProductPrice,
  onOpenAddModal,
  onOpenEditModal,
  onOpenAiSearchProduct,
  onBatchSync,
  isSyncing,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [inlinePriceInput, setInlinePriceInput] = useState<string>('');

  // Categories list
  const categories = Array.from(new Set(products.map((p) => p.category)));

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.titleEn.toLowerCase().includes(search.toLowerCase()) ||
      p.titleFa.includes(search) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesStatus = statusFilter === 'ALL' || p.syncStatus === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleStartInlineEdit = (product: Product) => {
    setEditingPriceId(product.id);
    setInlinePriceInput(product.currentPriceToman.toString());
  };

  const handleSaveInlineEdit = (productId: string) => {
    const numeric = Number(inlinePriceInput.replace(/[^0-9]/g, ''));
    if (numeric && numeric > 0) {
      onUpdateProductPrice(productId, numeric);
    }
    setEditingPriceId(null);
  };

  const outOfSyncCount = products.filter((p) => p.syncStatus !== 'SYNCED').length;

  return (
    <div className="space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isPersian
                  ? 'جستجو بر اساس نام کالا، مدل، برند یا کد SKU...'
                  : 'Search by SKU, product name, brand...'
              }
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2">
            {outOfSyncCount > 0 && (
              <button
                onClick={() => onBatchSync('OUT_OF_SYNC')}
                disabled={isSyncing}
                className="px-3.5 py-2 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>
                  {isPersian
                    ? `همگام‌سازی (${outOfSyncCount} کالا)`
                    : `Sync Out of Sync (${outOfSyncCount})`}
                </span>
              </button>
            )}

            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>{isPersian ? 'افزودن کالای جدید' : 'Add New SKU'}</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 text-[11px] font-medium mr-1">
              {isPersian ? 'وضعیت:' : 'Status:'}
            </span>
            {[
              { id: 'ALL', labelEn: 'All SKUs', labelFa: 'همه کالاها' },
              { id: 'OUT_OF_SYNC', labelEn: 'Out of Sync', labelFa: 'نیازمند همگام‌سازی' },
              { id: 'PRICE_DROP_ALERT', labelEn: 'Competitor Cut', labelFa: 'کاهش قیمت رقیب' },
              { id: 'MARGIN_RISK', labelEn: 'Margin Risk', labelFa: 'هشدار سود' },
              { id: 'SYNCED', labelEn: 'Synced', labelFa: 'همگام' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                  statusFilter === st.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {isPersian ? st.labelFa : st.labelEn}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 text-[11px] font-medium">
              {isPersian ? 'دسته‌بندی:' : 'Category:'}
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">{isPersian ? 'همه دسته‌ها' : 'All Categories'}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">{isPersian ? 'اطلاعات کالا' : 'Product / SKU'}</th>
                <th className="py-3 px-3">{isPersian ? 'قیمت خرید (تمام‌شده)' : 'Cost Price'}</th>
                <th className="py-3 px-3">{isPersian ? 'قیمت فروش ما' : 'Our Active Price'}</th>
                <th className="py-3 px-3">{isPersian ? 'قیمت پیشنهادی الگوریتم' : 'Algorithm Suggested'}</th>
                <th className="py-3 px-3">{isPersian ? 'حاشیه سود' : 'Profit Margin'}</th>
                <th className="py-3 px-3">{isPersian ? 'پایش ترب و رقبا' : 'Torob Competitors'}</th>
                <th className="py-3 px-4 text-right">{isPersian ? 'عملیات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    {isPersian ? 'هیچ کالایی با این فیلتر یافت نشد.' : 'No products found matching filters.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const rule = rules.find((r) => r.id === prod.ruleId);
                  const margin = calculateMargin(prod.currentPriceToman, prod.baseCostToman);
                  const lowestCompetitor = prod.competitors.find((c) => c.isLowest);
                  const isBuyBoxWinner = !lowestCompetitor || prod.currentPriceToman <= lowestCompetitor.priceToman;
                  const priceDiff = prod.suggestedPriceToman - prod.currentPriceToman;
                  const isEditingThisPrice = editingPriceId === prod.id;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-800/30 transition group">
                      {/* Product Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <div>
                            <div className="font-semibold text-slate-200 line-clamp-1 group-hover:text-cyan-300 transition">
                              {isPersian ? prod.titleFa : prod.titleEn}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                                {prod.sku}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {isPersian ? prod.categoryFa : prod.category}
                              </span>
                              <span className="text-[10px] text-slate-500">•</span>
                              <span className="text-[10px] text-slate-400">
                                {isPersian ? `موجودی: ${prod.stock}` : `Stock: ${prod.stock}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Base Cost */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-medium text-slate-300">
                          {formatPrice(prod.baseCostToman, currencyUnit, isPersian)}
                        </div>
                        {prod.baseCostUsd && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            ${prod.baseCostUsd} USD
                          </div>
                        )}
                      </td>

                      {/* Current Active Price with Inline Edit */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {isEditingThisPrice ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={inlinePriceInput}
                              onChange={(e) => setInlinePriceInput(e.target.value)}
                              className="w-28 px-2 py-1 rounded bg-slate-950 border border-cyan-500 text-xs font-mono text-cyan-300 focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveInlineEdit(prod.id)}
                              className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                              title="Save"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingPriceId(null)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 group/price">
                            <span className="font-bold text-white text-xs">
                              {formatPrice(prod.currentPriceToman, currencyUnit, isPersian)}
                            </span>
                            <button
                              onClick={() => handleStartInlineEdit(prod)}
                              className="opacity-0 group-hover/price:opacity-100 text-slate-500 hover:text-cyan-400 transition"
                              title="Click to quickly edit price"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {isPersian ? 'کف قیمت امن:' : 'Floor:'}{' '}
                          {formatPrice(prod.minPriceFloorToman, currencyUnit, isPersian)}
                        </div>
                      </td>

                      {/* Suggested Price & Delta */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-cyan-400 text-xs">
                            {formatPrice(prod.suggestedPriceToman, currencyUnit, isPersian)}
                          </span>
                          {priceDiff !== 0 && (
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold flex items-center ${
                                priceDiff < 0
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {priceDiff < 0 ? (
                                <TrendingDown className="w-3 h-3 mr-0.5" />
                              ) : (
                                <TrendingUp className="w-3 h-3 mr-0.5" />
                              )}
                              {priceDiff > 0 ? '+' : ''}
                              {formatPrice(priceDiff, currencyUnit, isPersian)}
                            </span>
                          )}
                        </div>
                        {rule && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Tag className="w-2.5 h-2.5 text-cyan-400" />
                            <span className="truncate max-w-[140px]">
                              {isPersian ? rule.nameFa : rule.name}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Margin % */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            margin >= 10
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : margin >= 5
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {formatPercent(margin, isPersian)}
                        </span>
                      </td>

                      {/* Torob Competitor */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {lowestCompetitor ? (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-200">
                                {formatPrice(lowestCompetitor.priceToman, currencyUnit, isPersian)}
                              </span>
                              {isBuyBoxWinner ? (
                                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                                  {isPersian ? 'لیدر اول ترب' : 'Buy-Box Win'}
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-bold">
                                  {isPersian ? 'از دست رفته' : 'Lost Rank'}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[150px] mt-0.5">
                              {lowestCompetitor.sellerName} ({lowestCompetitor.platform})
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {prod.syncStatus !== 'SYNCED' ? (
                            <button
                              onClick={() => onSyncProduct(prod.id)}
                              className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-[11px] shadow-sm transition flex items-center gap-1"
                              title="Accept suggested price and sync to shop"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{isPersian ? 'اعمال' : 'Sync'}</span>
                            </button>
                          ) : (
                            <span className="px-2 py-1 text-slate-500 text-[11px] font-mono">
                              ✓ {isPersian ? 'همگام' : 'Synced'}
                            </span>
                          )}

                          <button
                            onClick={() => onOpenAiSearchProduct?.(prod)}
                            className="p-1 rounded bg-gradient-to-r from-cyan-950 to-emerald-950 border border-cyan-800/60 hover:border-cyan-500/80 text-cyan-300 transition"
                            title="Search live price online with Gemini AI"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          </button>

                          <button
                            onClick={() => onOpenEditModal(prod)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            title="Edit Product & Rule"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {prod.torobUrl && (
                            <a
                              href={prod.torobUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition"
                              title="Open in Torob"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
