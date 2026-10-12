export type CurrencyUnit = 'TOMAN' | 'RIAL';

export interface FXRate {
  id: string;
  code: 'USD_FREE' | 'USDT' | 'EUR' | 'GOLD_EMAMI' | 'USD_NIMA';
  name: string;
  nameFa: string;
  rateToman: number; // in Tomans
  change24h: number; // percentage
  updatedAt: string;
}

export type PricingRuleType = 'COMPETITOR_UNDERCUT' | 'FX_LINKED' | 'COST_PLUS' | 'FIXED';

export interface PricingRule {
  id: string;
  name: string;
  nameFa: string;
  type: PricingRuleType;
  description: string;
  targetCompetitor?: 'TOROB' | 'DIGIKALA' | 'EMALLS';
  undercutAmountToman?: number;
  marginPercent?: number; // e.g. 12%
  minMarginPercent?: number; // safety net e.g. 5%
  fxRateCode?: string; // e.g. 'USDT'
  baseCostUsd?: number;
  roundingNearestToman: number; // e.g. 1000, 5000, 10000
  active: boolean;
}

export interface CompetitorListing {
  platform: 'Torob' | 'Digikala' | 'Emalls' | 'Technolife';
  sellerName: string;
  priceToman: number;
  inStock: boolean;
  score?: number;
  url: string;
  isLowest?: boolean;
}

export interface Product {
  id: string;
  sku: string;
  titleEn: string;
  titleFa: string;
  category: string;
  categoryFa: string;
  brand: string;
  stock: number;
  baseCostToman: number; // Purchasing cost in Tomans
  baseCostUsd?: number;  // If imported in USD/Tether
  currentPriceToman: number; // Our current active selling price
  suggestedPriceToman: number; // Calculated by active rule & market conditions
  ruleId: string;
  syncStatus: 'SYNCED' | 'OUT_OF_SYNC' | 'PRICE_DROP_ALERT' | 'MARGIN_RISK';
  lastSyncedAt: string;
  torobUrl?: string;
  digikalaUrl?: string;
  competitors: CompetitorListing[];
  autoSync: boolean;
  minPriceFloorToman: number;
}

export interface PriceAuditLog {
  id: string;
  productId: string;
  productTitle: string;
  oldPriceToman: number;
  newPriceToman: number;
  changeReason: string;
  changeReasonFa: string;
  source: 'RULE_ENGINE' | 'FX_UPDATE' | 'COMPETITOR_SYNC' | 'API_REQUEST' | 'MANUAL';
  timestamp: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  rateLimit: string;
  scopes: string[];
}
