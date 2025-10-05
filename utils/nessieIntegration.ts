/**
 * Complete Nessie API Integration
 * Fetches real data from Capital One's Nessie API
 * Documentation: http://api.nessieisreal.com/documentation
 */

import { FinancialData } from '@/types/financial';
import { logger } from './monitoring';

const SERVICE_NAME = 'NessieIntegration';
const BASE_URL = 'http://api.nessieisreal.com';

// ==================== TYPES ====================

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

export interface NessieAccount {
  _id: string;
  type: 'Checking' | 'Savings' | 'Credit Card';
  nickname: string;
  rewards: number;
  balance: number;
  account_number: string;
  customer_id: string;
}

export interface NessiePurchase {
  _id: string;
  type: 'merchant_purchase' | string;
  transaction_date: string;
  status: 'completed' | 'pending' | 'cancelled';
  medium: 'balance' | 'rewards';
  payer_id: string;
  merchant_id: string;
  amount: number;
  description?: string;
}

export interface NessieMerchant {
  _id: string;
  name: string;
  category: string[];
  address?: {
    street_number: string;
    street_name: string;
    city: string;
    state: string;
    zip: string;
  };
  geocode?: {
    lat: number;
    lng: number;
  };
}

export interface NessieDeposit {
  _id: string;
  type: 'deposit';
  transaction_date: string;
  status: 'completed' | 'pending' | 'cancelled';
  medium: 'balance' | 'rewards';
  amount: number;
  description?: string;
}

// ==================== API CLIENT ====================

