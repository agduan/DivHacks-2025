import { FinancialData } from '@/types/financial';

export interface NessieAccount {
  _id: string;
  type: string;
  nickname: string;
  rewards: number;
  balance: number;
  account_number: string;
  customer_id?: string;
}

export interface NessieCustomer {
  _id: string;
  first_name: string;
  last_name: string;
  address: {
    street_number: string;
    street_name: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface NessieTransaction {
  _id: string;
  type: 'debit' | 'credit';
  transaction_date: string;
  amount: number;
  merchant_id?: string;
  description: string;
  category?: string;
}

export interface NessieApiResponse {
  transactions?: NessieTransaction[];
  accounts?: NessieAccount[];
  parsedData?: Partial<FinancialData>;
  success: boolean;
  source: 'api' | 'mock' | 'fallback';
  error?: string;
}

export class NessieService {
  private static baseUrl = '/api/nessie';

  /**
   * Fetch customer information from Nessie API
   */
  static async getCustomerInfo(customerId: string): Promise<NessieCustomer> {
    try {
      const response = await fetch(`http://api.nessieisreal.com/customers/${customerId}?key=${process.env.NEXT_PUBLIC_NESSIE_API_KEY || '317082b558de224c2bc17b4646d7c356'}`);
      
      if (!response.ok) {
        throw new Error(`Customer not found: ${response.status}`);
      }

      const customer = await response.json();
      return customer;
    } catch (error) {
      console.error('Error fetching customer info:', error);
      throw error;
    }
  }

  /**
   * Fetch customer accounts from Nessie API
   */
  static async getCustomerAccounts(customerId: string): Promise<NessieAccount[]> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.status}`);
      }

      const data: NessieApiResponse = await response.json();
      
      if (!data.success || !data.accounts) {
        throw new Error(data.error || 'Failed to fetch accounts');
      }

      return data.accounts;
    } catch (error) {
      console.error('Error fetching customer accounts:', error);
      throw error;
    }
  }

  /**
   * Fetch transactions for a specific account
   */
  static async getAccountTransactions(accountId: string, useMock: boolean = false): Promise<{
    transactions: NessieTransaction[];
    parsedData: Partial<FinancialData>;
    source: string;
  }> {
    try {
      const params = new URLSearchParams();
      params.append('accountId', accountId);
      if (useMock) {
        params.append('useMock', 'true');
      }

      const response = await fetch(`${this.baseUrl}?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status}`);
      }

      const data: NessieApiResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch transactions');
      }

      return {
        transactions: data.transactions || [],
        parsedData: data.parsedData || {},
        source: data.source || 'unknown'
      };
    } catch (error) {
      console.error('Error fetching account transactions:', error);
      throw error;
    }
  }

  /**
   * Get all transactions across multiple accounts
   */
  static async getAllTransactions(accountIds: string[], useMock: boolean = false): Promise<{
    transactions: NessieTransaction[];
    parsedData: Partial<FinancialData>;
    source: string;
  }> {
    try {
      const allTransactions: NessieTransaction[] = [];
      let combinedParsedData: Partial<FinancialData> = {
        monthlyIncome: 0,
        monthlyExpenses: {
          housing: 0,
          food: 0,
          transportation: 0,
          entertainment: 0,
          utilities: 0,
          other: 0,
        }
      };
      let source = 'unknown';

      // Fetch transactions from all accounts
      for (const accountId of accountIds) {
        const result = await this.getAccountTransactions(accountId, useMock);
        allTransactions.push(...result.transactions);
        source = result.source;

        // Combine parsed data
        if (result.parsedData.monthlyIncome) {
          combinedParsedData.monthlyIncome! += result.parsedData.monthlyIncome;
        }
        if (result.parsedData.monthlyExpenses) {
          Object.keys(combinedParsedData.monthlyExpenses!).forEach(category => {
            const key = category as keyof typeof combinedParsedData.monthlyExpenses;
            combinedParsedData.monthlyExpenses![key] += result.parsedData.monthlyExpenses?.[key] || 0;
          });
        }
      }

      return {
        transactions: allTransactions,
        parsedData: combinedParsedData,
        source
      };
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      throw error;
    }
  }

  /**
   * Get account balance information
   */
  static async getAccountBalances(accountIds: string[]): Promise<{
    totalBalance: number;
    accountBalances: { [accountId: string]: number };
  }> {
    try {
      const accounts = await Promise.all(
        accountIds.map(async (accountId) => {
          // This would need to be implemented based on Nessie API structure
          // For now, return mock data
          return {
            accountId,
            balance: Math.random() * 10000 // Mock balance
          };
        })
      );

      const accountBalances: { [accountId: string]: number } = {};
      let totalBalance = 0;

      accounts.forEach(account => {
        accountBalances[account.accountId] = account.balance;
        totalBalance += account.balance;
      });

      return {
        totalBalance,
        accountBalances
      };
    } catch (error) {
      console.error('Error fetching account balances:', error);
      throw error;
    }
  }
}
