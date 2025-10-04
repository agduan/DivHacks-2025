'use client';

import { useState } from 'react';
import { FinancialData } from '@/types/financial';

interface FinancialInputFormProps {
  initialData: FinancialData;
  onDataChange: (data: FinancialData) => void;
}

export default function FinancialInputForm({ initialData, onDataChange }: FinancialInputFormProps) {
  const [data, setData] = useState<FinancialData>(initialData);

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

  return (
    <div className="bg-retro-gray p-6 rounded-lg border-2 border-neon-purple/50 space-y-6">
      <h2 className="text-2xl font-bold text-neon-purple uppercase tracking-wider">
        Financial Input
      </h2>

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
        />
      </div>
    </div>
  );
}

