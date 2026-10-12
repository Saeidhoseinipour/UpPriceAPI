import express, { Request, Response } from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import {
  initialProducts,
  initialFXRates,
  initialRules,
  initialAuditLogs,
  initialApiKeys,
} from './src/mockData';
import { Product, FXRate, PricingRule, PriceAuditLog, ApiKey } from './src/types';

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json());

// In-memory Database Store
let products: Product[] = JSON.parse(JSON.stringify(initialProducts));
let fxRates: FXRate[] = JSON.parse(JSON.stringify(initialFXRates));
let rules: PricingRule[] = JSON.parse(JSON.stringify(initialRules));
let auditLogs: PriceAuditLog[] = JSON.parse(JSON.stringify(initialAuditLogs));
let apiKeys: ApiKey[] = JSON.parse(JSON.stringify(initialApiKeys));

// Helper: Calculate suggested price according to rules
function calculateSuggestedPrice(product: Product): { suggestedPrice: number; status: Product['syncStatus'] } {
  const rule = rules.find((r) => r.id === product.ruleId) || rules[0];
  let calculated = product.currentPriceToman;

  if (rule.type === 'COMPETITOR_UNDERCUT') {
    const lowestCompetitor = product.competitors?.find((c) => c.isLowest && c.inStock);
    if (lowestCompetitor) {
      const undercut = rule.undercutAmountToman || 20000;
      calculated = lowestCompetitor.priceToman - undercut;
    }
  } else if (rule.type === 'FX_LINKED') {
    const rateObj = fxRates.find((r) => r.code === (rule.fxRateCode || 'USDT'));
    const rate = rateObj ? rateObj.rateToman : 93000;
    const baseCostUsd = product.baseCostUsd || Math.round(product.baseCostToman / rate);
    const margin = (rule.marginPercent || 10) / 100;
    calculated = Math.round(baseCostUsd * rate * (1 + margin));
  } else if (rule.type === 'COST_PLUS') {
    const margin = (rule.marginPercent || 12) / 100;
    calculated = Math.round(product.baseCostToman * (1 + margin));
  }

  // Apply rounding
  const roundTo = rule.roundingNearestToman || 1000;
  calculated = Math.round(calculated / roundTo) * roundTo;

  // Margin Risk check
  let status: Product['syncStatus'] = 'SYNCED';
  const minFloor = product.minPriceFloorToman || product.baseCostToman * 1.05;

  if (calculated < minFloor) {
    status = 'MARGIN_RISK';
    calculated = minFloor; // Safeguard
  } else if (Math.abs(calculated - product.currentPriceToman) > 50000) {
    if (calculated < product.currentPriceToman) {
      status = 'PRICE_DROP_ALERT';
    } else {
      status = 'OUT_OF_SYNC';
    }
  } else {
    status = 'SYNCED';
  }

  return { suggestedPrice: calculated, status };
}

// Recalculate all products
function refreshAllSuggestedPrices() {
  products = products.map((prod) => {
    const { suggestedPrice, status } = calculateSuggestedPrice(prod);
    return {
      ...prod,
      suggestedPriceToman: suggestedPrice,
      syncStatus: status,
    };
  });
}

// Initialize prices on start
refreshAllSuggestedPrices();

// ================= API ROUTES ================= //

// Health Check
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'UpPriceAPI',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
  });
});

// Overview Metrics / Stats
app.get('/api/v1/stats', (req: Request, res: Response) => {
  const totalProducts = products.length;
  const outOfSync = products.filter((p) => p.syncStatus !== 'SYNCED').length;
  const marginRisks = products.filter((p) => p.syncStatus === 'MARGIN_RISK').length;
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);

  // Buy Box estimation (products where our price <= lowest competitor price)
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

  res.json({
    totalProducts,
    outOfSync,
    marginRisks,
    totalStock,
    buyBoxRate,
    avgMargin,
    activeRules: rules.filter((r) => r.active).length,
    updatesTodayCount: auditLogs.length,
    lastFxUpdate: fxRates[0].updatedAt,
  });
});

// Products: List with filters
app.get('/api/v1/products', (req: Request, res: Response) => {
  const { q, category, status } = req.query;
  let filtered = [...products];

  if (q && typeof q === 'string') {
    const query = q.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.titleEn.toLowerCase().includes(query) ||
        p.titleFa.includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query)
    );
  }

  if (category && typeof category === 'string' && category !== 'ALL') {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (status && typeof status === 'string' && status !== 'ALL') {
    filtered = filtered.filter((p) => p.syncStatus === status);
  }

  res.json(filtered);
});

