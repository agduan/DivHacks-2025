'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TimelinePrediction } from '@/types/financial';

interface TimelineChartProps {
  statusQuoData: TimelinePrediction[];
  whatIfData?: TimelinePrediction[];
}

export default function TimelineChart({ statusQuoData, whatIfData }: TimelineChartProps) {
  const chartData = statusQuoData.map((sq, index) => ({
    month: sq.month,
    statusQuoNetWorth: sq.netWorth,
    statusQuoSavings: sq.savings,
    whatIfNetWorth: whatIfData?.[index]?.netWorth,
    whatIfSavings: whatIfData?.[index]?.savings,
  }));

  return (
    <div className="bg-retro-gray p-6 rounded-lg border-2 border-neon-blue/30">
      <h2 className="text-2xl font-bold text-neon-blue uppercase tracking-wider mb-6 flex items-center gap-2">
        <span>📊</span> Timeline Projection
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1f3a" />
          <XAxis
            dataKey="month"
            stroke="#00f0ff"
            label={{ value: 'Months', position: 'insideBottom', offset: -5, fill: '#00f0ff' }}
          />
          <YAxis
            stroke="#00f0ff"
            label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft', fill: '#00f0ff' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a0e27',
              border: '2px solid #00f0ff',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#00f0ff' }}
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

