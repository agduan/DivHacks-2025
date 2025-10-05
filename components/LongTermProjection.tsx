'use client';

import { useState } from 'react';
import { TimelinePrediction } from '@/types/financial';

interface LongTermProjectionProps {
  statusQuoData: TimelinePrediction[];
  whatIfData?: TimelinePrediction[];
  selectedModel: string;
}

export default function LongTermProjection({ statusQuoData, whatIfData, selectedModel }: LongTermProjectionProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (statusQuoData.length < 240) {
    return null; // Only show for 20+ year projections
  }

  const finalStatusQuo = statusQuoData[statusQuoData.length - 1];
  const finalWhatIf = whatIfData?.[whatIfData.length - 1];
  const initialValue = statusQuoData[0].netWorth;
  
  const totalGrowth = finalStatusQuo.netWorth - initialValue;
  const totalGrowthPercent = ((finalStatusQuo.netWorth / initialValue) - 1) * 100;
  const years = statusQuoData.length / 12;
  
  const getModelColor = (model: string) => {
    switch (model) {
      case 'realistic': return 'text-green-400';
      case 'exponential': return 'text-blue-400';
      case 'optimistic': return 'text-purple-400';
      case 'conservative': return 'text-gray-400';
      case 'linear': return 'text-cyan-400';
      case 'seasonal': return 'text-yellow-400';
      case 'savings': return 'text-orange-400';
      default: return 'text-white';
    }
  };

  const getModelIcon = (model: string) => {
    switch (model) {
      case 'realistic': return '🎯';
      case 'exponential': return '🚀';
      case 'optimistic': return '✨';
      case 'conservative': return '🛡️';
      case 'linear': return '📈';
      case 'seasonal': return '🌊';
      case 'savings': return '🏦';
      default: return '📊';
    }
  };

  const getProjectionInsights = () => {
    const insights = [];
    
    if (years >= 20) {
      insights.push(`📈 ${years.toFixed(1)}-year projection shows ${totalGrowthPercent.toFixed(1)}% total growth`);
    }
    
    if (finalStatusQuo.netWorth > initialValue * 10) {
      insights.push('💰 10x wealth multiplication achieved!');
    }
    
    if (finalStatusQuo.netWorth > 1000000) {
      insights.push('🎉 Millionaire status reached!');
    }
    
    if (finalStatusQuo.netWorth > 10000000) {
      insights.push('👑 Multi-millionaire status achieved!');
    }
    
    if (finalStatusQuo.debt === 0 && statusQuoData.some(p => p.debt > 0)) {
      insights.push('✅ Debt-free milestone reached!');
    }
    
    if (finalStatusQuo.savings > finalStatusQuo.netWorth * 0.8) {
      insights.push('🏦 Conservative savings approach maintained');
    }
    
    return insights;
  };

  const insights = getProjectionInsights();

  return (
    <div className="bg-retro-gray p-6 rounded-lg border-2 border-neon-green/50 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-neon-green uppercase tracking-wider font-vcr">
          {years.toFixed(1)}-Year {selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)} Projection
        </h2>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-4 py-2 bg-neon-blue text-retro-dark rounded font-bold text-sm uppercase transition-all hover:bg-neon-green"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-retro-darker p-4 rounded-lg border border-neon-blue/30">
          <h3 className="text-neon-blue font-bold mb-2">Final Net Worth</h3>
          <div className={`text-3xl font-bold ${getModelColor(selectedModel)}`}>
            ${finalStatusQuo.netWorth.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">
            {totalGrowth > 0 ? '+' : ''}${totalGrowth.toLocaleString()} growth
          </div>
        </div>

        <div className="bg-retro-darker p-4 rounded-lg border border-neon-green/30">
          <h3 className="text-neon-green font-bold mb-2">Total Growth</h3>
          <div className="text-3xl font-bold text-green-400">
            {totalGrowthPercent.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400">
            Over {years.toFixed(1)} years
          </div>
        </div>

        <div className="bg-retro-darker p-4 rounded-lg border border-neon-purple/30">
          <h3 className="text-neon-purple font-bold mb-2">Annual Growth Rate</h3>
          <div className="text-3xl font-bold text-purple-400">
            {(Math.pow(finalStatusQuo.netWorth / initialValue, 1/years) - 1) * 100}%
          </div>
          <div className="text-sm text-gray-400">
            Compound annual growth
          </div>
        </div>
      </div>

      {/* What-If Comparison */}
      {finalWhatIf && (
        <div className="bg-retro-darker p-4 rounded-lg border border-neon-yellow/30 mb-6">
          <h3 className="text-neon-yellow font-bold mb-3">What-If Scenario Comparison</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400">Current Path</div>
              <div className="text-xl font-bold text-blue-400">
                ${finalStatusQuo.netWorth.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">What-If Path</div>
              <div className="text-xl font-bold text-green-400">
                ${finalWhatIf.netWorth.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-400">
            Difference: {finalWhatIf.netWorth > finalStatusQuo.netWorth ? '+' : ''}
            ${(finalWhatIf.netWorth - finalStatusQuo.netWorth).toLocaleString()}
          </div>
        </div>
      )}

      {/* Projection Insights */}
      {insights.length > 0 && (
        <div className="bg-retro-darker p-4 rounded-lg border border-neon-cyan/30 mb-6">
          <h3 className="text-neon-cyan font-bold mb-3">Projection Insights</h3>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <div key={index} className="text-sm text-gray-300">
                {insight}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-retro-darker p-4 rounded-lg border border-gray-600">
              <h4 className="font-bold text-gray-300 mb-2">Savings Breakdown</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Savings:</span>
                  <span className="text-green-400">${finalStatusQuo.savings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Investment Portfolio:</span>
                  <span className="text-blue-400">
                    ${(finalStatusQuo as any).investmentPortfolio?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Remaining Debt:</span>
                  <span className="text-red-400">${finalStatusQuo.debt.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-retro-darker p-4 rounded-lg border border-gray-600">
              <h4 className="font-bold text-gray-300 mb-2">Time Analysis</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Projection Period:</span>
                  <span className="text-cyan-400">{years.toFixed(1)} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly Growth:</span>
                  <span className="text-green-400">
                    ${(totalGrowth / statusQuoData.length).toFixed(0)}/month
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Wealth Multiplier:</span>
                  <span className="text-purple-400">
                    {(finalStatusQuo.netWorth / initialValue).toFixed(1)}x
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Model-Specific Long-Term Notes */}
          <div className="bg-retro-darker p-4 rounded-lg border border-gray-600">
            <h4 className="font-bold text-gray-300 mb-2">Long-Term Model Characteristics</h4>
            <div className="text-sm text-gray-400">
              {selectedModel === 'realistic' && (
                <p>
                  This realistic model accounts for market volatility, life events, and economic cycles over {years.toFixed(1)} years. 
                  It includes major life events, career changes, and retirement considerations for ultra-long-term projections.
                </p>
              )}
              {selectedModel === 'exponential' && (
                <p>
                  The exponential model shows compound growth over {years.toFixed(1)} years with adjustments for long-term risk management. 
                  Returns become more conservative as the timeline extends to preserve wealth.
                </p>
              )}
              {selectedModel === 'optimistic' && (
                <p>
                  This optimistic projection assumes favorable conditions over {years.toFixed(1)} years with aggressive growth strategies 
                  and minimal setbacks.
                </p>
              )}
              {selectedModel === 'conservative' && (
                <p>
                  The conservative model prioritizes wealth preservation over {years.toFixed(1)} years with lower risk investments 
                  and steady, predictable growth.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