export class NessieAPIClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}key=${this.apiKey}`;
    
    logger.info(SERVICE_NAME, `Fetching from Nessie: ${endpoint}`);

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Nessie API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error(SERVICE_NAME, `Failed to fetch ${endpoint}`, error as Error);
      throw error;
    }
  }

  /**
   * Get all customers (for finding your customer ID)
   */
  async getAllCustomers(): Promise<NessieCustomer[]> {
    return this.makeRequest<NessieCustomer[]>('/customers');
  }

  /**
   * Get a specific customer by ID
   */
  async getCustomer(customerId: string): Promise<NessieCustomer> {
    return this.makeRequest<NessieCustomer>(`/customers/${customerId}`);
  }

  /**
   * Get all accounts for a customer
   */
  async getCustomerAccounts(customerId: string): Promise<NessieAccount[]> {
    return this.makeRequest<NessieAccount[]>(`/customers/${customerId}/accounts`);
  }

  /**
   * Get a specific account
   */
  async getAccount(accountId: string): Promise<NessieAccount> {
    return this.makeRequest<NessieAccount>(`/accounts/${accountId}`);
  }

  /**
   * Get all purchases for an account
   */
  async getAccountPurchases(accountId: string): Promise<NessiePurchase[]> {
    return this.makeRequest<NessiePurchase[]>(`/accounts/${accountId}/purchases`);
  }

  /**
   * Get all deposits for an account
   */
  async getAccountDeposits(accountId: string): Promise<NessieDeposit[]> {
    return this.makeRequest<NessieDeposit[]>(`/accounts/${accountId}/deposits`);
  }

  /**
   * Get merchant info
   */
  async getMerchant(merchantId: string): Promise<NessieMerchant> {
    return this.makeRequest<NessieMerchant>(`/merchants/${merchantId}`);
  }

  /**
   * Get all merchants
   */
  async getAllMerchants(): Promise<NessieMerchant[]> {
    return this.makeRequest<NessieMerchant[]>('/merchants');
  }
}

// ==================== DATA PARSING ====================

/**
 * Parse Nessie data into FinancialData format
 */
export async function parseNessieToFinancialData(
  accounts: NessieAccount[],
  purchases: NessiePurchase[],
  deposits: NessieDeposit[],
  merchants: Map<string, NessieMerchant>
): Promise<FinancialData> {
  
  // Calculate total balance across all accounts
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  // Separate checking/savings from credit cards
  const bankAccounts = accounts.filter(acc => acc.type !== 'Credit Card');
  const creditCards = accounts.filter(acc => acc.type === 'Credit Card');
  
  const currentSavings = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const currentDebt = creditCards.reduce((sum, acc) => Math.abs(acc.balance), 0);

  // Calculate monthly income from deposits
  const recentDeposits = deposits
    .filter(d => d.status === 'completed')
    .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
    .slice(0, 30); // Last 30 deposits

  const totalDeposits = recentDeposits.reduce((sum, d) => sum + d.amount, 0);
  const monthlyIncome = totalDeposits; // Estimate monthly income from recent deposits

  // Categorize purchases into expense categories
  const monthlyExpenses = {
    housing: 0,
    food: 0,
    transportation: 0,
    entertainment: 0,
    utilities: 0,
    other: 0,
  };

  // Get recent purchases (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentPurchases = purchases.filter(p => {
    const purchaseDate = new Date(p.transaction_date);
    return purchaseDate >= thirtyDaysAgo && p.status === 'completed';
  });

  // Categorize each purchase
  for (const purchase of recentPurchases) {
    const merchant = merchants.get(purchase.merchant_id);
    const category = categorizePurchase(purchase, merchant);
    monthlyExpenses[category] += purchase.amount;
  }

  logger.info(SERVICE_NAME, 'Parsed Nessie data', {
    accountCount: accounts.length,
    purchaseCount: recentPurchases.length,
    monthlyIncome,
    totalExpenses: Object.values(monthlyExpenses).reduce((a, b) => a + b, 0),
  });

  return {
    monthlyIncome,
    monthlyExpenses,
    currentSavings,
    currentDebt,
  };
}

/**
 * Categorize a purchase based on merchant info and description
 */
function categorizePurchase(
  purchase: NessiePurchase,
  merchant?: NessieMerchant
): keyof FinancialData['monthlyExpenses'] {
  
  const description = purchase.description?.toLowerCase() || '';
  const merchantName = merchant?.name?.toLowerCase() || '';
  const categories = merchant?.category || [];

  // Check merchant categories
  for (const cat of categories) {
    const catLower = cat.toLowerCase();
    
    if (catLower.includes('food') || catLower.includes('restaurant') || 
        catLower.includes('grocery') || catLower.includes('cafe')) {
      return 'food';
    }
    
    if (catLower.includes('gas') || catLower.includes('transport') || 
        catLower.includes('auto') || catLower.includes('uber') || 
        catLower.includes('lyft')) {
      return 'transportation';
    }
    
    if (catLower.includes('entertainment') || catLower.includes('movie') || 
        catLower.includes('game') || catLower.includes('music')) {
      return 'entertainment';
    }
    
    if (catLower.includes('utility') || catLower.includes('electric') || 
        catLower.includes('water') || catLower.includes('internet')) {
      return 'utilities';
    }
    
    if (catLower.includes('rent') || catLower.includes('mortgage') || 
        catLower.includes('housing')) {
      return 'housing';
    }
  }

  // Check description and merchant name
  const combined = `${description} ${merchantName}`;
  
  if (combined.includes('grocery') || combined.includes('food') || 
      combined.includes('restaurant') || combined.includes('cafe')) {
    return 'food';
  }
  
  if (combined.includes('gas') || combined.includes('fuel') || 
      combined.includes('uber') || combined.includes('lyft') || 
      combined.includes('transit')) {
    return 'transportation';
  }
  
  if (combined.includes('netflix') || combined.includes('spotify') || 
      combined.includes('movie') || combined.includes('entertainment')) {
    return 'entertainment';
  }
  
  if (combined.includes('electric') || combined.includes('water') || 
      combined.includes('internet') || combined.includes('utility')) {
    return 'utilities';
  }
  
  if (combined.includes('rent') || combined.includes('mortgage') || 
      combined.includes('housing')) {
    return 'housing';
  }

  return 'other';
}

// ==================== CONVENIENCE FUNCTIONS ====================

/**
 * Get complete financial picture for a customer
 */
export async function getCustomerFinancialData(
  apiKey: string,
  customerId: string
): Promise<{
  customer: NessieCustomer;
  accounts: NessieAccount[];
  financialData: FinancialData;
}> {
  const client = new NessieAPIClient(apiKey);

  logger.info(SERVICE_NAME, `Fetching complete data for customer ${customerId}`);

  // Fetch customer info
  const customer = await client.getCustomer(customerId);

  // Fetch all accounts
  const accounts = await client.getCustomerAccounts(customerId);

  if (accounts.length === 0) {
    throw new Error('No accounts found for this customer');
  }

  // Fetch purchases and deposits for all accounts
  const allPurchases: NessiePurchase[] = [];
  const allDeposits: NessieDeposit[] = [];

  for (const account of accounts) {
    try {
      const purchases = await client.getAccountPurchases(account._id);
      allPurchases.push(...purchases);

      const deposits = await client.getAccountDeposits(account._id);
      allDeposits.push(...deposits);
    } catch (error) {
      logger.warn(SERVICE_NAME, `Failed to fetch transactions for account ${account._id}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Fetch merchant info for purchases
  const merchantIds = new Set(allPurchases.map(p => p.merchant_id));
  const merchantMap = new Map<string, NessieMerchant>();

  // Convert Set to Array to avoid iterator issues
  for (const merchantId of Array.from(merchantIds)) {
    try {
      const merchant = await client.getMerchant(merchantId);
      merchantMap.set(merchantId, merchant);
    } catch (error) {
      logger.warn(SERVICE_NAME, `Failed to fetch merchant ${merchantId}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Parse into FinancialData format
  const financialData = await parseNessieToFinancialData(
    accounts,
    allPurchases,
    allDeposits,
    merchantMap
  );

  logger.info(SERVICE_NAME, 'Successfully retrieved and parsed customer data', {
    customerName: `${customer.first_name} ${customer.last_name}`,
    accountCount: accounts.length,
    purchaseCount: allPurchases.length,
    depositCount: allDeposits.length,
  });

  return {
    customer,
    accounts,
    financialData,
  };
}

/**
 * Discover your customer ID (useful for first-time setup)
 */
export async function discoverYourCustomerId(apiKey: string): Promise<{
  customers: NessieCustomer[];
  suggestion?: string;
}> {
  const client = new NessieAPIClient(apiKey);
  
  try {
    const customers = await client.getAllCustomers();
    
    logger.info(SERVICE_NAME, `Found ${customers.length} customers in the system`);
    
    // If there's only one customer, that's probably you
    const suggestion = customers.length === 1 ? customers[0]._id : undefined;
    
    return {
      customers,
      suggestion,
    };
  } catch (error) {
    logger.error(SERVICE_NAME, 'Failed to discover customers', error as Error);
    throw error;
  }
}
