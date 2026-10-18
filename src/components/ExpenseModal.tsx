import { useState, useEffect } from 'react';
import { Check, X, Receipt, Pencil } from 'lucide-react';
import type { Expense, Member } from '@/types';
import { generateId, formatNumberInput, parseAmount } from '@/utils';

interface ExpenseModalProps {
  open: boolean;
  members: Member[];
  editingExpense: Expense | null;
  onClose: () => void;
  onSave: (expense: Expense) => void;
}

export function ExpenseModal({
  open,
  members,
  editingExpense,
  onClose,
  onSave,
}: ExpenseModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitBetween, setSplitBetween] = useState<string[]>([]);
  const [error, setError] = useState('');

  const isEdit = editingExpense !== null;

  useEffect(() => {
    if (!open) return;
    if (editingExpense) {
      setTitle(editingExpense.title);
      setAmount(
        editingExpense.amount.toLocaleString('en-US').replace(/[0-9]/g, (d) =>
          '۰۱۲۳۴۵۶۷۸۹'[Number(d)]
        )
      );
      setPaidBy(editingExpense.paidBy);
      setSplitBetween(editingExpense.splitBetween);
    } else {
      setTitle('');
      setAmount('');
      setPaidBy(members[0]?.id ?? '');
      setSplitBetween(members.map((m) => m.id));
    }
    setError('');
  }, [open, editingExpense, members]);

  const toggleSplit = (id: string) => {
    setSplitBetween((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    const amountNum = parseAmount(amount);

    if (!trimmedTitle) {
      setError('عنوان هزینه را وارد کنید');
      return;
    }
    if (amountNum <= 0) {
      setError('مبلغ را درست وارد کنید');
      return;
    }
    if (!paidBy) {
      setError('پرداخت‌کننده را انتخاب کنید');
      return;
    }
    if (splitBetween.length === 0) {
      setError('حداقل یک نفر برای تقسیم انتخاب کنید');
      return;
    }

    onSave({
      id: editingExpense?.id ?? generateId(),
      title: trimmedTitle,
      amount: amountNum,
      paidBy,
      splitBetween,
      createdAt: editingExpense?.createdAt ?? Date.now(),
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide rounded-t-3xl bg-white p-5 shadow-card animate-slide-up dark:bg-slate-800 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-100 text-accent-600 dark:bg-accent-700/30 dark:text-accent-400">
              {isEdit ? <Pencil className="h-5 w-5" /> : <Receipt className="h-5 w-5" />}
            </div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {isEdit ? 'ویرایش هزینه' : 'هزینه جدید'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              عنوان
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: ناهار، بنزین، بلیط..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100 dark:placeholder:text-slate-500"
              maxLength={50}
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              مبلغ (تومان)
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(formatNumberInput(e.target.value))}
                placeholder="۱۰۰,۰۰۰"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pl-20 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100 dark:placeholder:text-slate-500 fa-num"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                تومان
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              پرداخت توسط
            </label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                تقسیم بین
              </label>
              <button
                onClick={() =>
                  setSplitBetween(
                    splitBetween.length === members.length
                      ? []
                      : members.map((m) => m.id)
                  )
                }
                className="text-xs font-medium text-brand-600 transition hover:text-brand-700 dark:text-brand-400"
              >
                {splitBetween.length === members.length ? 'حذف همه' : 'انتخاب همه'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => {
                const selected = splitBetween.includes(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleSplit(m.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full border py-1.5 px-3 text-sm font-medium transition active:scale-95 ${
                      selected
                        ? 'border-brand-500 bg-brand-500 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-300'
                    }`}
                  >
                    {selected && <Check className="h-3.5 w-3.5" />}
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="animate-fade-in rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/50"
            >
              انصراف
            </button>
            <button
              onClick={handleSubmit}
              className="flex-[2] rounded-xl bg-brand-500 py-2.5 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] hover:bg-brand-600"
            >
              {isEdit ? 'ذخیره تغییرات' : 'ثبت هزینه'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
