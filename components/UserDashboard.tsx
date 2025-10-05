'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import DeleteAccountModal from './DeleteAccountModal';

export default function UserDashboard() {
  const { user, billingInfo, signOut, refreshBilling } = useAuth();
  const [showBilling, setShowBilling] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (user) {
      refreshBilling();
    }
  }, [user, refreshBilling]);

  if (!user) return null;

  return (
    <div className="bg-retro-gray p-6 rounded-lg border-2 border-neon-purple/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-neon-green rounded-full flex items-center justify-center text-black font-bold text-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-neon-purple uppercase tracking-wide">
              Welcome, {user.name}
            </h2>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowBilling(!showBilling)}
            className="bg-neon-blue text-white px-4 py-2 rounded font-bold text-sm uppercase tracking-wide transition-all"
          >
            {showBilling ? 'Hide' : 'Show'} Billing
          </button>
          <button
            onClick={signOut}
            className="bg-gray-500 text-white px-4 py-2 rounded font-bold text-sm uppercase tracking-wide transition-all"
          >
            Sign Out
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-500 text-white px-4 py-2 rounded font-bold text-sm uppercase tracking-wide transition-all hover:bg-red-600"
          >
            Delete Account
          </button>
        </div>
      </div>

      {showBilling && billingInfo && (
        <div className="bg-retro-darker p-4 rounded border border-neon-blue/30">
          <h3 className="text-lg font-bold text-neon-blue uppercase tracking-wide mb-4">
            Billing Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Account Balance:</span>
                <span className="text-neon-green font-bold">
                  ${billingInfo.balance.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Credits Used:</span>
                <span className="text-yellow-400 font-bold">
                  ${billingInfo.creditsUsed.toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Spent:</span>
                <span className="text-red-400 font-bold">
                  ${billingInfo.totalSpent.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Transaction:</span>
                <span className="text-gray-300 text-sm">
                  {new Date(billingInfo.lastTransaction).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-neon-blue/10 rounded border border-neon-blue/30">
            <p className="text-sm text-neon-blue">
              💡 <strong>AI Predictions:</strong> Each AI prediction costs $0.10. 
              Your balance will be automatically deducted when you generate predictions.
            </p>
          </div>
        </div>
      )}

      {user.customerId && (
        <div className="mt-4 p-4 bg-retro-darker rounded border border-neon-green/30">
          <h3 className="text-lg font-bold text-neon-green uppercase tracking-wide mb-2">
            Financial Data Integration
          </h3>
          <p className="text-sm text-gray-400 mb-2">
            Your account is linked to Nessie customer ID: <span className="text-neon-green font-mono">{user.customerId}</span>
          </p>
          <p className="text-xs text-gray-500">
            This allows you to load your real financial data from the Nessie API for personalized predictions.
          </p>
        </div>
      )}

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
