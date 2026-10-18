export interface Member {
  id: string;
  name: string;
  cardNumber?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  createdAt: number;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export interface AppState {
  members: Member[];
  expenses: Expense[];
  theme: 'light' | 'dark';
}
