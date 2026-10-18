import { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

export function Toast({ message, show, onClose }: ToastProps) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 animate-slide-up">
      <div className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-card dark:bg-white dark:text-slate-900">
        <CheckCircle2 className="h-5 w-5 text-brand-400 dark:text-brand-600" />
        <span>{message}</span>
        <button onClick={onClose} className="mr-1 opacity-60 transition hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