// Product by ID
app.get('/api/v1/products/:id', (req: Request, res: Response) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Add new product
app.post('/api/v1/products', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.sku || !body.titleEn) {
    return res.status(400).json({ error: 'SKU and English Title are required' });
  }

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    sku: body.sku,
    titleEn: body.titleEn,
    titleFa: body.titleFa || body.titleEn,
    category: body.category || 'General',
    categoryFa: body.categoryFa || 'عمومی',
    brand: body.brand || 'Generic',
    stock: Number(body.stock) || 1,
    baseCostToman: Number(body.baseCostToman) || 1000000,
    baseCostUsd: Number(body.baseCostUsd) || 10,
    currentPriceToman: Number(body.currentPriceToman) || Number(body.baseCostToman) * 1.15,
    suggestedPriceToman: Number(body.currentPriceToman) || Number(body.baseCostToman) * 1.15,
    ruleId: body.ruleId || rules[0].id,
    syncStatus: 'SYNCED',
    lastSyncedAt: new Date().toISOString(),
    torobUrl: body.torobUrl || '',
    digikalaUrl: body.digikalaUrl || '',
    autoSync: body.autoSync ?? true,
    minPriceFloorToman: Number(body.minPriceFloorToman) || Number(body.baseCostToman) * 1.05,
    competitors: body.competitors || [
      {
        platform: 'Torob',
        sellerName: 'فروشگاه رقیب نمونه',
        priceToman: Number(body.currentPriceToman) * 1.02,
        inStock: true,
        score: 4.5,
        url: 'https://torob.com',
        isLowest: true,
      },
    ],
  };

  const { suggestedPrice, status } = calculateSuggestedPrice(newProduct);
  newProduct.suggestedPriceToman = suggestedPrice;
  newProduct.syncStatus = status;

  products.unshift(newProduct);
  res.status(201).json(newProduct);
});

// Update product
app.put('/api/v1/products/:id', (req: Request, res: Response) => {
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const old = products[index];
  const updated: Product = {
    ...old,
    ...req.body,
    id: old.id, // cannot change id
  };

  // If price manually changed, log audit
  if (req.body.currentPriceToman && req.body.currentPriceToman !== old.currentPriceToman) {
    auditLogs.unshift({
      id: `log-${Date.now()}`,
      productId: old.id,
      productTitle: old.titleEn,
      oldPriceToman: old.currentPriceToman,
      newPriceToman: req.body.currentPriceToman,
      changeReason: 'Manual price update by merchant',
      changeReasonFa: 'ویرایش دستی قیمت توسط فروشنده',
      source: 'MANUAL',
      timestamp: new Date().toISOString(),
    });
  }

  const { suggestedPrice, status } = calculateSuggestedPrice(updated);
  updated.suggestedPriceToman = suggestedPrice;
  updated.syncStatus = status;

  products[index] = updated;
  res.json(updated);
});

// Delete product
app.delete('/api/v1/products/:id', (req: Request, res: Response) => {
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const deleted = products.splice(index, 1)[0];
  res.json({ message: 'Product removed', deleted });
});

// Single Product Sync: Accept suggested price
app.post('/api/v1/products/:id/sync', (req: Request, res: Response) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const oldPrice = product.currentPriceToman;
  const newPrice = product.suggestedPriceToman;

  product.currentPriceToman = newPrice;
  product.syncStatus = 'SYNCED';
  product.lastSyncedAt = new Date().toISOString();

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    productId: product.id,
    productTitle: product.titleEn,
    oldPriceToman: oldPrice,
    newPriceToman: newPrice,
    changeReason: `Applied rule sync (${product.ruleId})`,
    changeReasonFa: `اعمال همگام‌سازی قانون قیمت‌گذاری (${product.ruleId})`,
    source: 'RULE_ENGINE',
    timestamp: new Date().toISOString(),
  });

  res.json({ message: 'Product synced successfully', product });
});

