'use client';

import { useState } from 'react';
import Avatar from '@/components/Avatar';
import DinoSprite from '@/components/DinoSprite';
import FinancialInputForm from '@/components/FinancialInputForm';
import ScenarioAdjuster from '@/components/ScenarioAdjuster';
import TimelineChart from '@/components/TimelineChart';
import AIAgentComparison from '@/components/AIAgentComparison';
import IntegrationPlaceholders from '@/components/IntegrationPlaceholders';
import { FinancialData, ScenarioChange, TimelinePrediction, AIAgentPrediction, OpikEvaluation } from '@/types/financial';
import { MOCK_FINANCIAL_DATA } from '@/utils/mockData';
import { calculateStatusQuo, calculateWhatIfScenario, determineAvatarState, generateInsights } from '@/utils/financialCalculations';

export default function Home() {
  const [financialData, setFinancialData] = useState<FinancialData>(MOCK_FINANCIAL_DATA);
  const [scenarioChanges, setScenarioChanges] = useState<ScenarioChange[]>([]);
  const [timelineMonths, setTimelineMonths] = useState<number>(12);
  const [loading, setLoading] = useState(false);
  const [dinoAnimation, setDinoAnimation] = useState<'walk' | 'run' | 'hurt'>('walk');

  // Calculate timelines
  const statusQuoTimeline = calculateStatusQuo(financialData, timelineMonths);
  const whatIfTimeline = scenarioChanges.length > 0
    ? calculateWhatIfScenario(financialData, scenarioChanges, timelineMonths)
    : null;

  // Get final predictions for avatars
  const statusQuoFinal = statusQuoTimeline[statusQuoTimeline.length - 1];
  const whatIfFinal = whatIfTimeline?.[whatIfTimeline.length - 1];

  // Determine avatar states
  const currentAvatarState = determineAvatarState(
    financialData.currentSavings - financialData.currentDebt,
    financialData.currentDebt
  );
  const futureStatusQuoState = determineAvatarState(statusQuoFinal.netWorth, statusQuoFinal.debt);
  const futureWhatIfState = whatIfFinal
    ? determineAvatarState(whatIfFinal.netWorth, whatIfFinal.debt)
    : futureStatusQuoState;

  // Generate insights
  const insights = whatIfTimeline
    ? generateInsights(statusQuoTimeline, whatIfTimeline)
    : [];

  // Mock AI Agent data (replace with real API calls)
  const mockAIAgents: AIAgentPrediction[] = [
    {
      agentName: 'GPT-4',
      predictions: statusQuoTimeline.map(p => ({
        ...p,
        netWorth: p.netWorth * 1.05, // Slightly optimistic
      })),
      confidence: 0.87,
      insights: [
        'Strong savings trajectory detected',
        'Consider increasing emergency fund',
      ],
    },
    {
      agentName: 'Claude',
      predictions: statusQuoTimeline,
      confidence: 0.92,
      insights: [
        'Balanced financial approach',
        'Debt reduction on track',
      ],
    },
    {
      agentName: 'Gemini',
      predictions: statusQuoTimeline.map(p => ({
        ...p,
        netWorth: p.netWorth * 0.95, // Slightly conservative
      })),
      confidence: 0.84,
      insights: [
        'Risk factors identified in spending',
        'Recommend diversification',
      ],
    },
  ];

  const mockEvaluations: OpikEvaluation[] = [
    {
      agentName: 'GPT-4',
      consistency: 0.89,
      accuracy: 0.85,
      reliability: 0.87,
      notes: ['Tends toward optimistic projections'],
    },
    {
      agentName: 'Claude',
      consistency: 0.94,
      accuracy: 0.91,
      reliability: 0.92,
      notes: ['Most balanced predictions'],
    },
    {
      agentName: 'Gemini',
      consistency: 0.86,
      accuracy: 0.88,
      reliability: 0.87,
      notes: ['Conservative risk assessment'],
    },
  ];

  const handleTimeTravel = async () => {
    setLoading(true);
    // Dino keeps running during calculation
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setTimelineMonths(timelineMonths + 12);
    setLoading(false);
    
    // After calculation, show hurt animation
    console.log('💥 Dino hurt!');
    setDinoAnimation('hurt');
    
    // Return to walk after hurt animation completes
    setTimeout(() => {
      console.log('🚶 Dino back to walking');
      setDinoAnimation('walk');
    }, 600); // Match the hurt animation duration
  };

  // Handle scenario changes - start running when changes are added
  const handleScenarioChanges = (changes: ScenarioChange[]) => {
    setScenarioChanges(changes);
    if (changes.length > 0) {
      console.log('🏃 Dino running - changes added:', changes.length);
      setDinoAnimation('run');
    } else {
      console.log('🚶 Dino walking - no changes');
      setDinoAnimation('walk');
    }
  };

  // Determine which dino to show based on what-if scenario
  const getDinoVariant = (): 'doux' | 'mort' | 'vita' | 'tard' => {
    if (!whatIfFinal) {
      // Default: blue dino (doux)
      return 'doux';
    }
    
    // Rich (thriving): green dino (vita)
    if (futureWhatIfState === 'thriving') {
      return 'vita';
    }
    
    // Poor (struggling): red dino (mort)
    if (futureWhatIfState === 'struggling') {
      return 'mort';
    }
    
    // Default for stable or other states: blue dino (doux)
    return 'doux';
  };

  return (
    <main className="min-h-screen retro-grid">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b-2 border-neon-green/50 bg-retro-darker/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <DinoSprite variant={getDinoVariant()} animation={dinoAnimation} className="ml-2" />
              <div className="ml-2">
                <h1 className="text-3xl font-bold text-neon-blue uppercase tracking-wider neon-glow">
                  Financial Time Machine
                </h1>
                <p className="text-sm text-neon-blue mt-1">
                  See your financial future before it happens
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-neon-blue">Viewing</p>
              <p className="text-xl font-bold text-neon-green">{timelineMonths} Months</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FinancialInputForm
            initialData={financialData}
            onDataChange={setFinancialData}
          />
          <ScenarioAdjuster onChangesUpdate={handleScenarioChanges} />
        </div>

        {/* Time Travel Button */}
        <div className="flex justify-center">
          <button
            onClick={handleTimeTravel}
            disabled={loading}
            className="bg-neon-blue text-white px-12 py-4 rounded-lg font-bold text-xl uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Traveling...
              </>
            ) : (
              <>
                Travel to Next Year!
              </>
            )}
          </button>
        </div>

        {/* Avatar Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Avatar
            state={currentAvatarState}
            label="Current You"
            netWorth={financialData.currentSavings - financialData.currentDebt}
            savings={financialData.currentSavings}
            debt={financialData.currentDebt}
          />
          
          <Avatar
            state={futureStatusQuoState}
            label={`Future (Status Quo)`}
            netWorth={statusQuoFinal.netWorth}
            savings={statusQuoFinal.savings}
            debt={statusQuoFinal.debt}
          />

          {whatIfFinal && (
            <Avatar
              state={futureWhatIfState}
              label="Future (What-If)"
              netWorth={whatIfFinal.netWorth}
              savings={whatIfFinal.savings}
              debt={whatIfFinal.debt}
            />
          )}
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="bg-retro-gray p-6 rounded-lg border-2 border-neon-green/50">
            <h2 className="text-2xl font-bold text-neon-green uppercase tracking-wider mb-4">
              Key Insights
            </h2>
            <ul className="space-y-2">
              {insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-neon-green text-xl">▸</span>
                  <span className="text-gray-300">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Timeline Chart */}
        <TimelineChart
          statusQuoData={statusQuoTimeline}
          whatIfData={whatIfTimeline || undefined}
          onTimeRangeChange={setTimelineMonths}
        />

        {/* AI Agent Comparison */}
        <AIAgentComparison agents={mockAIAgents} evaluations={mockEvaluations} />

        {/* Integration Placeholders */}
        <IntegrationPlaceholders />
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-neon-purple/50 bg-retro-darker/80 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-400 text-sm">
          <p>Built with love for DivHacks 2025</p>
          <p className="mt-2">
            Powered by Next.js • TypeScript • Tailwind CSS • Recharts • Capital One Nessie API
          </p>
        </div>
      </footer>
    </main>
  );
}

