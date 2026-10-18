import { Plus } from 'lucide-react';
import { toPersianDigits } from '@/utils';

interface AddExpenseButtonProps {
  membersCount: number;
  onClick: () => void;
}

export function AddExpenseButton({ membersCount, onClick }: AddExpenseButtonProps) {
  if (membersCount < 2) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-4 text-center dark:border-slate-600 dark:bg-slate-800/40">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          برای ثبت هزینه حداقل {toPersianDigits(2)} عضو اضافه کنید
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-brand-500 to-brand-600 py-3.5 text-sm font-bold text-white shadow-glow transition active:scale-[0.98] hover:from-brand-600 hover:to-brand-700"
    >
      <Plus className="h-5 w-5" />
      افزودن هزینه
    </button>
  );
}
