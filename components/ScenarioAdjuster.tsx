'use client';

import { useState } from 'react';
import { ScenarioChange } from '@/types/financial';

interface ScenarioAdjusterProps {
  onChangesUpdate: (changes: ScenarioChange[]) => void;
}

export default function ScenarioAdjuster({ onChangesUpdate }: ScenarioAdjusterProps) {
  const [changes, setChanges] = useState<ScenarioChange[]>([]);

  const addChange = () => {
    const newChanges = [
      ...changes,
      { category: 'food' as const, changePercent: -10 },
    ];
    setChanges(newChanges);
    onChangesUpdate(newChanges);
  };

  const updateChange = (index: number, field: keyof ScenarioChange, value: any) => {
    const newChanges = [...changes];
    newChanges[index] = { ...newChanges[index], [field]: value };
    setChanges(newChanges);
    onChangesUpdate(newChanges);
  };

  const removeChange = (index: number) => {
    const newChanges = changes.filter((_, i) => i !== index);
    setChanges(newChanges);
    onChangesUpdate(newChanges);
  };

  return (
    <div className="bg-retro-gray p-6 rounded-lg border-2 border-neon-green/50 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neon-green uppercase tracking-wider">
          What-If Scenarios
        </h2>
        <button
          onClick={addChange}
          className="bg-neon-green/20 hover:bg-neon-green/30 border-2 border-neon-green text-neon-green px-4 py-2 rounded font-bold uppercase text-sm transition-all hover:scale-105"
        >
          + Add Change
        </button>
      </div>

      {changes.length === 0 && (
        <p className="text-gray-400 text-center py-8 italic">
          Add changes to see your alternative financial future
        </p>
      )}

      <div className="space-y-3">
        {changes.map((change, index) => (
          <div
            key={index}
            className="bg-retro-darker p-4 rounded border border-neon-green/30 space-y-3"
          >
            <div className="flex gap-3 items-center">
              <select
                value={change.category}
                onChange={(e) => updateChange(index, 'category', e.target.value)}
                className="flex-1 bg-retro-gray border border-neon-green/50 rounded px-3 py-2 text-white focus:border-neon-green focus:outline-none"
              >
                <option value="food">Food</option>
                <option value="housing">Housing</option>
                <option value="transportation">Transportation</option>
                <option value="entertainment">Entertainment</option>
                <option value="utilities">Utilities</option>
                <option value="other">Other</option>
                <option value="income">Income</option>
              </select>

              <input
                type="number"
                value={change.changePercent || change.changeAmount || 0}
                onChange={(e) =>
                  updateChange(index, 'changePercent', parseFloat(e.target.value) || 0)
                }
                className="w-24 bg-retro-gray border border-neon-green/50 rounded px-3 py-2 text-white focus:border-neon-green focus:outline-none"
                placeholder="-10"
              />
              <span className="text-gray-400">%</span>

              <button
                onClick={() => removeChange(index)}
                className="text-neon-pink hover:text-neon-pink/70 font-bold text-xl transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-400">
              {change.changePercent && change.changePercent > 0
                ? `Increase ${change.category} by ${change.changePercent}%`
                : change.changePercent && change.changePercent < 0
                ? `Reduce ${change.category} by ${Math.abs(change.changePercent)}%`
                : 'No change'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

