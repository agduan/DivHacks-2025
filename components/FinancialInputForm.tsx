'use client';

import { useState } from 'react';
import { FinancialData } from '@/types/financial';
import { NessieService, NessieAccount } from '@/utils/nessieService';

interface FinancialInputFormProps {
  initialData: FinancialData;
  onDataChange: (data: FinancialData) => void;
}

export default function FinancialInputForm({ initialData, onDataChange }: FinancialInputFormProps) {
  const [data, setData] = useState<FinancialData>(initialData);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<NessieAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [customerId, setCustomerId] = useState<string>('');
  const [dataSource, setDataSource] = useState<'manual' | 'nessie'>('manual');
  const [lastLoadedCustomer, setLastLoadedCustomer] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleChange = (field: keyof FinancialData, value: number) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onDataChange(newData);
  };

  const handleExpenseChange = (category: keyof FinancialData['monthlyExpenses'], value: number) => {
    const newData = {
      ...data,
      monthlyExpenses: { ...data.monthlyExpenses, [category]: value },
    };
    setData(newData);
    onDataChange(newData);
  };

  const handleLoadFromNessie = async () => {
    setLoading(true);
    setApiStatus('loading');
    setErrorMessage('');
    
    try {
      if (!customerId.trim()) {
        // Use mock data when no customer ID provided
        setApiStatus('loading');
        const result = await NessieService.getAccountTransactions('mock', true);
        
        if (result.parsedData) {
          const newData = {
            ...data,
            ...result.parsedData,
            // Keep current savings and debt as they might not be in transaction data
            currentSavings: data.currentSavings,
            currentDebt: data.currentDebt,
          };
          setData(newData);
          onDataChange(newData);
          setDataSource('nessie');
          setApiStatus('success');
          setLastLoadedCustomer('Mock Data');
        }
        return;
      }

      // First, get customer accounts
      setApiStatus('loading');
      const customerAccounts = await NessieService.getCustomerAccounts(customerId);
      setAccounts(customerAccounts);
      
      if (customerAccounts.length === 0) {
        setApiStatus('error');
        setErrorMessage('No accounts found for this customer. Please check the customer ID or create accounts in the Nessie sandbox.');
        return;
      }

      setLastLoadedCustomer(customerId);
      setApiStatus('success');

      // If only one account, auto-select it
      if (customerAccounts.length === 1) {
        setSelectedAccount(customerAccounts[0]._id);
        await loadAccountData(customerAccounts[0]._id);
      }
    } catch (error) {
      console.error('Error loading Nessie data:', error);
      setApiStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load data from Nessie API. Please check your customer ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadAccountData = async (accountId: string) => {
    setLoading(true);
    try {
      const result = await NessieService.getAccountTransactions(accountId);
      
      if (result.parsedData) {
        const newData = {
          ...data,
          ...result.parsedData,
          // Keep current savings and debt as they might not be in transaction data
          currentSavings: data.currentSavings,
          currentDebt: data.currentDebt,
        };
        setData(newData);
        onDataChange(newData);
        setDataSource('nessie');
      }
    } catch (error) {
      console.error('Error loading account data:', error);
      alert('Failed to load transaction data. Using mock data instead.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccount(accountId);
    loadAccountData(accountId);
  };

  const handleResetToManual = () => {
    setDataSource('manual');
    setCustomerId('');
    setAccounts([]);
    setSelectedAccount('');
    setLastLoadedCustomer('');
    setApiStatus('idle');
    setErrorMessage('');
    // Reset to initial data
    setData(initialData);
    onDataChange(initialData);
  };

  return (
    <div className="bg-retro-gray p-6 rounded-lg border-2 border-neon-purple/50 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neon-purple uppercase tracking-wider">
          Financial Input
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neon-blue">Data Source:</span>
          <span className={`text-sm font-bold ${dataSource === 'nessie' ? 'text-neon-green' : 'text-neon-purple'}`}>
            {dataSource === 'nessie' ? 'Nessie API' : 'Manual'}
          </span>
          {dataSource === 'nessie' && lastLoadedCustomer && (
            <span className="text-xs text-gray-400">
              ({lastLoadedCustomer === 'Mock Data' ? 'Mock Data' : `Customer: ${lastLoadedCustomer}`})
            </span>
          )}
          {dataSource === 'nessie' && (
            <button
              onClick={handleResetToManual}
              className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded transition-colors"
            >
              Reset to Manual
            </button>
          )}
        </div>
      </div>

      {/* Nessie Integration Section */}
      <div className="bg-retro-darker p-4 rounded-lg border border-neon-blue/30">
        <h3 className="text-lg font-bold text-neon-blue uppercase tracking-wide mb-3">
          Load from Nessie API
        </h3>
        
        <div className="space-y-3">
          <div className="text-xs text-gray-400 mb-3">
            <p>💡 <strong>Note:</strong> The Nessie API provides sample banking data. You can:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Use mock data by leaving the field empty and clicking "Use Mock Data"</li>
              <li>Enter a customer ID to load real sample data from Nessie API</li>
              <li>Create test customers and accounts in the Nessie sandbox environment</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Enter Customer ID (or leave empty for mock data)"
                className="flex-1 bg-retro-gray border border-neon-blue/50 rounded px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none transition-colors"
              />
              <button
                onClick={handleLoadFromNessie}
                disabled={loading}
                className="bg-neon-blue text-white px-4 py-2 rounded font-bold text-sm uppercase tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : customerId.trim() ? 'Load Real Data' : 'Use Mock Data'}
              </button>
            </div>
            
            {/* Status Indicators */}
            {apiStatus === 'loading' && (
              <div className="flex items-center gap-2 text-neon-blue text-sm">
                <span className="animate-spin">⏳</span>
                <span>Connecting to Nessie API...</span>
              </div>
            )}
            
            {apiStatus === 'success' && (
              <div className="flex items-center gap-2 text-neon-green text-sm">
                <span>✅</span>
                <span>Successfully loaded data from Nessie API</span>
              </div>
            )}
            
            {apiStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <span>❌</span>
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {accounts.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm text-neon-green uppercase tracking-wide">
                Select Account ({accounts.length} found)
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => handleAccountSelect(e.target.value)}
                className="w-full bg-retro-gray border border-neon-green/50 rounded px-3 py-2 text-white text-sm focus:border-neon-green focus:outline-none transition-colors"
              >
                <option value="">Choose an account...</option>
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.nickname} ({account.type}) - ${account.balance.toFixed(2)}
                  </option>
                ))}
              </select>
              
              {/* Account Summary */}
              {selectedAccount && (
                <div className="bg-retro-gray/50 p-3 rounded border border-neon-green/30">
                  <div className="text-xs text-neon-green uppercase tracking-wide mb-2">Selected Account Details</div>
                  {(() => {
                    const account = accounts.find(acc => acc._id === selectedAccount);
                    return account ? (
                      <div className="space-y-1 text-sm">
                        <div><strong>Type:</strong> {account.type}</div>
                        <div><strong>Balance:</strong> ${account.balance.toFixed(2)}</div>
                        <div><strong>Rewards:</strong> {account.rewards}</div>
                        <div><strong>Account Number:</strong> {account.account_number}</div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Manual Input Section */}
      <div className={`space-y-6 ${dataSource === 'nessie' ? 'opacity-60' : ''}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-neon-purple uppercase tracking-wide">
            Manual Input
          </h3>
          {dataSource === 'nessie' && (
            <span className="text-xs text-neon-green bg-neon-green/20 px-2 py-1 rounded">
              Data loaded from Nessie API
            </span>
          )}
        </div>

        {/* Income */}
        <div className="space-y-2">
          <label className="block text-sm text-neon-blue uppercase tracking-wide">
            Monthly Income
          </label>
          <input
            type="number"
            value={data.monthlyIncome}
            onChange={(e) => handleChange('monthlyIncome', parseFloat(e.target.value) || 0)}
            className="w-full bg-retro-darker border-2 border-neon-blue/50 rounded px-4 py-2 text-white focus:border-neon-blue focus:outline-none transition-colors"
            disabled={dataSource === 'nessie'}
          />
        </div>

      {/* Expenses */}
      <div className="space-y-3">
        <h3 className="text-sm text-neon-blue uppercase tracking-wide font-bold">
          Monthly Expenses
        </h3>
        
        {Object.entries(data.monthlyExpenses).map(([category, amount]) => (
          <div key={category} className="flex items-center gap-3">
            <label className="w-32 text-sm text-neon-purple capitalize">
              {category}:
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) =>
                handleExpenseChange(
                  category as keyof FinancialData['monthlyExpenses'],
                  parseFloat(e.target.value) || 0
                )
              }
              className="flex-1 bg-retro-darker border border-neon-purple/50 rounded px-3 py-1 text-white text-sm focus:border-neon-purple focus:outline-none transition-colors"
              disabled={dataSource === 'nessie'}
            />
          </div>
        ))}
      </div>

        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm text-neon-green uppercase tracking-wide">
              Current Savings
            </label>
            <input
              type="number"
              value={data.currentSavings}
              onChange={(e) => handleChange('currentSavings', parseFloat(e.target.value) || 0)}
              className="w-full bg-retro-darker border-2 border-neon-green/50 rounded px-4 py-2 text-white focus:border-neon-green focus:outline-none transition-colors"
              disabled={dataSource === 'nessie'}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-neon-pink uppercase tracking-wide">
              Current Debt
            </label>
            <input
              type="number"
              value={data.currentDebt}
              onChange={(e) => handleChange('currentDebt', parseFloat(e.target.value) || 0)}
              className="w-full bg-retro-darker border-2 border-neon-pink/50 rounded px-4 py-2 text-white focus:border-neon-pink focus:outline-none transition-colors"
              disabled={dataSource === 'nessie'}
            />
          </div>
        </div>

        {/* Savings Goal */}
        <div className="space-y-2">
          <label className="block text-sm text-neon-blue uppercase tracking-wide">
            Savings Goal (Optional)
          </label>
          <input
            type="number"
            value={data.savingsGoal || ''}
            onChange={(e) => handleChange('savingsGoal', parseFloat(e.target.value) || 0)}
            className="w-full bg-retro-darker border-2 border-neon-blue/50 rounded px-4 py-2 text-white focus:border-neon-blue focus:outline-none transition-colors"
            placeholder="Enter your goal..."
            disabled={dataSource === 'nessie'}
          />
        </div>
      </div>
    </div>
  );
}

