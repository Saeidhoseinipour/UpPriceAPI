import React, { useState, useEffect } from 'react';
import { Product, PricingRule } from '../types';
import { X, Save, Plus } from 'lucide-react';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  rules: PricingRule[];
  isPersian: boolean;
  onSave: (productData: Partial<Product>) => void;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  isOpen,
  onClose,
  product,
  rules,
  isPersian,
  onSave,
}) => {
  const isEditing = Boolean(product);

  const [sku, setSku] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [titleFa, setTitleFa] = useState('');
  const [category, setCategory] = useState('Smartphones');
  const [categoryFa, setCategoryFa] = useState('موبایل');
  const [brand, setBrand] = useState('');
  const [stock, setStock] = useState('10');
  const [baseCostToman, setBaseCostToman] = useState('40000000');
  const [baseCostUsd, setBaseCostUsd] = useState('430');
  const [currentPriceToman, setCurrentPriceToman] = useState('45000000');
  const [ruleId, setRuleId] = useState(rules[0]?.id || '');
  const [minPriceFloorToman, setMinPriceFloorToman] = useState('42000000');
  const [torobUrl, setTorobUrl] = useState('');
  const [autoSync, setAutoSync] = useState(true);

  useEffect(() => {
    if (product) {
      setSku(product.sku);
      setTitleEn(product.titleEn);
      setTitleFa(product.titleFa);
      setCategory(product.category);
      setCategoryFa(product.categoryFa);
      setBrand(product.brand);
      setStock(product.stock.toString());
      setBaseCostToman(product.baseCostToman.toString());
      setBaseCostUsd(product.baseCostUsd?.toString() || '');
      setCurrentPriceToman(product.currentPriceToman.toString());
      setRuleId(product.ruleId);
      setMinPriceFloorToman(product.minPriceFloorToman.toString());
      setTorobUrl(product.torobUrl || '');
      setAutoSync(product.autoSync);
    } else {
      setSku(`SKU-${Date.now().toString().slice(-5)}`);
      setTitleEn('');
      setTitleFa('');
      setCategory('Smartphones');
      setCategoryFa('موبایل');
      setBrand('');
      setStock('10');
      setBaseCostToman('30000000');
      setBaseCostUsd('320');
      setCurrentPriceToman('34000000');
      setRuleId(rules[0]?.id || '');
      setMinPriceFloorToman('31500000');
      setTorobUrl('');
      setAutoSync(true);
    }
  }, [product, isOpen, rules]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: product?.id,
      sku,
      titleEn,
      titleFa: titleFa || titleEn,
      category,
      categoryFa,
      brand: brand || 'Generic',
      stock: Number(stock) || 0,
      baseCostToman: Number(baseCostToman) || 1000000,
      baseCostUsd: baseCostUsd ? Number(baseCostUsd) : undefined,
      currentPriceToman: Number(currentPriceToman) || 1100000,
      ruleId,
      minPriceFloorToman: Number(minPriceFloorToman) || Number(baseCostToman) * 1.05,
      torobUrl,
      autoSync,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">
            {isEditing
              ? isPersian
                ? 'ویرایش اطلاعات کالا و قانون قیمت'
                : 'Edit Product & Pricing Rule'
              : isPersian
              ? 'افزودن کالای جدید به سیستم پایش'
              : 'Add New Monitored SKU'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">SKU / شناسه محصول</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">برند (Brand)</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Apple, Samsung, Sony"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              {isPersian ? 'عنوان فارسی محصول (نمایش در ترب و فروشگاه)' : 'Product Title (FA)'}
            </label>
            <input
              type="text"
              required
              value={titleFa}
              onChange={(e) => setTitleFa(e.target.value)}
              placeholder="گوشی موبایل اپل مدل iPhone 13"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              {isPersian ? 'عنوان انگلیسی محصول' : 'Product Title (EN)'}
            </label>
            <input
              type="text"
              required
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="Apple iPhone 13 128GB"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isPersian ? 'قیمت خرید تمام‌شده (تومان)' : 'Base Cost Price (Toman)'}
              </label>
              <input
                type="number"
                required
                value={baseCostToman}
                onChange={(e) => setBaseCostToman(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isPersian ? 'قیمت خرید دلاری (اختیاری جهت شناورسازی)' : 'USD Cost (Optional)'}
              </label>
              <input
                type="number"
                value={baseCostUsd}
                onChange={(e) => setBaseCostUsd(e.target.value)}
                placeholder="e.g. 550"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isPersian ? 'قیمت فروش فعلی (تومان)' : 'Current Selling Price (Toman)'}
              </label>
              <input
                type="number"
                required
                value={currentPriceToman}
                onChange={(e) => setCurrentPriceToman(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isPersian ? 'کف قیمت امن (تومان)' : 'Min Price Floor (Toman)'}
              </label>
              <input
                type="number"
                required
                value={minPriceFloorToman}
                onChange={(e) => setMinPriceFloorToman(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-rose-300 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isPersian ? 'الگوریتم قیمت‌گذاری فعال' : 'Assigned Pricing Rule'}
              </label>
              <select
                value={ruleId}
                onChange={(e) => setRuleId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              >
                {rules.map((r) => (
                  <option key={r.id} value={r.id}>
                    {isPersian ? r.nameFa : r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isPersian ? 'موجودی انبار' : 'Stock Quantity'}
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              {isPersian ? 'لینک صفحه محصول در ترب' : 'Torob Product Page URL'}
            </label>
            <input
              type="url"
              value={torobUrl}
              onChange={(e) => setTorobUrl(e.target.value)}
              placeholder="https://torob.com/p/..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
            >
              {isPersian ? 'انصراف' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 shadow"
            >
              <Save className="w-4 h-4" />
              <span>{isPersian ? 'ذخیره کالا' : 'Save SKU'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
