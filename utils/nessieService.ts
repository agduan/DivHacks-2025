/**
 * Nessie API Service (Capital One)
 * Secure, validated integration with proper error handling
 */

import { apiClient, ApiError } from './apiClient';
import { API_CONFIG, CACHE_CONFIG } from '@/config';
import { monitoring, logger } from './monitoring';
import {
  validateNessieTransaction,
  validateNessieAccount,
  validateNessieCustomer,
  NessieTransactionSchema,
  NessieAccountSchema,
  NessieCustomerSchema,
} from './validation';
import { FinancialData } from '@/types/financial';
import { z } from 'zod';

// ==================== TYPES ====================

export type NessieTransaction = z.infer<typeof NessieTransactionSchema>;
export type NessieAccount = z.infer<typeof NessieAccountSchema>;
export type NessieCustomer = z.infer<typeof NessieCustomerSchema>;

export interface NessieApiResponse<T = any> {
  success: boolean;
  data?: T;
  source: 'api' | 'mock' | 'fallback' | 'cache';
  error?: string;
}

// ==================== CONSTANTS ====================

const SERVICE_NAME = 'Nessie';

// ==================== MOCK DATA ====================

const MOCK_TRANSACTIONS: NessieTransaction[] = [
  {
    _id: 'mock-trans-1',
    merchant_id: 'mock-merchant-1',
    medium: 'balance',
    purchase_date: new Date().toISOString(),
    amount: 150,
    status: 'completed',
    description: 'Grocery Store',
  },
  {
    _id: 'mock-trans-2',
    merchant_id: 'mock-merchant-2',
    medium: 'balance',
    purchase_date: new Date(Date.now() - 86400000).toISOString(),
    amount: 45,
    status: 'completed',
    description: 'Gas Station',
  },
  {
    _id: 'mock-trans-3',
    merchant_id: 'mock-merchant-3',
    medium: 'balance',
    purchase_date: new Date(Date.now() - 172800000).toISOString(),
    amount: 80,
    status: 'completed',
    description: 'Restaurant',
  },
];

// ==================== NESSIE SERVICE ====================

export class NessieService {
  private static isAvailable(): boolean {
    return !!API_CONFIG.nessie.apiKey;
  }

  /**
   * Validate and sanitize customer ID
   */
  private static sanitizeCustomerId(customerId: string): string {
    // Remove any non-alphanumeric characters
    const sanitized = customerId.replace(/[^a-zA-Z0-9-_]/g, '');
    if (sanitized.length === 0) {
      throw new Error('Invalid customer ID format');
    }
    return sanitized;
  }

  /**
   * Validate and sanitize account ID
   */
  private static sanitizeAccountId(accountId: string): string {
    // Remove any non-alphanumeric characters
    const sanitized = accountId.replace(/[^a-zA-Z0-9-_]/g, '');
    if (sanitized.length === 0) {
      throw new Error('Invalid account ID format');
    }
    return sanitized;
  }

  /**
   * Build request URL with API key
   */
  private static buildUrl(path: string): string {
    if (!API_CONFIG.nessie.apiKey) {
      throw new Error('Nessie API key not configured');
    }
    return `${API_CONFIG.nessie.baseUrl}${path}?key=${API_CONFIG.nessie.apiKey}`;
  }

