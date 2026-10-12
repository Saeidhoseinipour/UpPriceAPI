import React, { useState, useEffect } from 'react';
import { Copy, Check, X, Rss, ExternalLink, Code } from 'lucide-react';

interface TorobFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPersian: boolean;
}

export const TorobFeedModal: React.FC<TorobFeedModalProps> = ({
  isOpen,
  onClose,
  isPersian,
}) => {
  const [feedFormat, setFeedFormat] = useState<'json' | 'xml'>('json');
  const [feedPreview, setFeedPreview] = useState<string>('Loading feed...');
  const [copied, setCopied] = useState(false);

  const feedUrl = `${window.location.origin}/api/v1/torob-feed?format=${feedFormat}`;

  useEffect(() => {
    if (isOpen) {
      fetch(`/api/v1/torob-feed?format=${feedFormat}`)
        .then((res) => (feedFormat === 'xml' ? res.text() : res.json()))
        .then((data) => {
          if (feedFormat === 'xml') {
            setFeedPreview(data);
          } else {
            setFeedPreview(JSON.stringify(data, null, 2));
          }
        })
        .catch(() => setFeedPreview('Error loading preview.'));
    }
  }, [isOpen, feedFormat]);

  if (!isOpen) return null;

  const copyUrl = () => {
    navigator.clipboard.writeText(feedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Rss className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isPersian ? 'فید خودکار محصولات جهت اتصال به ترب (Torob Feed)' : 'Torob Product Feed Connector'}
              </h3>
              <p className="text-xs text-slate-400">
                {isPersian
                  ? 'این آدرس را در پنل فروشندگان ترب (قسمت اتصال API) وارد نمایید'
                  : 'Enter this URL in your Torob Seller Panel for instant product indexing'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector & URL Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">
              {isPersian ? 'فرمت خروجی فید:' : 'Feed Format:'}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFeedFormat('json')}
                className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition ${
                  feedFormat === 'json'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                JSON (Recommended)
              </button>
              <button
                onClick={() => setFeedFormat('xml')}
                className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition ${
                  feedFormat === 'xml'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                XML (Standard)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={feedUrl}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 focus:outline-none"
            />
            <button
              onClick={copyUrl}
              className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'کپی شد' : 'Copy URL'}</span>
            </button>
            <a
              href={feedUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{isPersian ? 'پیش‌نمایش زنده خروجی:' : 'Live Output Preview:'}</span>
            <span className="font-mono text-slate-500">HTTP 200 OK</span>
          </div>
          <pre className="p-3 rounded-lg bg-slate-950 text-emerald-400 font-mono text-[11px] max-h-56 overflow-auto border border-slate-800/80 leading-relaxed">
            {feedPreview}
          </pre>
        </div>

        {/* Instructions */}
        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">
            {isPersian ? 'نکات فنی همگام‌سازی با ترب:' : 'Torob Crawling Notes:'}
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-400">
            <li>
              {isPersian
                ? 'مبالغ به صورت خودکار مطابق استاندارد ترب به ریال (IRR) ارسال می‌شوند.'
                : 'Prices are automatically calculated in Rials (IRR) as required by Torob bot.'}
            </li>
            <li>
              {isPersian
                ? 'هر بار ربات ترب این آدرس را بخواند، جدیدترین قیمت هماهنگ‌شده با دلار یا رقبا دریافت می‌شود.'
                : 'Torob crawler queries this endpoint periodically to maintain buy box ranking.'}
            </li>
          </ul>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            {isPersian ? 'بستن' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
