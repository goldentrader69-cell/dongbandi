import type { Expense, Member, Settlement } from '@/types';

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

export function toEnglishDigits(input: string): string {
  return input.replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)));
}

export function formatToman(amount: number): string {
  const rounded = Math.round(amount);
  const withSeparator = rounded.toLocaleString('en-US');
  return `${toPersianDigits(withSeparator)} تومان`;
}

export function formatNumberInput(value: string): string {
  const digits = toEnglishDigits(value).replace(/[^\d]/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10);
  return toPersianDigits(num.toLocaleString('en-US'));
}

export function parseAmount(formatted: string): number {
  const digits = toEnglishDigits(formatted).replace(/[^\d]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

export function formatCardNumber(value: string): string {
  const digits = toEnglishDigits(value).replace(/[^\d]/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function computeBalances(members: Member[], expenses: Expense[]): Map<string, number> {
  const balances = new Map<string, number>();
  members.forEach((m) => balances.set(m.id, 0));

  for (const exp of expenses) {
    const payerBalance = balances.get(exp.paidBy) ?? 0;
    balances.set(exp.paidBy, payerBalance + exp.amount);

    const count = exp.splitBetween.length || 1;
    const share = exp.amount / count;
    for (const memberId of exp.splitBetween) {
      const current = balances.get(memberId) ?? 0;
      balances.set(memberId, current - share);
    }
  }

  return balances;
}

export function simplifyDebts(members: Member[], expenses: Expense[]): Settlement[] {
  const balances = computeBalances(members, expenses);

  const debtors: { id: string; amount: number }[] = [];
  const creditors: { id: string; amount: number }[] = [];

  balances.forEach((amount, id) => {
    const rounded = Math.round(amount);
    if (rounded < -0.5) {
      debtors.push({ id, amount: -rounded });
    } else if (rounded > 0.5) {
      creditors.push({ id, amount: rounded });
    }
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let di = 0;
  let ci = 0;

  while (di < debtors.length && ci < creditors.length) {
    const debtor = debtors[di];
    const creditor = creditors[ci];
    const payment = Math.min(debtor.amount, creditor.amount);

    if (payment > 0) {
      settlements.push({ from: debtor.id, to: creditor.id, amount: payment });
    }

    debtor.amount -= payment;
    creditor.amount -= payment;

    if (debtor.amount <= 0) di++;
    if (creditor.amount <= 0) ci++;
  }

  return settlements;
}

export function buildSummaryText(
  members: Member[],
  expenses: Expense[],
  settlements: Settlement[]
): string {
  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? 'ناشناخته';

  const lines: string[] = [];
  lines.push('📊 خلاصه دنگ‌بندی');
  lines.push('━━━━━━━━━━━━━━━━━');

  if (expenses.length === 0) {
    lines.push('هیچ هزینه‌ای ثبت نشده است.');
    return lines.join('\n');
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  lines.push(`👥 اعضا: ${toPersianDigits(members.length)} نفر`);
  lines.push(`💰 مجموع هزینه‌ها: ${formatToman(total)}`);
  lines.push(`📝 تعداد هزینه‌ها: ${toPersianDigits(expenses.length)}`);
  lines.push('');
  lines.push('💸 هزینه‌ها:');
  expenses.forEach((e, i) => {
    lines.push(
      `${toPersianDigits(i + 1)}. ${e.title} — ${formatToman(e.amount)} (پرداخت توسط ${nameOf(e.paidBy)})`
    );
  });

  lines.push('');
  if (settlements.length === 0) {
    lines.push('✅ حساب‌ها صاف است! کسی به کسی بدهکار نیست.');
  } else {
    lines.push(`🔁 تسویه (${toPersianDigits(settlements.length)} پرداخت):`);
    settlements.forEach((s, i) => {
      lines.push(
        `${toPersianDigits(i + 1)}. ${nameOf(s.from)} باید ${formatToman(s.amount)} به ${nameOf(s.to)} بپردازد`
      );
    });
  }

  lines.push('');
  lines.push('------------------------');
  lines.push('محاسبه شده در دنگ‌بندی:');
  try {
    lines.push(window.location.href);
  } catch {
    lines.push('https://dong-bandi.app');
  }

  return lines.join('\n');
}
