import React, { useState, useEffect } from 'react';
import { Product, FXRate, PricingRule, PriceAuditLog, ApiKey, CurrencyUnit } from './types';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { ProductsCatalog } from './components/ProductsCatalog';
import { TorobIntelligence } from './components/TorobIntelligence';
import { RulesEngine } from './components/RulesEngine';
import { FxRatesManager } from './components/FxRatesManager';
import { ApiExplorer } from './components/ApiExplorer';
import { HistoryAudit } from './components/HistoryAudit';
import { TorobFeedModal } from './components/TorobFeedModal';
import { ProductEditModal } from './components/ProductEditModal';
import { AiPriceSearchModal } from './components/AiPriceSearchModal';
import { WooCommerceModal } from './components/WooCommerceModal';
import {
  initialProducts,
  initialFXRates,
  initialRules,
  initialAuditLogs,
  initialApiKeys,
} from './mockData';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info';
  text: string;
}

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isPersian, setIsPersian] = useState<boolean>(true);
  const [currencyUnit, setCurrencyUnit] = useState<CurrencyUnit>('TOMAN');

  // Application Data States (initialized immediately to avoid any blank flash)
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [fxRates, setFxRates] = useState<FXRate[]>(initialFXRates);
  const [rules, setRules] = useState<PricingRule[]>(initialRules);
  const [auditLogs, setAuditLogs] = useState<PriceAuditLog[]>(initialAuditLogs);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);

  // Modals & Loaders
  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAiSearchOpen, setIsAiSearchOpen] = useState(false);
  const [isWooCommerceOpen, setIsWooCommerceOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [aiSearchTargetProduct, setAiSearchTargetProduct] = useState<Product | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Show Toast Helper
  const addToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch all data from backend
  const fetchData = async () => {
    try {
      const [prodRes, ratesRes, rulesRes, logsRes, keysRes] = await Promise.all([
        fetch('/api/v1/products'),
        fetch('/api/v1/rates'),
        fetch('/api/v1/rules'),
        fetch('/api/v1/history'),
        fetch('/api/v1/api-keys'),
      ]);

      if (prodRes.ok) setProducts(await prodRes.json());
      if (ratesRes.ok) setFxRates(await ratesRes.json());
      if (rulesRes.ok) setRules(await rulesRes.json());
      if (logsRes.ok) setAuditLogs(await logsRes.json());
      if (keysRes.ok) setApiKeys(await keysRes.json());
    } catch (err) {
      console.error('Failed to load API data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update document direction based on language
  useEffect(() => {
    document.documentElement.dir = isPersian ? 'rtl' : 'ltr';
    document.documentElement.lang = isPersian ? 'fa' : 'en';
  }, [isPersian]);

  // Sync single product
  const handleSyncProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/products/${id}/sync`, { method: 'POST' });
      if (res.ok) {
        addToast(
          isPersian ? 'قیمت کالا با موفقیت همگام شد' : 'Product price synchronized successfully'
        );
        fetchData();
      }
    } catch (err) {
      addToast(isPersian ? 'خطا در همگام‌سازی قیمت' : 'Failed to sync product', 'warning');
    }
  };

  // Batch sync
  const handleBatchSync = async (mode: 'OUT_OF_SYNC' | 'ALL') => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/v1/sync/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(
          isPersian
            ? `همگام‌سازی دسته‌ای انجام شد (${data.updatedCount} کالا به‌روز شدند)`
            : `Batch sync complete (${data.updatedCount} products updated)`
        );
        fetchData();
      }
    } catch (err) {
      addToast('Sync error', 'warning');
    } finally {
      setIsSyncing(false);
    }
  };

  // Update product price directly
  const handleUpdateProductPrice = async (id: string, newPriceToman: number) => {
    try {
      const res = await fetch(`/api/v1/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPriceToman: newPriceToman }),
      });
      if (res.ok) {
        addToast(isPersian ? 'قیمت کالا به‌روزرسانی شد' : 'Price updated directly');
        fetchData();
      }
    } catch (err) {
      addToast('Failed to update price', 'warning');
    }
  };

  // Update Exchange Rate
  const handleUpdateRate = async (code: string, newRateToman: number) => {
    try {
      const res = await fetch(`/api/v1/rates/${code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rateToman: newRateToman }),
      });
      if (res.ok) {
        addToast(
          isPersian
            ? 'نرخ ارز به‌روز شد و قیمت کالاهای مرتبط بازتولید گردید'
            : 'FX Rate updated & pegged items recalculated'
        );
        fetchData();
      }
    } catch (err) {
      addToast('Failed to update exchange rate', 'warning');
    }
  };

  // Save rule
  const handleSaveRule = async (ruleData: Partial<PricingRule>) => {
    try {
      const res = await fetch('/api/v1/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleData),
      });
      if (res.ok) {
        addToast(isPersian ? 'قانون قیمت‌گذاری ذخیره شد' : 'Pricing rule saved');
        fetchData();
      }
    } catch (err) {
      addToast('Failed to save rule', 'warning');
    }
  };

  // Rollback price
  const handleRollback = async (logId: string) => {
    try {
      const res = await fetch(`/api/v1/history/${logId}/rollback`, { method: 'POST' });
      if (res.ok) {
        addToast(
          isPersian ? 'قیمت قبلی با موفقیت بازگردانده شد' : 'Price rolled back successfully'
        );
        fetchData();
      }
    } catch (err) {
      addToast('Failed to rollback price', 'warning');
    }
  };

  // Generate API key
  const handleGenerateKey = async (name: string) => {
    try {
      const res = await fetch('/api/v1/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        addToast(isPersian ? 'کلید API جدید تولید شد' : 'New API key created');
        fetchData();
      }
    } catch (err) {
      addToast('Failed to generate key', 'warning');
    }
  };

  // Simulate competitor move
  const handleSimulateCompetitorMove = async (productId?: string, dropAmount = 350000) => {
    try {
      const targetId = productId || products[0]?.id;
      const res = await fetch('/api/v1/simulate/competitor-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: targetId, priceDropToman: dropAmount }),
      });
      if (res.ok) {
        addToast(
          isPersian
            ? 'افت قیمت رقیب در ترب شبیه‌سازی شد! کالا به صف نیازمند بررسی اضافه شد.'
            : 'Simulated competitor drop in Torob! Discrepancy queued for review.',
          'warning'
        );
        fetchData();
      }
    } catch (err) {
      addToast('Simulation failed', 'warning');
    }
  };

  // Add / Edit Product
  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      const url = productData.id ? `/api/v1/products/${productData.id}` : '/api/v1/products';
      const method = productData.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (res.ok) {
        addToast(isPersian ? 'اطلاعات کالا با موفقیت ذخیره شد' : 'Product saved successfully');
        fetchData();
      }
    } catch (err) {
      addToast('Failed to save product', 'warning');
    }
  };

  // Apply Discovered Price from Gemini AI
  const handleApplyDiscoveredPrice = (
    productId: string,
    priceToman: number,
    sellerName: string,
    sourceUrl: string
  ) => {
    addToast(
      isPersian
        ? `قیمت زنده ${priceToman.toLocaleString('fa-IR')} تومان از وب اعمال شد`
        : `Discovered price ${priceToman.toLocaleString()} Tomans applied to SKU`,
      'success'
    );
    fetchData();
  };

  const outOfSyncCount = products.filter((p) => p.syncStatus !== 'SYNCED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Header */}
      <Header
        isPersian={isPersian}
        setIsPersian={setIsPersian}
        currencyUnit={currencyUnit}
        setCurrencyUnit={setCurrencyUnit}
        onSyncAll={() => handleBatchSync('OUT_OF_SYNC')}
        isSyncing={isSyncing}
        onOpenFeedModal={() => setIsFeedModalOpen(true)}
        onOpenAiSearch={() => {
          setAiSearchTargetProduct(products[0] || null);
          setIsAiSearchOpen(true);
        }}
        onOpenWooCommerce={() => setIsWooCommerceOpen(true)}
        onSimulateCompetitorMove={() => handleSimulateCompetitorMove()}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        outOfSyncCount={outOfSyncCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            products={products}
            fxRates={fxRates}
            isPersian={isPersian}
            currencyUnit={currencyUnit}
            onNavigateTab={setActiveTab}
            onSyncProduct={handleSyncProduct}
          />
        )}

        {activeTab === 'products' && (
          <ProductsCatalog
            products={products}
            rules={rules}
            isPersian={isPersian}
            currencyUnit={currencyUnit}
            onSyncProduct={handleSyncProduct}
            onUpdateProductPrice={handleUpdateProductPrice}
            onOpenAddModal={() => {
              setEditingProduct(null);
              setIsEditModalOpen(true);
            }}
            onOpenEditModal={(prod) => {
              setEditingProduct(prod);
              setIsEditModalOpen(true);
            }}
            onOpenAiSearchProduct={(prod) => {
              setAiSearchTargetProduct(prod);
              setIsAiSearchOpen(true);
            }}
            onBatchSync={handleBatchSync}
            isSyncing={isSyncing}
          />
        )}

        {activeTab === 'torob' && (
          <TorobIntelligence
            products={products}
            isPersian={isPersian}
            currencyUnit={currencyUnit}
            onSyncProduct={handleSyncProduct}
            onSimulateCompetitorMove={handleSimulateCompetitorMove}
          />
        )}

        {activeTab === 'rules' && (
          <RulesEngine
            rules={rules}
            isPersian={isPersian}
            currencyUnit={currencyUnit}
            onSaveRule={handleSaveRule}
          />
        )}

        {activeTab === 'rates' && (
          <FxRatesManager
            fxRates={fxRates}
            products={products}
            isPersian={isPersian}
            currencyUnit={currencyUnit}
            onUpdateRate={handleUpdateRate}
          />
        )}

        {activeTab === 'api' && (
          <ApiExplorer
            apiKeys={apiKeys}
            isPersian={isPersian}
            onGenerateKey={handleGenerateKey}
          />
        )}

        {activeTab === 'history' && (
          <HistoryAudit
            logs={auditLogs}
            isPersian={isPersian}
            currencyUnit={currencyUnit}
            onRollback={handleRollback}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-400">UpPriceAPI</span> —{' '}
            {isPersian
              ? 'موتور هوشمند همگام‌سازی قیمت برای فروشگاه‌های اینترنتی ایران'
              : 'E-commerce Price Synchronization Engine for Iranian Marketplaces'}
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Vite + React + Express</span>
            <span>•</span>
            <span>Torob & Digikala Feed v1.0</span>
          </div>
        </div>
      </footer>

      {/* Torob Feed Modal */}
      <TorobFeedModal
        isOpen={isFeedModalOpen}
        onClose={() => setIsFeedModalOpen(false)}
        isPersian={isPersian}
      />

      {/* Product Edit / Add Modal */}
      <ProductEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={editingProduct}
        rules={rules}
        isPersian={isPersian}
        onSave={handleSaveProduct}
      />

      {/* AI Live Price Discovery Modal (Gemini Search Grounding) */}
      <AiPriceSearchModal
        isOpen={isAiSearchOpen}
        onClose={() => setIsAiSearchOpen(false)}
        products={products}
        selectedProduct={aiSearchTargetProduct}
        isPersian={isPersian}
        currencyUnit={currencyUnit}
        onApplyDiscoveredPrice={handleApplyDiscoveredPrice}
      />

      {/* Real WooCommerce Store Connector Modal */}
      <WooCommerceModal
        isOpen={isWooCommerceOpen}
        onClose={() => setIsWooCommerceOpen(false)}
        isPersian={isPersian}
        onRefreshProducts={fetchData}
      />

      {/* Floating Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3 rounded-lg shadow-xl text-xs flex items-center justify-between gap-3 border transition-all animate-fade-in ${
              toast.type === 'success'
                ? 'bg-emerald-950 border-emerald-700/80 text-emerald-200'
                : toast.type === 'warning'
                ? 'bg-amber-950 border-amber-700/80 text-amber-200'
                : 'bg-cyan-950 border-cyan-700/80 text-cyan-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : toast.type === 'warning' ? (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              )}
              <span>{toast.text}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
export default App;
