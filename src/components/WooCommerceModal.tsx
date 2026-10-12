import React, { useState } from 'react';
import {
  Store,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  ExternalLink,
  Download,
  Key,
} from 'lucide-react';

interface WooCommerceModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPersian: boolean;
  onRefreshProducts: () => void;
}

export const WooCommerceModal: React.FC<WooCommerceModalProps> = ({
  isOpen,
  onClose,
  isPersian,
  onRefreshProducts,
}) => {
  const [storeUrl, setStoreUrl] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [connResult, setConnResult] = useState<any>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setConnResult(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v1/woocommerce/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeUrl, consumerKey, consumerSecret }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Connection failed');
      }
      setConnResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect to WooCommerce');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v1/woocommerce/import-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeUrl, consumerKey, consumerSecret }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Import failed');
      }
      setImportResult(data);
      onRefreshProducts();
    } catch (err: any) {
      setErrorMsg(err.message || 'Product import failed');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isPersian ? 'اتصال مستقیم به فروشگاه ووکامرس (WooCommerce API)' : 'Connect Real WooCommerce Store'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isPersian
                  ? 'اتصال با کلیدهای API برای خواندن محصولات واقعی و اعمال قیمت‌های جدید روی سایت'
                  : 'Connect via official REST API to import real products and sync live prices'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleTestConnection} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              {isPersian ? 'آدرس سایت فروشگاه (با https):' : 'Store Website URL:'}
            </label>
            <input
              type="url"
              required
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              placeholder="https://myshop.ir"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Consumer Key (ck_...):</label>
            <input
              type="text"
              required
              value={consumerKey}
              onChange={(e) => setConsumerKey(e.target.value)}
              placeholder="ck_9a8b7c6d5e4f3a2b1c0d..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Consumer Secret (cs_...):</label>
            <input
              type="password"
              required
              value={consumerSecret}
              onChange={(e) => setConsumerSecret(e.target.value)}
              placeholder="cs_1a2b3c4d5e6f7a8b9c0d..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {connResult && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">{connResult.message}</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {isPersian ? 'نام سایت: ' : 'Site: '} {connResult.siteTitle} (WooCommerce {connResult.wcVersion})
              </p>
              <button
                type="button"
                onClick={handleImport}
                disabled={isImporting}
                className="w-full mt-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>
                  {isImporting
                    ? (isPersian ? 'در حال دریافت کالاها...' : 'Importing SKUs...')
                    : (isPersian ? 'دریافت محصولات واقعی فروشگاه به داشبورد' : 'Import Real Products to Catalog')}
                </span>
              </button>
            </div>
          )}

          {importResult && (
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-emerald-400">
              ✓ {importResult.importedCount} {isPersian ? 'کالای واقعی با موفقیت وارد سامانه شد.' : 'real products imported.'}
            </div>
          )}

          <div className="pt-2 flex justify-between items-center">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Key className="w-3.5 h-3.5" />
              <span>{isPersian ? 'احراز هویت استاندارد ووکامرس' : 'Official WooCommerce Auth'}</span>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                {isPersian ? 'بستن' : 'Close'}
              </button>
              <button
                type="submit"
                disabled={isConnecting}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Store className="w-4 h-4" />}
                <span>{isConnecting ? (isPersian ? 'تست اتصال...' : 'Connecting...') : (isPersian ? 'تست و اتصال' : 'Connect Store')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
