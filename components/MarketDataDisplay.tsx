'use client';

import { useState, useEffect } from 'react';
import { getMarketTrend, getSectorPerformance, REAL_SP500_DATA, REAL_NASDAQ_DATA, getCombinedMarketData } from '@/utils/realMarketData';

interface MarketDataDisplayProps {
  selectedModel: string;
}

export default function MarketDataDisplay({ selectedModel }: MarketDataDisplayProps) {
  const [marketTrend, setMarketTrend] = useState<any>(null);
  const [sectorPerformance, setSectorPerformance] = useState<any>(null);
  const [currentSP500, setCurrentSP500] = useState<any>(null);
  const [currentNASDAQ, setCurrentNASDAQ] = useState<any>(null);

  useEffect(() => {
    const trend = getMarketTrend();
    const sectors = getSectorPerformance();
    const sp500 = REAL_SP500_DATA[0]; // Most recent S&P 500 data
    const nasdaq = REAL_NASDAQ_DATA[0]; // Most recent NASDAQ data
    
    setMarketTrend(trend);
    setSectorPerformance(sectors);
    setCurrentSP500(sp500);
    setCurrentNASDAQ(nasdaq);
  }, []);

  if (!marketTrend || !sectorPerformance || !currentSP500 || !currentNASDAQ) {
    return null;
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bull': return 'text-green-400';
      case 'bear': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bull': return '📈';
      case 'bear': return '📉';
      default: return '📊';
    }
  };

  const getModelCorrelation = (model: string) => {
    switch (model) {
      case 'realistic':
        return {
          description: 'Uses REAL S&P 500 data',
          correlation: 'High',
          color: 'text-green-400'
        };
      case 'exponential':
        return {
          description: 'Correlates with market cycles',
          correlation: 'Medium',
          color: 'text-blue-400'
        };
      case 'optimistic':
        return {
          description: 'Bull market assumptions',
          correlation: 'High',
          color: 'text-purple-400'
        };
      case 'conservative':
        return {
          description: 'Defensive positioning',
          correlation: 'Low',
          color: 'text-gray-400'
        };
      default:
        return {
          description: 'Limited market correlation',
          correlation: 'Low',
          color: 'text-gray-400'
        };
    }
  };

  const correlation = getModelCorrelation(selectedModel);

  return (
    <div className="bg-retro-gray p-6 rounded-lg border-2 border-neon-green/50 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-neon-green uppercase tracking-wider font-vcr">
          📊 Real Market Data
        </h2>
        <div className="text-sm text-gray-400 space-y-1">
          <div>S&P 500: ${currentSP500.close.toLocaleString()}</div>
          <div>NASDAQ: ${currentNASDAQ.close.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Market Trend */}
        <div className="bg-retro-darker p-4 rounded-lg border border-neon-blue/30">
          <h3 className="text-neon-blue font-bold mb-2">Market Trend</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{getTrendIcon(marketTrend.trend)}</span>
            <span className={`font-bold text-lg ${getTrendColor(marketTrend.trend)}`}>
              {marketTrend.trend.toUpperCase()}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            Strength: {(marketTrend.strength * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400">
            Confidence: {(marketTrend.confidence * 100).toFixed(0)}%
          </div>
        </div>

        {/* Model Correlation */}
        <div className="bg-retro-darker p-4 rounded-lg border border-neon-green/30">
          <h3 className="text-neon-green font-bold mb-2">Model Correlation</h3>
          <div className="text-sm text-gray-400 mb-2">
            {correlation.description}
          </div>
          <div className={`font-bold ${correlation.color}`}>
            Correlation: {correlation.correlation}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {selectedModel === 'realistic' && 'Uses actual S&P 500 returns'}
            {selectedModel === 'exponential' && 'Follows market cycles'}
            {selectedModel === 'optimistic' && 'Assumes bull market'}
            {selectedModel === 'conservative' && 'Defensive approach'}
          </div>
        </div>

        {/* Top Performing Sectors */}
        <div className="bg-retro-darker p-4 rounded-lg border border-neon-purple/30">
          <h3 className="text-neon-purple font-bold mb-2">Top Sectors</h3>
          <div className="space-y-1">
            {Object.entries(sectorPerformance)
              .sort(([,a], [,b]) => (b as number) - (a as number))
              .slice(0, 3)
              .map(([sector, performance]) => (
                <div key={sector} className="flex justify-between text-sm">
                  <span className="text-gray-400">{sector}</span>
                  <span className={`font-bold ${
                    (performance as number) > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {((performance as number) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Combined Market Data Table */}
      <div className="mt-6">
        <h3 className="text-neon-blue font-bold mb-3">Recent Market Performance (S&P 500 & NASDAQ)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-2 text-gray-400">Date</th>
                <th className="text-right py-2 text-gray-400">S&P 500</th>
                <th className="text-right py-2 text-gray-400">NASDAQ</th>
                <th className="text-right py-2 text-gray-400">S&P Change</th>
                <th className="text-right py-2 text-gray-400">NASDAQ Change</th>
              </tr>
            </thead>
            <tbody>
              {REAL_SP500_DATA.slice(0, 6).map((sp500Data, index) => {
                const nasdaqData = REAL_NASDAQ_DATA[index];
                const sp500Change = index > 0 ? 
                  ((sp500Data.close - REAL_SP500_DATA[index + 1].close) / REAL_SP500_DATA[index + 1].close) * 100 : 0;
                const nasdaqChange = index > 0 ? 
                  ((nasdaqData.close - REAL_NASDAQ_DATA[index + 1].close) / REAL_NASDAQ_DATA[index + 1].close) * 100 : 0;
                
                return (
                  <tr key={sp500Data.date} className="border-b border-gray-700">
                    <td className="py-2 text-gray-300">{sp500Data.date}</td>
                    <td className="py-2 text-right text-gray-300">${sp500Data.close.toLocaleString()}</td>
                    <td className="py-2 text-right text-gray-300">${nasdaqData.close.toLocaleString()}</td>
                    <td className={`py-2 text-right font-bold ${
                      sp500Change > 0 ? 'text-green-400' : sp500Change < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {sp500Change > 0 ? '+' : ''}{sp500Change.toFixed(2)}%
                    </td>
                    <td className={`py-2 text-right font-bold ${
                      nasdaqChange > 0 ? 'text-green-400' : nasdaqChange < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {nasdaqChange > 0 ? '+' : ''}{nasdaqChange.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model-Specific Insights */}
      {selectedModel === 'realistic' && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded">
          <div className="text-green-400 font-bold text-sm mb-1">
            ✅ Realistic Model: Using Real S&P 500 + NASDAQ Data
          </div>
          <div className="text-xs text-gray-400">
            Your projections are based on real market performance from both S&P 500 and NASDAQ indices.
            This model uses a 60% S&P 500 / 40% NASDAQ weighted portfolio for realistic market correlation.
          </div>
        </div>
      )}

      {selectedModel === 'exponential' && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
          <div className="text-blue-400 font-bold text-sm mb-1">
            🚀 Exponential Model: Market Cycle Correlation
          </div>
          <div className="text-xs text-gray-400">
            This model follows market cycles and will show exponential growth during bull markets.
          </div>
        </div>
      )}

      {selectedModel === 'optimistic' && (
        <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded">
          <div className="text-purple-400 font-bold text-sm mb-1">
            ✨ Optimistic Model: Bull Market Assumptions
          </div>
          <div className="text-xs text-gray-400">
            This model assumes favorable market conditions and aggressive growth.
          </div>
        </div>
      )}
    </div>
  );
}