// Batch Sync: Sync all out-of-sync or all products
app.post('/api/v1/sync/batch', (req: Request, res: Response) => {
  const { mode = 'OUT_OF_SYNC' } = req.body;
  let count = 0;

  products = products.map((p) => {
    if (mode === 'ALL' || p.syncStatus !== 'SYNCED') {
      if (p.currentPriceToman !== p.suggestedPriceToman) {
        auditLogs.unshift({
          id: `log-${Date.now()}-${p.id}`,
          productId: p.id,
          productTitle: p.titleEn,
          oldPriceToman: p.currentPriceToman,
          newPriceToman: p.suggestedPriceToman,
          changeReason: 'Automated batch sync via UpPriceAPI',
          changeReasonFa: 'همگام‌سازی دسته‌ای خودکار از طریق UpPriceAPI',
          source: 'API_REQUEST',
          timestamp: new Date().toISOString(),
        });
        count++;
      }
      return {
        ...p,
        currentPriceToman: p.suggestedPriceToman,
        syncStatus: 'SYNCED',
        lastSyncedAt: new Date().toISOString(),
      };
    }
    return p;
  });

  res.json({
    message: `Batch sync complete. Updated ${count} products.`,
    updatedCount: count,
  });
});

// Exchange Rates List
app.get('/api/v1/rates', (req: Request, res: Response) => {
  res.json(fxRates);
});

// Update Exchange Rate (e.g. Tether or Free USD changes)
app.put('/api/v1/rates/:code', (req: Request, res: Response) => {
  const { code } = req.params;
  const { rateToman } = req.body;

  const rateItem = fxRates.find((r) => r.code === code);
  if (!rateItem) {
    return res.status(404).json({ error: 'Currency code not found' });
  }

  const oldRate = rateItem.rateToman;
  const newRate = Number(rateToman);
  if (!newRate || newRate <= 0) {
    return res.status(400).json({ error: 'Invalid rate' });
  }

  const pct = Number((((newRate - oldRate) / oldRate) * 100).toFixed(2));
  rateItem.rateToman = newRate;
  rateItem.change24h = pct;
  rateItem.updatedAt = new Date().toISOString();

  // Re-calculate suggested prices for all products
  refreshAllSuggestedPrices();

  // Audit log for FX shift
  auditLogs.unshift({
    id: `log-fx-${Date.now()}`,
    productId: 'SYSTEM_FX',
    productTitle: `${rateItem.name} Rate Adjustment`,
    oldPriceToman: oldRate,
    newPriceToman: newRate,
    changeReason: `Currency shifted by ${pct}% (${oldRate.toLocaleString()} -> ${newRate.toLocaleString()} Toman)`,
    changeReasonFa: `تغییر نرخ ارز به میزان ${pct}٪ (${oldRate.toLocaleString('fa-IR')} به ${newRate.toLocaleString('fa-IR')} تومان)`,
    source: 'FX_UPDATE',
    timestamp: new Date().toISOString(),
  });

  res.json({ message: 'Rate updated and products re-evaluated', rate: rateItem });
});

// Pricing Rules List
app.get('/api/v1/rules', (req: Request, res: Response) => {
  res.json(rules);
});

// Add / Update Rule
app.post('/api/v1/rules', (req: Request, res: Response) => {
  const body = req.body;
  const existingIndex = rules.findIndex((r) => r.id === body.id);

  if (existingIndex >= 0) {
    rules[existingIndex] = { ...rules[existingIndex], ...body };
  } else {
    const newRule: PricingRule = {
      id: body.id || `rule-${Date.now()}`,
      name: body.name || 'Custom Rule',
      nameFa: body.nameFa || 'قانون سفارشی',
      type: body.type || 'COST_PLUS',
      description: body.description || '',
      targetCompetitor: body.targetCompetitor || 'TOROB',
      undercutAmountToman: Number(body.undercutAmountToman) || 20000,
      marginPercent: Number(body.marginPercent) || 10,
      minMarginPercent: Number(body.minMarginPercent) || 5,
      fxRateCode: body.fxRateCode || 'USDT',
      roundingNearestToman: Number(body.roundingNearestToman) || 5000,
      active: body.active ?? true,
    };
    rules.push(newRule);
  }

  refreshAllSuggestedPrices();
  res.json(rules);
});

// Audit Logs
app.get('/api/v1/history', (req: Request, res: Response) => {
  res.json(auditLogs);
});

