import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';
import QRCode from 'qrcode';
import { Moon, Sun, Copy, Wallet, Sparkles, Trash, Share2, X, Image as ImageIcon, AlertTriangle, Download } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { MemberManager } from '@/components/MemberManager';
import { AddExpenseButton } from '@/components/AddExpenseButton';
import { ExpenseList } from '@/components/ExpenseList';
import { SettlementView } from '@/components/SettlementView';
import { Toast } from '@/components/Toast';
import { ExpenseModal } from '@/components/ExpenseModal';
import { NewMemberPrompt } from '@/components/NewMemberPrompt';
import { ReceiptCard } from '@/components/ReceiptCard';
import { simplifyDebts, buildSummaryText, toPersianDigits } from '@/utils';
import type { Expense, Member } from '@/types';

const BRAND_URL = 'https://dongbandi.ir';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function App() {
  const { state, setState, toggleTheme } = useAppState();
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [pendingMember, setPendingMember] = useState<Member | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [savedImage, setSavedImage] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installVisible, setInstallVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    QRCode.toDataURL(BRAND_URL, {
      width: 200,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, []);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    const iosDevice = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsIos(iosDevice && !standalone && !iosStandalone);
    setInstallVisible(!standalone && !iosStandalone && iosDevice);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setInstallVisible(true);
    };
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setInstallVisible(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      if (isIos) setShowIosHelp(true);
      return;
    }
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setInstallVisible(false);
  };

  const captureReceipt = useCallback(async (): Promise<string | null> => {
    if (!receiptRef.current) return null;
    try {
      const dataUrl = await toPng(receiptRef.current, {
        pixelRatio: 3,
        quality: 1.0,
        cacheBust: true,
      });
      return dataUrl;
    } catch {
      return null;
    }
  }, []);

  const { members, expenses, theme } = state;

  const settlements = useMemo(
    () => simplifyDebts(members, expenses),
    [members, expenses]
  );

  const totalAmount = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const perPersonShare = members.length > 0 ? totalAmount / members.length : 0;

  const showToast = (message: string) => {
    setToast({ show: true, message });
  };

  const addMember = (member: Member) => {
    if (expenses.length > 0) {
      setPendingMember(member);
    } else {
      setState((s) => ({ ...s, members: [...s.members, member] }));
    }
  };

  const confirmAddMember = (addToPast: boolean) => {
    if (!pendingMember) return;
    const newMember = pendingMember;
    setState((s) => {
      const updatedExpenses = addToPast
        ? s.expenses.map((e) => ({
            ...e,
            splitBetween: [...e.splitBetween, newMember.id],
          }))
        : s.expenses;
      return {
        ...s,
        members: [...s.members, newMember],
        expenses: updatedExpenses,
      };
    });
    setPendingMember(null);
    showToast(
      addToPast
        ? `${newMember.name} به همه هزینه‌ها اضافه شد`
        : `${newMember.name} اضافه شد`
    );
  };

  const removeMember = (id: string) => {
    setState((s) => ({
      ...s,
      members: s.members.filter((m) => m.id !== id),
      expenses: s.expenses
        .map((e) => ({
          ...e,
          splitBetween: e.splitBetween.filter((x) => x !== id),
        }))
        .filter((e) => e.paidBy !== id && e.splitBetween.length > 0),
    }));
  };

  const openAddExpense = () => {
    setEditingExpense(null);
    setModalOpen(true);
  };

  const openEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };

  const saveExpense = (expense: Expense) => {
    setState((s) => {
      const exists = s.expenses.some((e) => e.id === expense.id);
      return {
        ...s,
        expenses: exists
          ? s.expenses.map((e) => (e.id === expense.id ? expense : e))
          : [...s.expenses, expense],
      };
    });
    showToast(editingExpense ? 'تغییرات ذخیره شد' : 'هزینه ثبت شد');
  };

  const removeExpense = (id: string) => {
    setState((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) }));
    showToast('هزینه حذف شد');
  };

  const handleCopy = async () => {
    if (expenses.length === 0) {
      showToast('هیچ هزینه‌ای برای کپی وجود ندارد');
      return;
    }
    const text = buildSummaryText(members, expenses, settlements);
    try {
      await navigator.clipboard.writeText(text);
      showToast('خلاصه کپی شد! در تلگرام/واتس‌اپ پیست کنید');
    } catch {
      showToast('کپی ناموفق بود');
    }
  };

  const openReceipt = () => {
    if (expenses.length === 0) {
      showToast('هیچ هزینه‌ای برای نمایش وجود ندارد');
      return;
    }
    setReceiptOpen(true);
  };

  const handleSaveAndShare = async () => {
    setIsExporting(true);
    const dataUrl = await captureReceipt();
    setIsExporting(false);
    if (!dataUrl) {
      showToast('ساخت تصویر ناموفق بود');
      return;
    }

    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'dongbandi-receipt.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'رسید تسویه حساب دنگ‌بندی',
        });
        showToast('تصویر ذخیره/اشتراک‌گذاری شد');
      } else {
        const link = document.createElement('a');
        link.download = 'dongbandi-receipt.png';
        link.href = dataUrl;
        link.click();
        setSavedImage(dataUrl);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setSavedImage(dataUrl);
    }
  };

  const handleResetConfirm = () => {
    setState((s) => ({ ...s, members: [], expenses: [] }));
    setResetOpen(false);
    showToast('همه داده‌ها پاک شد');
  };

  return (
    <div className="theme-transition min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-glow">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-extrabold leading-tight text-slate-800 dark:text-white">
              دنگ‌بندی
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              تقسیم هزینه‌های گروهی
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="تغییر تم"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-lg space-y-4 px-4 py-5 pb-40">
        {installVisible && (
          <div className="animate-slide-up rounded-2xl border border-brand-200/70 bg-brand-50/80 p-3 shadow-soft dark:border-brand-800/50 dark:bg-brand-900/20">
            <button
              onClick={handleInstall}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              نصب نسخه وب‌اپلیکیشن (PWA)
            </button>
            {showIosHelp && (
              <p className="mt-2 text-center text-xs leading-6 text-brand-800 dark:text-brand-200">
                برای نصب در آیفون: دکمه Share مرورگر و سپس Add to Home Screen را بزنید
              </p>
            )}
          </div>
        )}

        {/* Stats summary */}
        {expenses.length > 0 && (
          <div className="animate-slide-up grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3 text-center shadow-soft dark:border-slate-700/60 dark:bg-slate-800/80">
              <p className="text-xs text-slate-400 dark:text-slate-500">هزینه‌ها</p>
              <p className="mt-1 text-lg font-bold text-slate-800 dark:text-white">
                {toPersianDigits(expenses.length)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3 text-center shadow-soft dark:border-slate-700/60 dark:bg-slate-800/80">
              <p className="text-xs text-slate-400 dark:text-slate-500">اعضا</p>
              <p className="mt-1 text-lg font-bold text-slate-800 dark:text-white">
                {toPersianDigits(members.length)}
              </p>
            </div>
            <div className="rounded-2xl border border-brand-200/60 bg-brand-50/60 p-3 text-center shadow-soft dark:border-brand-800/40 dark:bg-brand-900/20">
              <p className="text-xs text-brand-600/70 dark:text-brand-300/70">مجموع</p>
              <p className="mt-1 text-sm font-bold text-brand-700 dark:text-brand-300">
                {toPersianDigits(totalAmount.toLocaleString('en-US'))}
              </p>
            </div>
            <div className="rounded-2xl border border-accent-200/60 bg-accent-50/60 p-3 text-center shadow-soft dark:border-accent-800/40 dark:bg-accent-900/20">
              <p className="text-xs text-accent-600/80 dark:text-accent-300/80">دنگ هر نفر</p>
              <p className="mt-1 text-sm font-bold text-accent-700 dark:text-accent-300">
                {toPersianDigits(Math.round(perPersonShare).toLocaleString('en-US'))} ت
              </p>
            </div>
          </div>
        )}

        {/* Members */}
        <MemberManager members={members} onAdd={addMember} onRemove={removeMember} />

        {/* Add expense */}
        <AddExpenseButton membersCount={members.length} onClick={openAddExpense} />

        {/* Expense list */}
        <ExpenseList
          expenses={expenses}
          members={members}
          onRemove={removeExpense}
          onEdit={openEditExpense}
        />

        {/* Settlement */}
        <SettlementView
          members={members}
          settlements={settlements}
          expenses={expenses}
        />

        {/* Reset all */}
        {(expenses.length > 0 || members.length > 0) && (
          <button
            onClick={() => setResetOpen(true)}
            className="mx-auto flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium text-slate-400 transition hover:text-red-500 dark:text-slate-500"
          >
            <Trash className="h-4 w-4" />
            شروع مجدد / پاک کردن همه
          </button>
        )}

        <footer className="flex items-center justify-center gap-2 py-4 text-xs text-gray-400 opacity-80 transition-opacity hover:opacity-100 dark:text-gray-500">
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
        </footer>
      </main>

      {/* Fixed bottom action bar */}
      {expenses.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200/60 bg-white/90 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/90">
          <div className="mx-auto max-w-lg space-y-2 px-4 py-3">
            <button
              onClick={openReceipt}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-brand-500 to-brand-600 py-3 text-sm font-bold text-white shadow-glow transition active:scale-[0.98] hover:from-brand-600 hover:to-brand-700"
            >
              <ImageIcon className="h-5 w-5" />
              ساخت کارت رسید
            </button>
            <button
              onClick={handleCopy}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 transition active:scale-[0.98] hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Copy className="h-5 w-5" />
              کپی خلاصه متنی برای تلگرام/واتس‌اپ
            </button>
          </div>
        </div>
      )}

      {/* Empty state sparkle */}
      {members.length === 0 && expenses.length === 0 && (
        <div className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 transform pb-2 text-slate-200 dark:text-slate-800">
          <Sparkles className="h-6 w-6 animate-pulse" />
        </div>
      )}

      {/* Modals */}
      <ExpenseModal
        open={modalOpen}
        members={members}
        editingExpense={editingExpense}
        onClose={() => {
          setModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={saveExpense}
      />

      <NewMemberPrompt
        open={pendingMember !== null}
        member={pendingMember}
        onConfirm={confirmAddMember}
        onCancel={() => setPendingMember(null)}
      />

      {/* Receipt modal */}
      {receiptOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setReceiptOpen(false)}
          />
          <div className="relative z-10 flex max-h-[95vh] w-full max-w-lg flex-col animate-slide-up">
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                کارت رسید تسویه‌حساب
              </h3>
              <button
                onClick={() => setReceiptOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-slate-500 shadow-sm transition hover:bg-white dark:bg-slate-800/90 dark:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto scrollbar-hide pb-4">
              {/* Off-screen full-size card for export */}
              <div className="pointer-events-none fixed -left-[9999px] -top-[9999px] opacity-0">
                <ReceiptCard
                  ref={receiptRef}
                  members={members}
                  expenses={expenses}
                  settlements={settlements}
                  totalAmount={totalAmount}
                  qrDataUrl={qrDataUrl}
                />
              </div>

              {/* Preview (scaled down) */}
              <div className="origin-top scale-[0.56] sm:scale-[0.72]">
                <ReceiptCard
                  members={members}
                  expenses={expenses}
                  settlements={settlements}
                  totalAmount={totalAmount}
                  qrDataUrl={qrDataUrl}
                />
              </div>
            </div>

            <div className="space-y-2 rounded-2xl bg-white/95 p-3 shadow-card dark:bg-slate-800/95">
              <button
                onClick={handleSaveAndShare}
                disabled={isExporting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] hover:bg-brand-600 disabled:opacity-50"
              >
                <Share2 className="h-5 w-5" />
                {isExporting ? 'در حال ساخت...' : 'ذخیره و اشتراک تصویر'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save image fallback modal (iOS / desktop) */}
      {savedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setSavedImage(null)}
          />
          <div className="relative z-10 flex max-h-[95vh] w-full max-w-md flex-col items-center animate-scale-in">
            <div className="mb-3 overflow-y-auto scrollbar-hide">
              <img
                src={savedImage}
                alt="رسید دنگ‌بندی"
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="w-full rounded-2xl bg-white/95 p-4 shadow-card dark:bg-slate-800/95">
              <p className="mb-3 text-center text-sm font-medium text-slate-700 dark:text-slate-200">
                عکس آماده شد! برای ذخیره در گالری، انگشت خود را روی تصویر نگه داشته و گزینه «ذخیره در عکس‌ها» (Save Image) را انتخاب کنید.
              </p>
              <button
                onClick={() => setSavedImage(null)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-600 transition active:scale-[0.98] hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset confirmation modal */}
      {resetOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setResetOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm animate-scale-in rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800">
            <div className="mb-4 flex flex-col items-center text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-900/20">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                شروع مجدد
              </h3>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                آیا از پاک کردن همه اعضا و هزینه‌ها مطمئن هستید؟ این عمل قابل بازگشت نیست.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setResetOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition active:scale-[0.98] hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              >
                انصراف
              </button>
              <button
                onClick={handleResetConfirm}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white transition active:scale-[0.98] hover:bg-red-600"
              >
                پاک کن
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ show: false, message: '' })}
      />
    </div>
  );
}
