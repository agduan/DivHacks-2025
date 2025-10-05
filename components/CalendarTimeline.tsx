'use client';

import { useState, useMemo } from 'react';
import { TimelinePrediction } from '@/types/financial';
import { FinancialModel, FINANCIAL_MODELS } from '@/utils/financialModels';

interface CalendarTimelineProps {
  statusQuoData: TimelinePrediction[];
  whatIfData?: TimelinePrediction[];
  onModelChange?: (model: FinancialModel) => void;
  selectedModel?: FinancialModel;
}

export default function CalendarTimeline({ 
  statusQuoData, 
  whatIfData, 
  onModelChange,
  selectedModel = 'linear'
}: CalendarTimelineProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'chart'>('calendar');
  const [selectedMonth, setSelectedMonth] = useState<number>(1);

  // Generate calendar data
  const calendarData = useMemo(() => {
    const months = [];
    const startDate = new Date();
    
    for (let i = 0; i < statusQuoData.length; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      
      const statusQuo = statusQuoData[i];
      const whatIf = whatIfData?.[i];
      
      months.push({
        month: i + 1,
        date,
        monthName: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        statusQuo: {
          netWorth: statusQuo.netWorth,
          savings: statusQuo.savings,
          debt: statusQuo.debt,
        },
        whatIf: whatIf ? {
          netWorth: whatIf.netWorth,
          savings: whatIf.savings,
          debt: whatIf.debt,
        } : null,
        isSelected: i + 1 === selectedMonth,
      });
    }
    
    return months;
  }, [statusQuoData, whatIfData, selectedMonth]);

  const selectedData = calendarData.find(m => m.month === selectedMonth);

  return (
    <div className="bg-retro-gray p-6 rounded-lg border-2 border-neon-green/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neon-green uppercase tracking-wider font-vcr">
            📅 Calendar Timeline
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Click months to explore your financial journey
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-retro-darker rounded-lg p-1">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-2 rounded font-bold text-xs uppercase transition-all ${
              viewMode === 'calendar'
                ? 'bg-neon-blue text-retro-dark'
                : 'text-gray-400 hover:text-neon-blue'
            }`}
          >
            📅 Calendar
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`px-3 py-2 rounded font-bold text-xs uppercase transition-all ${
              viewMode === 'chart'
                ? 'bg-neon-blue text-retro-dark'
                : 'text-gray-400 hover:text-neon-blue'
            }`}
          >
            📊 Chart
          </button>
        </div>
      </div>

      {/* Model Selector */}
      <div className="mb-6">
        <h3 className="text-neon-blue font-bold text-sm mb-3">Financial Models</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(FINANCIAL_MODELS).map(([key, model]) => (
            <button
              key={key}
              onClick={() => onModelChange?.(key as FinancialModel)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                selectedModel === key
                  ? 'border-neon-blue bg-neon-blue/20'
                  : 'border-gray-600 hover:border-neon-green'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{model.icon}</span>
                <span className="font-bold text-sm" style={{ color: model.color }}>
                  {model.name}
                </span>
              </div>
              <p className="text-xs text-gray-400">{model.description}</p>
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="space-y-4">
          {/* Calendar Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {calendarData.map((month) => (
              <div
                key={month.month}
                onClick={() => setSelectedMonth(month.month)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  month.isSelected
                    ? 'border-neon-blue bg-neon-blue/20'
                    : 'border-gray-600 hover:border-neon-green hover:bg-neon-green/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-neon-blue">{month.monthName}</h4>
                  <span className="text-xs text-gray-400">Month {month.month}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Net Worth:</span>
                    <span className="font-bold text-purple-400">
                      ${month.statusQuo.netWorth.toLocaleString()}
                    </span>
                  </div>
                  
                  {month.whatIf && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">What-If:</span>
                      <span className="font-bold text-green-400">
                        ${month.whatIf.netWorth.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Savings: ${month.statusQuo.savings.toLocaleString()}</span>
                    <span>Debt: ${month.statusQuo.debt.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Month Details */}
          {selectedData && (
            <div className="mt-6 p-4 bg-retro-darker rounded-lg border border-neon-blue/30">
              <h3 className="text-neon-blue font-bold text-lg mb-4">
                📊 {selectedData.monthName} Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-purple-400 font-bold mb-2">Current Path</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Net Worth:</span>
                      <span className="font-bold">${selectedData.statusQuo.netWorth.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Savings:</span>
                      <span>${selectedData.statusQuo.savings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Debt:</span>
                      <span>${selectedData.statusQuo.debt.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {selectedData.whatIf && (
                  <div>
                    <h4 className="text-green-400 font-bold mb-2">What-If Scenario</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Net Worth:</span>
                        <span className="font-bold">${selectedData.whatIf.netWorth.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Savings:</span>
                        <span>${selectedData.whatIf.savings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Debt:</span>
                        <span>${selectedData.whatIf.debt.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedData.whatIf && (
                <div className="mt-4 p-3 bg-yellow-400/10 border border-yellow-400/30 rounded">
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-400">Difference:</span>
                    <span className="font-bold text-yellow-400">
                      ${Math.abs(selectedData.whatIf.netWorth - selectedData.statusQuo.netWorth).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">Chart view coming soon...</p>
        </div>
      )}
    </div>
  );
}