// Price Rollback
app.post('/api/v1/history/:id/rollback', (req: Request, res: Response) => {
  const log = auditLogs.find((l) => l.id === req.params.id);
  if (!log) {
    return res.status(404).json({ error: 'Audit log entry not found' });
  }

  const product = products.find((p) => p.id === log.productId);
  if (!product) {
    return res.status(404).json({ error: 'Associated product not found' });
  }

  const rolledBackPrice = log.oldPriceToman;
  const currentBefore = product.currentPriceToman;
  product.currentPriceToman = rolledBackPrice;
  product.lastSyncedAt = new Date().toISOString();

  auditLogs.unshift({
    id: `log-rollback-${Date.now()}`,
    productId: product.id,
    productTitle: product.titleEn,
    oldPriceToman: currentBefore,
    newPriceToman: rolledBackPrice,
    changeReason: `Rollback price from log #${log.id.slice(-6)}`,
    changeReasonFa: `بازگردانی قیمت از سابقه شماره ${log.id.slice(-6)}`,
    source: 'MANUAL',
    timestamp: new Date().toISOString(),
  });

  const { suggestedPrice, status } = calculateSuggestedPrice(product);
  product.suggestedPriceToman = suggestedPrice;
  product.syncStatus = status;

  res.json({ message: 'Price rolled back successfully', product });
});

// Torob Product Feed (Standard Torob Integration API format used by Iranian merchants)
app.get('/api/v1/torob-feed', (req: Request, res: Response) => {
  const format = req.query.format || 'json';

  const feedItems = products.map((p) => ({
    page_unique_code: p.sku,
    title: p.titleFa,
    price: p.currentPriceToman * 10, // Torob feed standard is RIALS (1 Toman = 10 Rials)
    price_toman: p.currentPriceToman,
    current_stock: p.stock > 0 ? p.stock : 0,
    availability: p.stock > 0 ? 'instock' : 'outofstock',
    page_url: `https://myshop.ir/products/${p.sku.toLowerCase()}`,
    guarantee: 'گارانتی ۱۸ ماهه معتبر شرکتی',
    category: p.categoryFa,
    last_update: p.lastSyncedAt,
  }));

  if (format === 'xml') {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<products>\n';
    feedItems.forEach((item) => {
      xml += `  <product>
    <page_unique_code>${item.page_unique_code}</page_unique_code>
    <title><![CDATA[${item.title}]]></title>
    <price>${item.price}</price>
    <availability>${item.availability}</availability>
    <page_url>${item.page_url}</page_url>
    <last_update>${item.last_update}</last_update>
  </product>\n`;
    });
    xml += '</products>';
    res.setHeader('Content-Type', 'application/xml');
    return res.send(xml);
  }

  res.json({
    shop_title: 'فروشگاه آنلاین برتر',
    currency: 'IRR (Rials)',
    count: feedItems.length,
    generated_at: new Date().toISOString(),
    products: feedItems,
  });
});

// API Keys Management
app.get('/api/v1/api-keys', (req: Request, res: Response) => {
  res.json(apiKeys);
});

app.post('/api/v1/api-keys', (req: Request, res: Response) => {
  const { name = 'New Merchant API Key' } = req.body;
  const randomSuffix = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
  const newKey: ApiKey = {
    id: `key-live-${Date.now()}`,
    name,
    key: `upprice_live_${randomSuffix}`,
    created: new Date().toISOString().split('T')[0],
    lastUsed: 'Never',
    rateLimit: '120 req / min',
    scopes: ['read:products', 'write:prices', 'sync:torob'],
  };
  apiKeys.push(newKey);
  res.status(201).json(newKey);
});

// Simulator: Competitor Moves (Drop Torob price to test automation)
app.post('/api/v1/simulate/competitor-move', (req: Request, res: Response) => {
  const { productId, priceDropToman = 300000 } = req.body;
  const product = products.find((p) => p.id === (productId || products[0].id));

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const torobComp = product.competitors.find((c) => c.platform === 'Torob');
  if (torobComp) {
    torobComp.priceToman = Math.max(product.baseCostToman, torobComp.priceToman - priceDropToman);
    torobComp.isLowest = true;
  }

  refreshAllSuggestedPrices();
  res.json({
    message: `Simulated competitor price drop on ${product.titleEn}. Check dashboard for alert!`,
    product,
  });
});

// Mount Vite in development or serve static in production
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      allowedHosts: true,
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static('dist'));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile('dist/index.html', { root: '.' });
  });
}

app.listen(PORT, HOST, () => {
  console.log(`UpPriceAPI running on http://${HOST}:${PORT}`);
});