  /**
   * Fetch customer information from Nessie API
   */
  static async getCustomerInfo(customerId: string): Promise<NessieApiResponse<NessieCustomer>> {
    try {
      const sanitizedId = this.sanitizeCustomerId(customerId);
      logger.info(SERVICE_NAME, `Fetching customer info for ${sanitizedId}`);

      if (!this.isAvailable()) {
        logger.warn(SERVICE_NAME, 'API key not configured, cannot fetch customer');
        return {
          success: false,
          source: 'fallback',
          error: 'Nessie API key not configured',
        };
      }

      const startTime = Date.now();
      const url = this.buildUrl(`/customers/${sanitizedId}`);

      const response = await apiClient.request<NessieCustomer>({
        url,
        method: 'GET',
        timeout: API_CONFIG.nessie.timeout,
        retries: API_CONFIG.nessie.retries,
        cache: true,
        cacheTTL: CACHE_CONFIG.nessieAccounts,
      });

      // Validate response
      const customer = validateNessieCustomer(response.data);

      // Track metrics
      monitoring.trackAPICall({
        service: SERVICE_NAME,
        endpoint: '/customers/:id',
        method: 'GET',
        duration: Date.now() - startTime,
        status: response.status,
        success: true,
        cached: response.source === 'cache',
      });

      return {
        success: true,
        data: customer,
        source: response.source === 'cache' ? 'cache' : 'api',
      };
    } catch (error) {
      logger.error(SERVICE_NAME, 'Failed to fetch customer info', error as Error, {
        customerId,
      });

      return {
        success: false,
        source: 'fallback',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Fetch customer accounts from Nessie API
   */
  static async getCustomerAccounts(
    customerId: string
  ): Promise<NessieApiResponse<NessieAccount[]>> {
    try {
      const sanitizedId = this.sanitizeCustomerId(customerId);
      logger.info(SERVICE_NAME, `Fetching accounts for customer ${sanitizedId}`);

      if (!this.isAvailable()) {
        logger.warn(SERVICE_NAME, 'API key not configured, cannot fetch accounts');
        return {
          success: false,
          source: 'fallback',
          error: 'Nessie API key not configured',
        };
      }

      const startTime = Date.now();
      const url = this.buildUrl(`/customers/${sanitizedId}/accounts`);

      const response = await apiClient.request<NessieAccount[]>({
        url,
        method: 'GET',
        timeout: API_CONFIG.nessie.timeout,
        retries: API_CONFIG.nessie.retries,
        cache: true,
        cacheTTL: CACHE_CONFIG.nessieAccounts,
      });

      // Validate each account
      const accounts = Array.isArray(response.data)
        ? response.data.map((account) => validateNessieAccount(account))
        : [];

      // Track metrics
      monitoring.trackAPICall({
        service: SERVICE_NAME,
        endpoint: '/customers/:id/accounts',
        method: 'GET',
        duration: Date.now() - startTime,
        status: response.status,
        success: true,
        cached: response.source === 'cache',
      });

      return {
        success: true,
        data: accounts,
        source: response.source === 'cache' ? 'cache' : 'api',
      };
    } catch (error) {
      logger.error(SERVICE_NAME, 'Failed to fetch customer accounts', error as Error, {
        customerId,
      });

      return {
        success: false,
        source: 'fallback',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Fetch transactions for a specific account from Nessie API
   */
  static async getAccountTransactions(
    accountId: string,
    useMock: boolean = false
  ): Promise<
    NessieApiResponse<{ transactions: NessieTransaction[]; parsedData?: FinancialData }>
  > {
    try {
      // If mock requested or API not available, return mock data
      if (useMock || !this.isAvailable()) {
        if (!this.isAvailable()) {
          logger.warn(SERVICE_NAME, 'API key not configured, using mock data');
        } else {
          logger.info(SERVICE_NAME, 'Using mock data (requested)');
        }

        const parsedData = this.parseNessieData(MOCK_TRANSACTIONS);

        return {
          success: true,
          data: {
            transactions: MOCK_TRANSACTIONS,
            parsedData,
          },
          source: 'mock',
        };
      }

      const sanitizedId = this.sanitizeAccountId(accountId);
      logger.info(SERVICE_NAME, `Fetching transactions for account ${sanitizedId}`);

      const startTime = Date.now();
      const url = this.buildUrl(`/accounts/${sanitizedId}/purchases`);

      const response = await apiClient.request<NessieTransaction[]>({
        url,
        method: 'GET',
        timeout: API_CONFIG.nessie.timeout,
        retries: API_CONFIG.nessie.retries,
        cache: true,
        cacheTTL: CACHE_CONFIG.nessieTransactions,
      });

      // Validate each transaction
      const transactions = Array.isArray(response.data)
        ? response.data.map((transaction) => validateNessieTransaction(transaction))
        : [];

      // Parse transactions into financial data
      const parsedData = this.parseNessieData(transactions);

      // Track metrics
      monitoring.trackAPICall({
        service: SERVICE_NAME,
        endpoint: '/accounts/:id/purchases',
        method: 'GET',
        duration: Date.now() - startTime,
        status: response.status,
        success: true,
        cached: response.source === 'cache',
      });

      return {
        success: true,
        data: {
          transactions,
          parsedData,
        },
        source: response.source === 'cache' ? 'cache' : 'api',
      };
    } catch (error) {
      logger.error(SERVICE_NAME, 'Failed to fetch transactions, falling back to mock', error as Error, {
        accountId,
      });

      // Fallback to mock data on error
      const parsedData = this.parseNessieData(MOCK_TRANSACTIONS);

      return {
        success: true,
        data: {
          transactions: MOCK_TRANSACTIONS,
          parsedData,
        },
        source: 'fallback',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Parse Nessie transactions into FinancialData format
   */
  static parseNessieData(transactions: NessieTransaction[]): FinancialData {
    // Calculate monthly expenses from transactions
    const monthlyExpenses = transactions.reduce(
      (acc, transaction) => {
        const amount = transaction.amount;
        const description = transaction.description?.toLowerCase() || '';

        // Categorize based on description
        if (description.includes('rent') || description.includes('mortgage')) {
          acc.housing += amount;
        } else if (
          description.includes('grocery') ||
          description.includes('food') ||
          description.includes('restaurant')
        ) {
          acc.food += amount;
        } else if (
          description.includes('gas') ||
          description.includes('uber') ||
          description.includes('lyft')
        ) {
          acc.transportation += amount;
        } else if (
          description.includes('movie') ||
          description.includes('netflix') ||
          description.includes('spotify')
        ) {
          acc.entertainment += amount;
        } else if (
          description.includes('electric') ||
          description.includes('water') ||
          description.includes('internet')
        ) {
          acc.utilities += amount;
        } else {
          acc.other += amount;
        }

        return acc;
      },
      {
        housing: 0,
        food: 0,
        transportation: 0,
        entertainment: 0,
        utilities: 0,
        other: 0,
      }
    );

    // Estimate monthly income (assume expenses are 70% of income)
    const totalExpenses = Object.values(monthlyExpenses).reduce((a, b) => a + b, 0);
    const estimatedIncome = Math.round(totalExpenses / 0.7);

    return {
      monthlyIncome: estimatedIncome,
      monthlyExpenses,
      currentSavings: 5000, // Default, can't determine from transactions
      currentDebt: 0, // Default, can't determine from transactions
    };
  }
}