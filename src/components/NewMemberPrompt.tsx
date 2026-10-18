import { UserPlus, Check, X } from 'lucide-react';
import type { Member } from '@/types';

interface NewMemberPromptProps {
  open: boolean;
  member: Member | null;
  onConfirm: (addToPast: boolean) => void;
  onCancel: () => void;
}

export function NewMemberPrompt({
  open,
  member,
  onConfirm,
  onCancel,
}: NewMemberPromptProps) {
  if (!open || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-5 shadow-card animate-scale-in dark:bg-slate-800">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
            <UserPlus className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              عضو جدید: {member.name}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          آیا این عضو جدید در هزینه‌های قبلی هم سهیم شود؟
        </p>

        <div className="space-y-2.5">
          <button
            onClick={() => onConfirm(true)}
            className="flex w-full items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-3.5 text-right transition active:scale-[0.98] hover:bg-brand-100 dark:border-brand-800/60 dark:bg-brand-900/25 dark:hover:bg-brand-900/40"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-brand-700 dark:text-brand-300">
                بله، در تمام هزینه‌ها
              </p>
              <p className="mt-0.5 text-xs text-brand-600/70 dark:text-brand-400/70">
                به همه هزینه‌های قبلی اضافه و دوباره محاسبه می‌شود
              </p>
            </div>
          </button>

          <button
            onClick={() => onConfirm(false)}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-right transition active:scale-[0.98] hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700/40 dark:hover:bg-slate-700/70"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-400 text-white">
              <X className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                خیر، فقط از هزینه‌های بعدی
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                هزینه‌های قبلی دست‌نخورده باقی می‌مانند
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
