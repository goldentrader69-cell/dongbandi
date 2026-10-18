import { forwardRef } from 'react';
import { Wallet, ArrowLeft, CheckCircle2, Receipt, User, Calendar, CreditCard } from 'lucide-react';
import type { Member, Settlement, Expense } from '@/types';
import { formatToman, toPersianDigits } from '@/utils';

function formatExpenseDate(timestamp: number): string {
  const d = new Date(timestamp);
  const date = d.toLocaleDateString('fa-IR', {
    month: 'short',
    day: 'numeric',
  });
  const time = d.toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${date} - ${time}`;
}

interface ReceiptCardProps {
  members: Member[];
  expenses: Expense[];
  settlements: Settlement[];
  totalAmount: number;
  qrDataUrl: string;
}

const BRAND_URL = 'dongbandi.ir';

function formatCardNumber(cardNumber: string): string {
  return toPersianDigits(cardNumber.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim());
}

function formatDateTime(): string {
  const now = new Date();
  const date = now.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = now.toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${date} - ${time}`;
}

export const ReceiptCard = forwardRef<HTMLDivElement, ReceiptCardProps>(
  ({ members, expenses, settlements, totalAmount, qrDataUrl }, ref) => {
    const nameOf = (id: string) =>
      members.find((m) => m.id === id)?.name ?? 'ناشناخته';
    const memberOf = (id: string) => members.find((m) => m.id === id);
    const perPersonShare = members.length > 0 ? totalAmount / members.length : 0;

    return (
      <div
        ref={ref}
        className="w-[640px] overflow-hidden rounded-3xl bg-white"
        style={{ direction: 'rtl', fontFamily: "'Vazirmatn', system-ui, sans-serif" }}
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-7 py-7">
          <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-brand-500/10 blur-2xl" />
          <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-accent-500/10 blur-2xl" />

          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lg">
              <Wallet className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-white">دنگ‌بندی</h1>
              <p className="mt-0.5 text-sm text-slate-400">رسید تسویه‌حساب گروهی</p>
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-500">تاریخ</p>
              <p className="mt-0.5 text-sm font-medium text-slate-300">
                {formatDateTime()}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="relative mt-6 grid grid-cols-4 gap-2">
            <div className="rounded-2xl bg-white/5 p-3.5 text-center backdrop-blur-sm">
              <p className="text-xs text-slate-400">اعضا</p>
              <p className="mt-1 text-xl font-bold text-white">
                {toPersianDigits(members.length)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 p-3.5 text-center backdrop-blur-sm">
              <p className="text-xs text-slate-400">هزینه‌ها</p>
              <p className="mt-1 text-xl font-bold text-white">
                {toPersianDigits(expenses.length)}
              </p>
            </div>
            <div className="rounded-2xl bg-brand-500/15 p-3.5 text-center backdrop-blur-sm">
              <p className="text-xs text-brand-300/80">مجموع</p>
              <p className="mt-1 text-sm font-bold text-brand-300">
                {toPersianDigits(totalAmount.toLocaleString('en-US'))}
                <span className="mr-1 text-xs">ت</span>
              </p>
            </div>
            <div className="rounded-2xl bg-accent-500/15 p-3.5 text-center backdrop-blur-sm">
              <p className="text-xs text-accent-300/80">دنگ هر نفر</p>
              <p className="mt-1 text-sm font-bold text-accent-300">
                {toPersianDigits(Math.round(perPersonShare).toLocaleString('en-US'))}
                <span className="mr-1 text-xs">ت</span>
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-7 py-6">
          {/* Expense breakdown */}
          <div className="mb-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                <Receipt className="h-4 w-4 text-accent-500" />
                خلاصه هزینه‌ها
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="space-y-2">
              {expenses.map((e, i) => (
                <div
                  key={e.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-200 text-[11px] font-bold text-slate-500">
                      {toPersianDigits(i + 1)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-800">
                      {e.title}
                    </span>
                    <span className="shrink-0 text-sm font-extrabold text-brand-700">
                      {toPersianDigits(e.amount.toLocaleString('en-US'))}
                      <span className="mr-1 text-xs font-normal text-slate-400">ت</span>
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 pr-8.5">
                    <span className="flex items-center gap-1 rounded-md bg-slate-200/60 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                      <User className="h-3 w-3" />
                      {nameOf(e.paidBy)}
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap rounded-md bg-slate-200/60 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                      <Calendar className="h-3 w-3" />
                      {formatExpenseDate(e.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settlements */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-sm font-bold text-slate-700">تسویه حساب</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {settlements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle2 className="mb-3 h-12 w-12 text-brand-500" />
                <p className="text-base font-bold text-slate-700">حساب‌ها صاف است!</p>
                <p className="mt-1 text-sm text-slate-400">کسی به کسی بدهکار نیست</p>
              </div>
            ) : (
              <div className="space-y-2">
                {settlements.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-2.5"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-[11px] font-bold text-slate-600">
                      {toPersianDigits(i + 1)}
                    </div>
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-slate-800">
                        {nameOf(s.from)}
                      </span>
                      <span dir="rtl" className="flex shrink-0 items-center gap-1 whitespace-nowrap text-slate-400">
                        <span className="text-[11px]">بپردازد به</span>
                        <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left">
                        <span className="whitespace-nowrap text-sm font-semibold text-slate-800">
                          {nameOf(s.to)}
                        </span>
                        {memberOf(s.to)?.cardNumber && (
                          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-slate-200/70 px-2 py-0.5 font-mono text-[12px] font-medium tracking-wide text-slate-700" dir="ltr">
                            <CreditCard className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
                            {formatCardNumber(memberOf(s.to)?.cardNumber ?? '')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 rounded-lg bg-brand-500/10 px-2.5 py-1 text-xs font-bold text-brand-700">
                      {formatToman(s.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-7 py-5">
          <div className="flex items-center gap-4">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="h-18 w-18 rounded-lg bg-white p-1.5"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="h-18 w-18 rounded-lg bg-white" />
            )}
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-700">
                محاسبه سریع دنگ بدون نیاز به نصب
              </p>
              <p className="mt-1 text-lg font-extrabold text-brand-600">{BRAND_URL}</p>
              <p className="mt-1 text-xs text-slate-400">
                محاسبه شده در دنگ‌بندی - {toPersianDigits(new Date().getFullYear())}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 border-t border-slate-200/80 pt-4 text-xs text-gray-400 opacity-80">
            <svg
              className="h-5 w-5 text-gray-800 dark:text-gray-200"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label="MA"
            >
              <path d="M15 85 V25 L45 55 L75 25 V85" />
              <path d="M45 55 V85" />
            </svg>
            <span>توسعه‌یافته با دقت و سادگی | MA</span>
          </div>
        </div>
      </div>
    );
  }
);

ReceiptCard.displayName = 'ReceiptCard';
