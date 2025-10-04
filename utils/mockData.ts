import { FinancialData } from '@/types/financial';

export const MOCK_FINANCIAL_DATA: FinancialData = {
  monthlyIncome: 4500,
  monthlyExpenses: {
    housing: 1200,
    food: 600,
    transportation: 350,
    entertainment: 400,
    utilities: 200,
    other: 250,
  },
  currentSavings: 5000,
  currentDebt: 8000,
  savingsGoal: 20000,
};

// Mock Nessie API response structure
export interface NessieTransaction {
  _id: string;
  type: 'debit' | 'credit';
  transaction_date: string;
  amount: number;
  merchant_id?: string;
  description: string;
  category?: string;
}

export const MOCK_NESSIE_TRANSACTIONS: NessieTransaction[] = [
  {
    _id: '1',
    type: 'debit',
    transaction_date: '2025-09-15',
    amount: 85.50,
    description: 'Restaurant',
    category: 'food',
  },
  {
    _id: '2',
    type: 'debit',
    transaction_date: '2025-09-14',
    amount: 1200.00,
    description: 'Rent Payment',
    category: 'housing',
  },
  {
    _id: '3',
    type: 'credit',
    transaction_date: '2025-09-13',
    amount: 4500.00,
    description: 'Direct Deposit - Salary',
    category: 'income',
  },
  {
    _id: '4',
    type: 'debit',
    transaction_date: '2025-09-12',
    amount: 45.00,
    description: 'Gas Station',
    category: 'transportation',
  },
  {
    _id: '5',
    type: 'debit',
    transaction_date: '2025-09-10',
    amount: 120.00,
    description: 'Concert Tickets',
    category: 'entertainment',
  },
];

export function parseNessieData(transactions: NessieTransaction[]): Partial<FinancialData> {
  const expenses = {
    housing: 0,
    food: 0,
    transportation: 0,
    entertainment: 0,
    utilities: 0,
    other: 0,
  };

  let totalIncome = 0;

  transactions.forEach(txn => {
    if (txn.type === 'credit' && txn.category === 'income') {
      totalIncome += txn.amount;
    } else if (txn.type === 'debit' && txn.category) {
      const category = txn.category as keyof typeof expenses;
      if (category in expenses) {
        expenses[category] += txn.amount;
      } else {
        expenses.other += txn.amount;
      }
    }
  });

  return {
    monthlyIncome: totalIncome,
    monthlyExpenses: expenses,
  };
}

