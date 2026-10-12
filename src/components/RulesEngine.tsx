import React, { useState } from 'react';
import { PricingRule, CurrencyUnit } from '../types';
import { formatPrice } from '../utils/formatters';
import {
  Sliders,
  CheckCircle,
  Plus,
  Shield,
  DollarSign,
  TrendingDown,
  Percent,
  Layers,
  Edit,
} from 'lucide-react';

interface RulesEngineProps {
  rules: PricingRule[];
  isPersian: boolean;
  currencyUnit: CurrencyUnit;
  onSaveRule: (rule: Partial<PricingRule>) => void;
}

export const RulesEngine: React.FC<RulesEngineProps> = ({
  rules,
  isPersian,
  currencyUnit,
  onSaveRule,
}) => {
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [ruleName, setRuleName] = useState('');
  const [ruleNameFa, setRuleNameFa] = useState('');
  const [ruleType, setRuleType] = useState<PricingRule['type']>('COMPETITOR_UNDERCUT');
  const [undercutAmount, setUndercutAmount] = useState('20000');
  const [marginPct, setMarginPct] = useState('10');
  const [minMarginPct, setMinMarginPct] = useState('5');
  const [fxCode, setFxCode] = useState('USDT');
  const [roundingNearest, setRoundingNearest] = useState('5000');

  const openEdit = (rule: PricingRule) => {
    setEditingRule(rule);
    setRuleName(rule.name);
    setRuleNameFa(rule.nameFa);
    setRuleType(rule.type);
    setUndercutAmount(rule.undercutAmountToman?.toString() || '20000');
    setMarginPct(rule.marginPercent?.toString() || '10');
    setMinMarginPct(rule.minMarginPercent?.toString() || '5');
    setFxCode(rule.fxRateCode || 'USDT');
    setRoundingNearest(rule.roundingNearestToman.toString());
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRule({
      id: editingRule ? editingRule.id : undefined,
      name: ruleName || 'Custom Pricing Rule',
      nameFa: ruleNameFa || 'قانون قیمت‌گذاری جدید',
      type: ruleType,
      undercutAmountToman: Number(undercutAmount) || 20000,
      marginPercent: Number(marginPct) || 10,
      minMarginPercent: Number(minMarginPct) || 5,
      fxRateCode: fxCode,
      roundingNearestToman: Number(roundingNearest) || 5000,
      active: true,
    });
    setShowAddModal(false);
    setEditingRule(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <span>{isPersian ? 'موتور قوانین و استراتژی قیمت‌گذاری' : 'Dynamic Pricing Rules Engine'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {isPersian
              ? 'فرمول‌های قیمت‌گذاری خودکار را تعریف کنید: رقابت با ترب، وابستگی به نوسان نرخ تتر/دلار، یا درصد سود ثابت بر اساس فاکتور خرید.'
              : 'Define algorithmic pricing strategies: Torob Buy-Box undercutting, Tether/USD currency linkage, or fixed cost-plus markups.'}
          </p>
        </div>

        <button
          onClick={() => {
            setEditingRule(null);
            setRuleName('');
            setRuleNameFa('');
            setShowAddModal(true);
          }}
          className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isPersian ? 'تعریف قانون جدید' : 'Create New Rule'}</span>
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => {
          return (
            <div
              key={rule.id}
              className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-slate-800 text-cyan-400">
                      {rule.type === 'COMPETITOR_UNDERCUT' && <TrendingDown className="w-4 h-4" />}
                      {rule.type === 'FX_LINKED' && <DollarSign className="w-4 h-4" />}
                      {rule.type === 'COST_PLUS' && <Percent className="w-4 h-4" />}
                      {rule.type === 'FIXED' && <Layers className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">
                        {isPersian ? rule.nameFa : rule.name}
                      </h3>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase">
                        {rule.type}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    {isPersian ? 'فعال' : 'Active'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4">{rule.description}</p>

                {/* Parameters Badge Matrix */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {rule.type === 'COMPETITOR_UNDERCUT' && (
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">
                        {isPersian ? 'کسر از قیمت رقیب ترب:' : 'Undercut Amount:'}
                      </span>
                      <span className="font-bold text-slate-200">
                        {formatPrice(rule.undercutAmountToman || 20000, currencyUnit, isPersian)}
                      </span>
                    </div>
                  )}

                  {rule.type === 'FX_LINKED' && (
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">
                        {isPersian ? 'ارز مبنا:' : 'Peg Currency:'}
                      </span>
                      <span className="font-bold text-cyan-400 font-mono">
                        {rule.fxRateCode || 'USDT'}
                      </span>
                    </div>
                  )}

                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">
                      {isPersian ? 'کف حاشیه سود امن:' : 'Min Margin Safeguard:'}
                    </span>
                    <span className="font-bold text-emerald-400">
                      {rule.minMarginPercent || 5}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">
                      {isPersian ? 'گرد کردن به نزدیک‌ترین:' : 'Rounding Precision:'}
                    </span>
                    <span className="font-bold text-slate-300">
                      {formatPrice(rule.roundingNearestToman, currencyUnit, isPersian)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isPersian ? 'محافظت از ضرر و زیان' : 'Loss Prevention Guard'}</span>
                </div>
                <button
                  onClick={() => openEdit(rule)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition"
                >
                  <Edit className="w-3 h-3 text-cyan-400" />
                  <span>{isPersian ? 'ویرایش پارامترها' : 'Edit'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Rule Edit / Create */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editingRule
                ? (isPersian ? 'ویرایش قانون قیمت‌گذاری' : 'Edit Pricing Rule')
                : (isPersian ? 'تعریف قانون قیمت‌گذاری جدید' : 'New Pricing Rule')}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  {isPersian ? 'نام انگلیسی قانون' : 'Rule Name (EN)'}
                </label>
                <input
                  type="text"
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Torob Aggressive Undercut"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  {isPersian ? 'نام فارسی قانون' : 'Rule Name (FA)'}
                </label>
                <input
                  type="text"
                  value={ruleNameFa}
                  onChange={(e) => setRuleNameFa(e.target.value)}
                  placeholder="مثال: لیدر ترب تهاجمی"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  {isPersian ? 'نوع استراتژی قیمت‌گذاری' : 'Rule Strategy Type'}
                </label>
                <select
                  value={ruleType}
                  onChange={(e) => setRuleType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="COMPETITOR_UNDERCUT">
                    COMPETITOR_UNDERCUT (Undercut lowest Torob seller)
                  </option>
                  <option value="FX_LINKED">FX_LINKED (Tether / Dollar Rate Float)</option>
                  <option value="COST_PLUS">COST_PLUS (Base Cost + Fixed Margin %)</option>
                  <option value="FIXED">FIXED (Manual Fixed Price)</option>
                </select>
              </div>

              {ruleType === 'COMPETITOR_UNDERCUT' && (
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">
                    {isPersian
                      ? 'میزان کسر از کمترین قیمت ترب (تومان)'
                      : 'Undercut Amount (Tomans)'}
                  </label>
                  <input
                    type="number"
                    value={undercutAmount}
                    onChange={(e) => setUndercutAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              )}

              {ruleType === 'FX_LINKED' && (
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">
                    {isPersian ? 'ارز مبنا جهت محاسبه' : 'Currency Peg'}
                  </label>
                  <select
                    value={fxCode}
                    onChange={(e) => setFxCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="USDT">Tether (USDT)</option>
                    <option value="USD_FREE">Free Market Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="USD_NIMA">Nima Dollar (Commercial)</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">
                    {isPersian ? 'کف حاشیه سود امن (درصد)' : 'Min Margin Floor (%)'}
                  </label>
                  <input
                    type="number"
                    value={minMarginPct}
                    onChange={(e) => setMinMarginPct(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">
                    {isPersian ? 'گرد کردن قیمت (تومان)' : 'Rounding Nearest (Toman)'}
                  </label>
                  <select
                    value={roundingNearest}
                    onChange={(e) => setRoundingNearest(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="1000">1,000 Tomans</option>
                    <option value="5000">5,000 Tomans</option>
                    <option value="10000">10,000 Tomans</option>
                    <option value="50000">50,000 Tomans</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  {isPersian ? 'انصراف' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  {isPersian ? 'ذخیره قانون' : 'Save Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
