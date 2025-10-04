'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TimelinePrediction } from '@/types/financial';

interface TimelineChartProps {
  statusQuoData: TimelinePrediction[];
  whatIfData?: TimelinePrediction[];
  onTimeRangeChange?: (months: number) => void;
}

type TimeRange = {
  label: string;
  months: number;
};

const TIME_RANGES: TimeRange[] = [
  { label: '1M', months: 1 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
  { label: '5Y', months: 60 },
  { label: '10Y', months: 120 },
];

export default function TimelineChart({ statusQuoData, whatIfData, onTimeRangeChange }: TimelineChartProps) {
  const [selectedRange, setSelectedRange] = useState<number>(12);

  const handleRangeChange = (months: number) => {
    setSelectedRange(months);
    if (onTimeRangeChange) {
      onTimeRangeChange(months);
    }
  };

  const chartData = statusQuoData.map((sq, index) => ({
    month: sq.month,
    statusQuoNetWorth: sq.netWorth,
    statusQuoSavings: sq.savings,
    whatIfNetWorth: whatIfData?.[index]?.netWorth,
    whatIfSavings: whatIfData?.[index]?.savings,
  }));

  return (
    <div className="bg-retro-gray p-6 rounded-lg border-2 border-neon-blue/30">
      <div className="flex items-center justify-between mb-6">
         <h2 className="text-2xl font-bold text-neon-blue uppercase tracking-wider">
           Timeline Projection
         </h2>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2 bg-retro-darker rounded-lg p-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range.months}
              onClick={() => handleRangeChange(range.months)}
              className={`px-4 py-2 rounded font-bold text-sm uppercase transition-all ${
                selectedRange === range.months
                  ? 'bg-neon-blue text-retro-dark shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                  : 'text-gray-400 hover:text-neon-blue'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1f3a" />
          <XAxis
            dataKey="month"
            stroke="#4a9eff"
            label={{ value: 'Months', position: 'insideBottom', offset: -5, fill: '#4a9eff' }}
          />
          <YAxis
            stroke="#4a9eff"
            label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft', fill: '#4a9eff' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a0e27',
              border: '2px solid #4a9eff',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#4a9eff' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="statusQuoNetWorth"
            stroke="#ff00ff"
            strokeWidth={2}
            name="Current Path (Net Worth)"
            dot={{ fill: '#ff00ff' }}
          />
          {whatIfData && (
            <Line
              type="monotone"
              dataKey="whatIfNetWorth"
              stroke="#00ff41"
              strokeWidth={2}
              name="What-If Path (Net Worth)"
              dot={{ fill: '#00ff41' }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

