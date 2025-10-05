import { FinancialData } from '@/types/financial';

/**
 * Fetch real financial data from Nessie API
 * This will provide actual spending patterns and income data
 */
export async function fetchNessieFinancialData(): Promise<FinancialData | null> {
  try {
    // Fetch from Nessie API
    const response = await fetch('/api/nessie', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Nessie API not available, using mock data');
      return null;
    }

    const data = await response.json();
    
    // Transform Nessie data to our FinancialData format
    if (data.accounts && data.purchases) {
      return transformNessieData(data);
    }
    
    return null;
  } catch (error) {
    console.warn('Error fetching Nessie data:', error);
    return null;
  }
}

/**
 * Transform Nessie API data to our FinancialData format
 */
function transformNessieData(nessieData: any): FinancialData {
  const accounts = nessieData.accounts || [];
  const purchases = nessieData.purchases || [];
  
  // Calculate current savings from accounts
  const currentSavings = accounts.reduce((total: number, account: any) => {
    return total + (account.balance || 0);
  }, 0);
  
  // Calculate current debt from accounts
  const currentDebt = accounts.reduce((total: number, account: any) => {
    if (account.type === 'Credit Card' || account.type === 'Loan') {
      return total + Math.abs(account.balance || 0);
    }
    return total;
  }, 0);
  
  // Calculate monthly income from deposits
  const deposits = nessieData.deposits || [];
  const monthlyIncome = deposits.reduce((total: number, deposit: any) => {
    return total + (deposit.amount || 0);
  }, 0) / 12; // Average monthly income
  
  // Calculate monthly expenses from purchases
  const monthlyExpenses = {
    housing: 0,
    food: 0,
    transportation: 0,
    entertainment: 0,
    utilities: 0,
    other: 0,
  };
  
  purchases.forEach((purchase: any) => {
    const amount = purchase.amount || 0;
    const merchant = purchase.merchant || '';
    
    // Categorize expenses based on merchant
    if (merchant.toLowerCase().includes('rent') || merchant.toLowerCase().includes('mortgage')) {
      monthlyExpenses.housing += amount;
    } else if (merchant.toLowerCase().includes('grocery') || merchant.toLowerCase().includes('food')) {
      monthlyExpenses.food += amount;
    } else if (merchant.toLowerCase().includes('gas') || merchant.toLowerCase().includes('car')) {
      monthlyExpenses.transportation += amount;
    } else if (merchant.toLowerCase().includes('movie') || merchant.toLowerCase().includes('entertainment')) {
      monthlyExpenses.entertainment += amount;
    } else if (merchant.toLowerCase().includes('electric') || merchant.toLowerCase().includes('water')) {
      monthlyExpenses.utilities += amount;
    } else {
      monthlyExpenses.other += amount;
    }
  });
  
  // Average monthly expenses
  Object.keys(monthlyExpenses).forEach(key => {
    monthlyExpenses[key as keyof typeof monthlyExpenses] /= 12;
  });
  
  return {
    monthlyIncome,
    monthlyExpenses,
    currentSavings,
    currentDebt,
  };
}

/**
 * Get real market data for realistic model
 * This could be enhanced to fetch actual S&P 500 data
 */
export async function fetchMarketData(): Promise<{ sp500Return: number; volatility: number; recession: boolean } | null> {
  try {
    // For now, return simulated data
    // In a real implementation, you'd fetch from a financial API like Alpha Vantage
    return {
      sp500Return: 0.08, // 8% annual return
      volatility: 0.15, // 15% annual volatility
      recession: false,
    };
  } catch (error) {
    console.warn('Error fetching market data:', error);
    return null;
  }
}

/**
 * Get real interest rates for debt calculations
 */
export async function fetchInterestRates(): Promise<{ savingsRate: number; debtRate: number } | null> {
  try {
    // For now, return realistic rates
    // In a real implementation, you'd fetch from a financial API
    return {
      savingsRate: 0.02, // 2% annual savings rate
      debtRate: 0.05, // 5% annual debt rate
    };
  } catch (error) {
    console.warn('Error fetching interest rates:', error);
    return null;
  }
}
