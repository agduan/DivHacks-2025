/**
 * Nessie Setup Page
 * Discover your customer ID and import real financial data
 */

'use client';

import { useState, useEffect } from 'react';

interface Customer {
  id: string;
  name: string;
  city: string;
  state: string;
}

interface Account {
  id: string;
  type: string;
  nickname: string;
  balance: number;
}

interface DiscoveryData {
  success: boolean;
  totalCustomers: number;
  customers: Customer[];
  suggestedCustomerId?: string;
  suggestedAccounts?: Account[];
  instructions: {
    step1: string;
    step2: string;
    step3: string;
  };
}

interface FinancialDataResponse {
  success: boolean;
  customer: {
    id: string;
    name: string;
    address: {
      street_number: string;
      street_name: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  accounts: Array<{
    id: string;
    type: string;
    nickname: string;
    balance: number;
    rewards: number;
  }>;
  financialData: {
    monthlyIncome: number;
    monthlyExpenses: {
      housing: number;
      food: number;
      transportation: number;
      entertainment: number;
      utilities: number;
      other: number;
    };
    currentSavings: number;
    currentDebt: number;
  };
  source: string;
}

export default function NessieSetupPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DiscoveryData | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [loadingFinancialData, setLoadingFinancialData] = useState(false);
  const [financialData, setFinancialData] = useState<FinancialDataResponse | null>(null);

  // Discover data on mount
  useEffect(() => {
    discoverData();
  }, []);

  const discoverData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/nessie/discover');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to discover Nessie data');
      }

      setData(result);
      if (result.suggestedCustomerId) {
        setSelectedCustomerId(result.suggestedCustomerId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerData = async () => {
    if (!selectedCustomerId) {
      alert('Please select a customer ID first');
      return;
    }

    setLoadingFinancialData(true);
    setError(null);

    try {
      const response = await fetch('/api/nessie/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: selectedCustomerId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load customer data');
      }

      setFinancialData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoadingFinancialData(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neon-pink mb-2 font-vcr uppercase tracking-wider">
            🏦 Nessie API Setup
          </h1>
          <p className="text-gray-400">
            Import your real financial data from Capital One's Nessie API
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-retro-gray p-6 rounded-lg border-2 border-neon-blue/50 text-center">
            <div className="text-neon-blue text-xl mb-2">🔍 Discovering your data...</div>
            <div className="text-gray-400">Please wait...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-retro-gray p-6 rounded-lg border-2 border-neon-pink/50 mb-6">
            <div className="text-neon-pink text-xl mb-2">❌ Error</div>
            <div className="text-white mb-4">{error}</div>
            <button
              onClick={discoverData}
              className="bg-neon-blue hover:bg-neon-blue/80 text-[#0a0a0f] font-bold py-2 px-4 rounded transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Discovery Results */}
        {!loading && data && (
          <>
            {/* Instructions */}
            <div className="bg-retro-gray p-6 rounded-lg border-2 border-neon-green/50 mb-6">
              <h2 className="text-2xl font-bold text-neon-green mb-4 font-vcr uppercase">
                📋 Setup Instructions
              </h2>
              <ol className="space-y-2 text-gray-300">
                <li>
                  <strong className="text-neon-green">1.</strong> {data.instructions.step1}
                </li>
                <li>
                  <strong className="text-neon-green">2.</strong> {data.instructions.step2}
                </li>
                <li>
                  <strong className="text-neon-green">3.</strong> {data.instructions.step3}
                </li>
              </ol>
            </div>

            {/* Customers List */}
            <div className="bg-retro-gray p-6 rounded-lg border-2 border-neon-purple/50 mb-6">
              <h2 className="text-2xl font-bold text-neon-purple mb-4 font-vcr uppercase">
                👥 Available Customers ({data.totalCustomers})
              </h2>

              <div className="space-y-3">
                {data.customers.map((customer) => (
                  <div
                    key={customer.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedCustomerId === customer.id
                        ? 'border-neon-blue bg-neon-blue/10'
                        : 'border-gray-600 hover:border-neon-blue/50'
                    }`}
                    onClick={() => setSelectedCustomerId(customer.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold text-white">{customer.name}</div>
                        <div className="text-sm text-gray-400">
                          {customer.city}, {customer.state}
                        </div>
                        <div className="text-xs text-neon-blue mt-1 font-mono">
                          ID: {customer.id}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(customer.id);
                          }}
                          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          📋 Copy ID
                        </button>
                        {selectedCustomerId === customer.id && (
                          <span className="bg-neon-blue text-black px-3 py-1 rounded text-sm font-bold">
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Accounts (if available) */}
            {data.suggestedAccounts && data.suggestedAccounts.length > 0 && (
              <div className="bg-retro-gray p-6 rounded-lg border-2 border-neon-green/50 mb-6">
                <h2 className="text-2xl font-bold text-neon-green mb-4 font-vcr uppercase">
                  💳 Your Accounts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.suggestedAccounts.map((account) => (
                    <div key={account.id} className="bg-retro-darker p-4 rounded-lg border border-neon-green/30">
                      <div className="text-white font-bold mb-1">{account.nickname}</div>
                      <div className="text-sm text-gray-400 mb-2">{account.type}</div>
                      <div className="text-lg text-neon-green font-bold">
                        ${account.balance.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Load Data Button */}
            <div className="bg-retro-gray p-6 rounded-lg border-2 border-neon-pink/50 mb-6">
              <h2 className="text-2xl font-bold text-neon-pink mb-4 font-vcr uppercase">
                🚀 Import Your Data
              </h2>
              <p className="text-gray-300 mb-4">
                Click below to import your complete financial data from Nessie. This will fetch
                your accounts, transactions, and calculate your monthly income and expenses.
              </p>
              <button
                onClick={loadCustomerData}
                disabled={!selectedCustomerId || loadingFinancialData}
                className="bg-neon-pink hover:bg-neon-pink/80 text-[#0a0a0f] font-bold py-3 px-6 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full text-lg"
              >
                {loadingFinancialData ? '⏳ Loading...' : '📥 Import Financial Data'}
              </button>
            </div>

            {/* Financial Data Display */}
            {financialData && (
              <div className="bg-retro-gray p-6 rounded-lg border-2 border-neon-green/50">
                <h2 className="text-2xl font-bold text-neon-green mb-4 font-vcr uppercase">
                  ✅ Data Imported Successfully!
                </h2>

                <div className="space-y-4">
                  {/* Customer Info */}
                  <div className="bg-retro-darker p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-neon-blue mb-2">Customer</h3>
                    <div className="text-white">{financialData.customer.name}</div>
                    <div className="text-sm text-gray-400">
                      {financialData.customer.address.city}, {financialData.customer.address.state}
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-retro-darker p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-neon-purple mb-2">Financial Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-400">Monthly Income</div>
                        <div className="text-xl text-neon-green font-bold">
                          ${financialData.financialData.monthlyIncome.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Monthly Expenses</div>
                        <div className="text-xl text-neon-pink font-bold">
                          $
                          {Object.values(financialData.financialData.monthlyExpenses)
                            .reduce((a: number, b: number) => a + b, 0)
                            .toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Current Savings</div>
                        <div className="text-xl text-neon-blue font-bold">
                          ${financialData.financialData.currentSavings.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Current Debt</div>
                        <div className="text-xl text-neon-pink font-bold">
                          ${financialData.financialData.currentDebt.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expense Breakdown */}
                  <div className="bg-retro-darker p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-neon-pink mb-2">Expense Breakdown</h3>
                    <div className="space-y-2">
                      {Object.entries(financialData.financialData.monthlyExpenses).map(
                        ([category, amount]: [string, any]) => (
                          <div key={category} className="flex justify-between items-center">
                            <span className="text-gray-300 capitalize">{category}</span>
                            <span className="text-white font-bold">${amount.toFixed(2)}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="bg-neon-green/10 border border-neon-green p-4 rounded-lg">
                    <div className="text-neon-green font-bold mb-2">🎉 Next Steps:</div>
                    <div className="text-gray-300">
                      Your data has been imported! Now go back to the main app and your financial
                      data will be automatically loaded. You can start creating what-if scenarios
                      and exploring your financial future!
                    </div>
                    <a
                      href="/"
                      className="inline-block mt-4 bg-neon-green hover:bg-neon-green/80 text-black font-bold py-2 px-6 rounded transition-colors"
                    >
                      🚀 Go to finosaur.ai
                    </a>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-neon-blue hover:text-neon-blue/80 transition-colors underline"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
