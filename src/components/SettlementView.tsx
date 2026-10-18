import { ArrowLeft, CheckCircle2, Scale } from 'lucide-react';
import type { Member, Settlement } from '@/types';
import { formatToman, toPersianDigits } from '@/utils';

interface SettlementViewProps {
  members: Member[];
  settlements: Settlement[];
  expenses: Expense[];
}

import type { Expense } from '@/types';

export function SettlementView({ members, settlements, expenses }: SettlementViewProps) {
  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? 'ناشناخته';

  if (expenses.length === 0) {
    return null;
  }

  const hasDebts = settlements.length > 0;

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-soft dark:border-slate-700/60 dark:bg-slate-800/80">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
          <Scale className="h-5 w-5" />
        </div>
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
          تسویه حساب
        </h2>
        {hasDebts && (
          <span className="mr-auto rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
            {toPersianDigits(settlements.length)} پرداخت
          </span>
        )}
      </div>

      {!hasDebts ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <CheckCircle2 className="mb-2 h-12 w-12 text-brand-500" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            حساب‌ها صاف است!
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            کسی به کسی بدهکار نیست
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {settlements.map((s, idx) => (
            <div
              key={idx}
              className="animate-slide-up flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/40"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm dark:bg-slate-700 dark:text-slate-300">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="flex flex-1 items-center justify-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <span className="shrink-0 whitespace-nowrap font-semibold">{nameOf(s.from)}</span>
                <span dir="rtl" className="flex shrink-0 items-center gap-1 whitespace-nowrap text-slate-400 dark:text-slate-500">
                  <span className="text-xs">بپردازد به</span>
                  <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </span>
                <span className="shrink-0 whitespace-nowrap font-semibold">{nameOf(s.to)}</span>
              </div>
              <div className="shrink-0 rounded-lg bg-brand-500/10 px-2.5 py-1.5 text-sm font-bold text-brand-700 dark:bg-brand-400/15 dark:text-brand-300">
                {formatToman(s.amount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
