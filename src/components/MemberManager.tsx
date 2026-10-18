import { useState } from 'react';
import { Plus, X, UserPlus, Users, CreditCard } from 'lucide-react';
import type { Member } from '@/types';
import { formatCardNumber, generateId, toEnglishDigits, toPersianDigits } from '@/utils';

interface MemberManagerProps {
  members: Member[];
  onAdd: (member: Member) => void;
  onRemove: (id: string) => void;
}

export function MemberManager({ members, onAdd, onRemove }: MemberManagerProps) {
  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const trimmed = name.trim();
    const cardDigits = toEnglishDigits(cardNumber).replace(/[^\d]/g, '');
    if (!trimmed) return;
    if (cardDigits.length > 0 && cardDigits.length !== 16) {
      setError('شماره کارت باید ۱۶ رقم باشد');
      return;
    }
    if (members.some((m) => m.name === trimmed)) {
      setName('');
      setCardNumber('');
      setError('');
      return;
    }
    onAdd({
      id: generateId(),
      name: trimmed,
      ...(cardDigits ? { cardNumber: cardDigits } : {}),
    });
    setName('');
    setCardNumber('');
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleCardChange = (value: string) => {
    setCardNumber(formatCardNumber(value));
    setError('');
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-soft dark:border-slate-700/60 dark:bg-slate-800/80">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
          <Users className="h-5 w-5" />
        </div>
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
          اعضای گروه
        </h2>
        {members.length > 0 && (
          <span className="mr-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {toPersianDigits(members.length)} نفر
          </span>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <div className="relative">
          <UserPlus className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="نام عضو جدید..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-11 pl-3 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-700"
            maxLength={30}
          />
        </div>
        <div className="relative">
          <CreditCard className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            inputMode="numeric"
            dir="ltr"
            value={cardNumber}
            onChange={(e) => handleCardChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="شماره کارت (اختیاری)"
            aria-label="شماره کارت اختیاری"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-11 text-left text-sm tracking-wide text-slate-800 placeholder:text-right placeholder:tracking-normal placeholder:text-slate-400 transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-700"
            maxLength={19}
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!name.trim()}
          className="flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-brand-600 enabled:active:bg-brand-700"
        >
          <Plus className="h-5 w-5" />
          افزودن
        </button>
      </div>
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </p>
      )}

      {members.length === 0 ? (
        <p className="mt-4 text-center text-sm text-slate-400 dark:text-slate-500">
          هنوز عضوی اضافه نکرده‌اید
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {members.map((m) => (
            <span
              key={m.id}
              className="group animate-scale-in inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 py-1.5 pr-3 pl-1.5 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 dark:border-slate-600 dark:bg-slate-700/60 dark:text-slate-200 dark:hover:border-brand-700 dark:hover:bg-brand-900/30"
            >
              {m.name}
              <button
                onClick={() => onRemove(m.id)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/40"
                aria-label={`حذف ${m.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
