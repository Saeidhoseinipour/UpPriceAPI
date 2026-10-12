import React, { useState } from 'react';
import { ApiKey } from '../types';
import {
  Code2,
  Play,
  Copy,
  Check,
  Key,
  Globe,
  Terminal,
  Layers,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ApiExplorerProps {
  apiKeys: ApiKey[];
  isPersian: boolean;
  onGenerateKey: (name: string) => void;
}

interface EndpointDef {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  descriptionEn: string;
  descriptionFa: string;
  defaultBody?: string;
}

const endpoints: EndpointDef[] = [
  {
    method: 'GET',
    path: '/api/v1/products',
    descriptionEn: 'Fetch catalog with competitor prices, suggested prices and sync statuses',
    descriptionFa: 'دریافت لیست کالاها به همراه قیمت رقبا، قیمت پیشنهادی و وضعیت همگام‌سازی',
  },
  {
    method: 'POST',
    path: '/api/v1/sync/batch',
    descriptionEn: 'Batch synchronize all out-of-sync products with calculated optimal prices',
    descriptionFa: 'همگام‌سازی دسته‌ای تمام کالاهای نیازمند به‌روزرسانی با قیمت بهینه',
    defaultBody: JSON.stringify({ mode: 'OUT_OF_SYNC' }, null, 2),
  },
  {
    method: 'GET',
    path: '/api/v1/rates',
    descriptionEn: 'Get real-time exchange rates (USDT, USD Free Market, Nima, Gold Coin)',
    descriptionFa: 'دریافت نرخ‌های زنده ارز و طلا (تتر، دلار آزاد، نیمایی، سکه امامی)',
  },
  {
    method: 'GET',
    path: '/api/v1/torob-feed',
    descriptionEn: 'Generate standard Torob product feed in JSON or XML format for crawler',
    descriptionFa: 'تولید فید استاندارد محصولات برای ربات خزش ترب (JSON / XML)',
  },
  {
    method: 'GET',
    path: '/api/v1/stats',
    descriptionEn: 'Retrieve shop pricing health metrics, Torob Buy-Box win rate and margins',
    descriptionFa: 'دریافت آمار سلامت قیمت‌ها، نرخ لیدری در ترب و میانگین سود فروشگاه',
  },
  {
    method: 'GET',
    path: '/api/v1/rules',
    descriptionEn: 'List dynamic pricing algorithms and safety margin thresholds',
    descriptionFa: 'مشاهده لیست الگوریتم‌های قیمت‌گذاری و کف سود ایمن',
  },
];

export const ApiExplorer: React.FC<ApiExplorerProps> = ({
  apiKeys,
  isPersian,
  onGenerateKey,
}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDef>(endpoints[0]);
  const [requestBody, setRequestBody] = useState<string>(endpoints[0].defaultBody || '');
  const [responseOutput, setResponseOutput] = useState<string>('// Click "Send Request" to test endpoint');
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseDuration, setResponseDuration] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [codeLanguage, setCodeLanguage] = useState<'curl' | 'node' | 'python' | 'php'>('curl');
  const [newKeyName, setNewKeyName] = useState('');

  const handleSelectEndpoint = (ep: EndpointDef) => {
    setSelectedEndpoint(ep);
    setRequestBody(ep.defaultBody || '');
    setResponseOutput('// Click "Send Request" to test endpoint');
    setResponseStatus(null);
  };

  const handleSendRequest = async () => {
    setIsLoading(true);
    const start = performance.now();
    try {
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKeys[0]?.key || 'upprice_live_demo'}`,
        },
      };

      if (selectedEndpoint.method !== 'GET' && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(selectedEndpoint.path, options);
      const data = await res.json();
      const end = performance.now();

      setResponseStatus(res.status);
      setResponseDuration(Math.round(end - start));
      setResponseOutput(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResponseStatus(500);
      setResponseOutput(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Generate code snippet
  const activeKeyStr = apiKeys[0]?.key || 'upprice_live_7x9qA3b8Klm209847120bc98';
  const getSnippet = () => {
    const url = `https://your-shop-api.com${selectedEndpoint.path}`;
    if (codeLanguage === 'curl') {
      if (selectedEndpoint.method === 'GET') {
        return `curl -X GET "${url}" \\\n  -H "Authorization: Bearer ${activeKeyStr}"`;
      }
      return `curl -X ${selectedEndpoint.method} "${url}" \\\n  -H "Authorization: Bearer ${activeKeyStr}" \\\n  -H "Content-Type: application/json" \\\n  -d '${requestBody.replace(/\n/g, '')}'`;
    }
    if (codeLanguage === 'node') {
      return `import axios from 'axios';

const response = await axios.${selectedEndpoint.method.toLowerCase()}('${url}', ${
        selectedEndpoint.method !== 'GET' ? `${requestBody}, ` : ''
      }{
  headers: {
    'Authorization': 'Bearer ${activeKeyStr}',
    'Content-Type': 'application/json'
  }
});
console.log(response.data);`;
    }
    if (codeLanguage === 'python') {
      return `import requests

url = "${url}"
headers = {
    "Authorization": "Bearer ${activeKeyStr}",
    "Content-Type": "application/json"
}
${
  selectedEndpoint.method === 'GET'
    ? 'response = requests.get(url, headers=headers)'
    : `response = requests.${selectedEndpoint.method.toLowerCase()}(url, headers=headers, json=${requestBody || '{}'})`
}
print(response.json())`;
    }
    if (codeLanguage === 'php') {
      return `<?php
// WooCommerce Price Auto-Sync Hook
$url = '${url}';
$args = [
    'headers' => [
        'Authorization' => 'Bearer ${activeKeyStr}',
        'Content-Type'  => 'application/json'
    ],
    'method'  => '${selectedEndpoint.method}',
    ${selectedEndpoint.method !== 'GET' ? `'body'    => '${requestBody.replace(/\n/g, '')}',` : ''}
];

$response = wp_remote_request($url, $args);
$data = json_decode(wp_remote_retrieve_body($response), true);
// Update WooCommerce product price
`;
    }
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-semibold mb-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>{isPersian ? 'مستندات و سندباکس تعاملی API' : 'Interactive API Console & Docs'}</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {isPersian
              ? 'اتصال فروشگاه اینترنتی، ووکامرس یا ربات شخصی به UpPriceAPI'
              : 'Integrate WooCommerce, Prestashop, or Custom Shop with UpPriceAPI'}
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            {isPersian
              ? 'تمام درخواست‌های زیر به صورت زنده به بک‌اند اکسپرس ارسال شده و خروجی واقعی تولید می‌کنند.'
              : 'Test REST API endpoints directly in your browser with real server-side execution.'}
          </p>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoints Sidebar */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 space-y-2">
          <span className="text-xs font-bold text-slate-300 block mb-2 px-1">
            {isPersian ? 'فهرست اندپوینت‌های REST' : 'Available REST Endpoints'}
          </span>
          {endpoints.map((ep) => {
            const isSelected =
              selectedEndpoint.method === ep.method && selectedEndpoint.path === ep.path;
            return (
              <button
                key={`${ep.method}-${ep.path}`}
                onClick={() => handleSelectEndpoint(ep)}
                className={`w-full text-left p-2.5 rounded-lg border transition text-xs flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500/60 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 text-slate-400'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        ep.method === 'GET'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-cyan-500/10 text-cyan-400'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-slate-200 font-semibold">{ep.path}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                    {isPersian ? ep.descriptionFa : ep.descriptionEn}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Test Bench & Response */}
        <div className="lg:col-span-2 space-y-4">
          {/* Request Header Bar */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                  selectedEndpoint.method === 'GET'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-cyan-500/20 text-cyan-400'
                }`}
              >
                {selectedEndpoint.method}
              </span>
              <span className="font-mono text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex-1 text-slate-200">
                {selectedEndpoint.path}
              </span>
              <button
                onClick={handleSendRequest}
                disabled={isLoading}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 fill-current ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? (isPersian ? 'ارسال...' : 'Sending...') : (isPersian ? 'اجرای تست' : 'Send Request')}</span>
              </button>
            </div>

            {selectedEndpoint.method !== 'GET' && (
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  {isPersian ? 'بدنه درخواست (JSON):' : 'Request Body (JSON):'}
                </label>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-lg bg-slate-950 font-mono text-xs text-cyan-300 border border-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}
          </div>

          {/* Response Output Box */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-300">
                  {isPersian ? 'پاسخ سرور' : 'Response'}
                </span>
                {responseStatus && (
                  <span
                    className={`font-mono px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      responseStatus >= 200 && responseStatus < 300
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {responseStatus} OK
                  </span>
                )}
                {responseDuration !== null && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    {responseDuration}ms
                  </span>
                )}
              </div>

              <button
                onClick={() => copyToClipboard(responseOutput, 'resp')}
                className="text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1"
              >
                {copiedKey === 'resp' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedKey === 'resp' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="p-3 rounded-lg bg-slate-950 text-cyan-300 font-mono text-[11px] overflow-x-auto max-h-72 border border-slate-800/80 leading-relaxed">
              {responseOutput}
            </pre>
          </div>

          {/* Ready-to-use Code Snippets */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">
                  {isPersian ? 'نمونه کد آماده اتصال' : 'Integration Code Snippet'}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs">
                {(['curl', 'node', 'python', 'php'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setCodeLanguage(lang)}
                    className={`px-2.5 py-1 rounded font-mono text-[11px] font-semibold transition ${
                      codeLanguage === lang
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <pre className="p-3 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto border border-slate-800/80">
              {getSnippet()}
            </pre>
          </div>
        </div>
      </div>

      {/* API Keys Management */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>{isPersian ? 'کلیدهای دسترسی API (API Keys)' : 'Merchant API Keys'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isPersian
                ? 'از این کلیدها برای احراز هویت در افزونه ووکامرس، کران‌جاب‌ها یا اسکریپت‌های پایتون استفاده کنید.'
                : 'Bearer tokens for WooCommerce plugin integration and automated price update workers.'}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder={isPersian ? 'نام کلید جدید...' : 'Key label (e.g. Basalam Bot)...'}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 w-full sm:w-48"
            />
            <button
              onClick={() => {
                onGenerateKey(newKeyName || 'Merchant Production Key');
                setNewKeyName('');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-xs border border-slate-700 whitespace-nowrap transition"
            >
              {isPersian ? '+ ایجاد کلید' : '+ Generate'}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {apiKeys.map((k) => (
            <div
              key={k.id}
              className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-xs">{k.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Created: {k.created}
                  </span>
                </div>
                <div className="font-mono text-cyan-300 text-xs mt-1 bg-slate-900 px-2 py-0.5 rounded inline-block border border-slate-800">
                  {k.key}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 font-mono">Limit: {k.rateLimit}</span>
                <button
                  onClick={() => copyToClipboard(k.key, k.id)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition"
                >
                  {copiedKey === k.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>{copiedKey === k.id ? 'Copied' : 'Copy Key'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
