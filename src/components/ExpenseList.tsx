import { useState } from 'react';
import { Receipt, Trash2, ChevronDown, ChevronUp, Check, Pencil } from 'lucide-react';
import type { Expense, Member } from '@/types';
import { formatToman, toPersianDigits } from '@/utils';

interface ExpenseListProps {
  expenses: Expense[];
  members: Member[];
  onRemove: (id: string) => void;
  onEdit: (expense: Expense) => void;
}

export function ExpenseList({ expenses, members, onRemove, onEdit }: ExpenseListProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? 'ناشناخته';

  if (expenses.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center dark:border-slate-600 dark:bg-slate-800/40">
        <Receipt className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          هنوز هزینه‌ای ثبت نشده است
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          هزینه‌های گروه را از بالا اضافه کنید
        </p>
      </div>
    );
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
          هزینه‌ها
        </h2>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          مجموع: <span className="font-bold text-brand-600 dark:text-brand-400">{formatToman(total)}</span>
        </span>
      </div>

      <div className="space-y-2.5">
        {expenses.map((exp, idx) => {
          const isOpen = expanded === exp.id;
          const share = exp.amount / (exp.splitBetween.length || 1);
          return (
            <div
              key={exp.id}
              className="animate-slide-up overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft transition dark:border-slate-700/60 dark:bg-slate-800/80"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : exp.id)}
                className="flex w-full items-center gap-3 p-4 text-right"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-100 text-accent-600 dark:bg-accent-700/30 dark:text-accent-400">
                  <Receipt className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {exp.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    پرداخت توسط {nameOf(exp.paidBy)}
                  </p>
                </div>
                <div className="shrink-0 text-left">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {toPersianDigits(exp.amount.toLocaleString('en-US'))}
                  </p>
                  <p className="text-xs text-slate-400">تومان</p>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 shrink-0 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />
                )}
              </button>

              {isOpen && (
                <div className="animate-fade-in border-t border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/30">
                  <div className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    سهم هر نفر: {formatToman(share)}
                  </div>
                  <div className="mb-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                    بین {toPersianDigits(exp.splitBetween.length)} نفر تقسیم شده:
                  </div>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {exp.splitBetween.map((id) => (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                      >
                        <Check className="h-3 w-3" />
                        {nameOf(id)}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        onEdit(exp);
                        setExpanded(null);
                      }}
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <Pencil className="h-4 w-4" />
                      ویرایش
                    </button>
                    <button
                      onClick={() => {
                        onRemove(exp.id);
                        setExpanded(null);
                      }}
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="h-4 w-4" />
                      حذف هزینه
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
