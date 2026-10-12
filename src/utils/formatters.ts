import { CurrencyUnit } from '../types';

export function toPersianDigits(num: number | string): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num
    .toString()
    .replace(/[0-9]/g, (char) => farsiDigits[parseInt(char, 10)]);
}

export function formatPrice(
  tomanAmount: number,
  unit: CurrencyUnit = 'TOMAN',
  isPersian: boolean = false
): string {
  if (tomanAmount === undefined || tomanAmount === null) return '0';
  
  const value = unit === 'RIAL' ? tomanAmount * 10 : tomanAmount;
  const formattedNumber = Math.round(value).toLocaleString(isPersian ? 'fa-IR' : 'en-US');

  if (isPersian) {
    const unitLabel = unit === 'RIAL' ? 'ریال' : 'تومان';
    return `${toPersianDigits(formattedNumber)} ${unitLabel}`;
  }

  const unitLabel = unit === 'RIAL' ? 'Rials' : 'Tomans';
  return `${formattedNumber} ${unitLabel}`;
}

export function formatPercent(value: number, isPersian: boolean = false): string {
  const formatted = value.toFixed(1);
  if (isPersian) {
    return `${toPersianDigits(formatted)}٪`;
  }
  return `${formatted}%`;
}

export function calculateMargin(sellingPriceToman: number, costPriceToman: number): number {
  if (!sellingPriceToman || sellingPriceToman <= 0) return 0;
  return Number((((sellingPriceToman - costPriceToman) / sellingPriceToman) * 100).toFixed(1));
}
