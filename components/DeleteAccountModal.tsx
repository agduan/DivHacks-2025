'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { deleteAccount, user } = useAuth();

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await deleteAccount();
      if (success) {
        onClose();
        // User will be automatically signed out
      } else {
        setError('Failed to delete account. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while deleting your account.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-retro-gray p-6 rounded-lg border-2 border-red-500/50 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-red-400 uppercase tracking-wider">
            Delete Account
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-red-500/10 p-4 rounded border border-red-500/30">
            <h3 className="text-lg font-bold text-red-400 mb-2">⚠️ WARNING</h3>
            <p className="text-sm text-gray-300">
              This action is <strong>PERMANENT</strong> and cannot be undone. This will:
            </p>
            <ul className="text-sm text-gray-300 mt-2 space-y-1 list-disc list-inside">
              <li>Delete your account and all personal data</li>
              <li>Remove your billing information</li>
              <li>Wipe your financial predictions history</li>
              <li>Remove your Nessie customer ID</li>
              <li>Clear all stored preferences</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm text-red-400 uppercase tracking-wide mb-2">
              Type "DELETE" to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full bg-retro-darker border border-red-500/50 rounded px-3 py-2 text-white focus:border-red-500 focus:outline-none transition-colors"
              placeholder="Type DELETE here"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={loading || confirmText !== 'DELETE'}
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded font-bold text-sm uppercase tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600"
            >
              {loading ? 'Deleting...' : 'Delete Account'}
            </button>
            
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded font-bold text-sm uppercase tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
