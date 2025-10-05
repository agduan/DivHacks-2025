'use client';

import { useState, useEffect } from 'react';
import { NessieAccount, NessieTransaction } from '@/utils/nessieService';

const NessieIntegration = () => {
  const [customerId, setCustomerId] = useState('');
  const [accounts, setAccounts] = useState<NessieAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<NessieTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    if (!customerId) {
      setError('Please enter a Customer ID.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/nessie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch accounts.');
      }
      setAccounts(data.accounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (accountId: string) => {
    setSelectedAccountId(accountId);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/nessie?accountId=${accountId}`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch transactions.');
      }
      setTransactions(data.transactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-retro-gray p-6 rounded-lg border-2 border-neon-purple/50">
      <h2 className="text-2xl font-bold text-neon-purple uppercase tracking-wider mb-4 font-vcr">
        Nessie Integration
      </h2>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          placeholder="Enter Nessie Customer ID"
          className="flex-grow bg-retro-dark text-white px-4 py-2 rounded border border-neon-blue/50 focus:outline-none focus:ring-2 focus:ring-neon-blue"
        />
        <button
          onClick={fetchAccounts}
          disabled={loading}
          className="bg-neon-blue text-white px-6 py-2 rounded font-bold uppercase tracking-wide transition-all hover:bg-neon-blue/80 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get Accounts'}
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {accounts.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xl font-bold text-neon-green mb-2">Accounts</h3>
          <ul className="space-y-2">
            {accounts.map((account) => (
              <li key={account._id} className="flex justify-between items-center bg-retro-dark p-3 rounded">
                <div>
                  <p className="font-bold">{account.nickname} ({account.type})</p>
                  <p className="text-sm text-gray-400">Balance: ${account.balance.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => fetchTransactions(account._id)}
                  className="bg-neon-green text-black px-4 py-1 rounded font-bold text-sm uppercase"
                >
                  View Transactions
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedAccountId && (
        <div>
          <h3 className="text-xl font-bold text-neon-green mb-2">Transactions for {selectedAccountId}</h3>
          {transactions.length > 0 ? (
            <ul className="space-y-2">
              {transactions.map((t) => (
                <li key={t._id} className="bg-retro-dark p-3 rounded">
                  <p>{t.description} - <span className="font-bold">${t.amount}</span> on {t.purchase_date}</p>
                  <p className="text-sm text-gray-400">Status: {t.status}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No transactions found for this account.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default NessieIntegration;
