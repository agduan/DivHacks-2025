'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/Avatar';
import DinoSprite from '@/components/DinoSprite';
import FinancialInputForm from '@/components/FinancialInputForm';
import ScenarioAdjuster from '@/components/ScenarioAdjuster';
import TimelineChart from '@/components/TimelineChart';
import AIAgentComparison from '@/components/AIAgentComparison';
import UserDashboard from '@/components/UserDashboard';
import AuthModal from '@/components/AuthModal';
import IntegrationPlaceholders from '@/components/IntegrationPlaceholders';
import { FinancialData, ScenarioChange, TimelinePrediction, AIAgentPrediction, OpikEvaluation } from '@/types/financial';
import { MOCK_FINANCIAL_DATA } from '@/utils/mockData';
import { calculateStatusQuo, calculateWhatIfScenario, determineAvatarState, generateInsights } from '@/utils/financialCalculations';

function MainApp() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  // Check URL parameters for auth mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    if (mode === 'signup' || mode === 'signin') {
      setAuthMode(mode);
      setShowAuthModal(true);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-retro-darker flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-neon-blue text-4xl mb-4">⏳</div>
          <p className="text-neon-blue text-lg">Loading Financial Time Machine...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-retro-darker flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <DinoSprite 
              variant="doux" 
              animation={isButtonHovered ? 'run' : 'walk'} 
            />
          </div>
          <h1 className="text-6xl font-bold text-neon-purple uppercase tracking-wider mb-6 font-vcr">
            Financial Time Machine
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Predict your financial future with AI-powered insights. Sign in to access personalized predictions and real financial data.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => {
                setAuthMode('signin');
                setShowAuthModal(true);
              }}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              className="w-full bg-neon-green text-black px-8 py-4 rounded font-bold text-lg uppercase tracking-wide transition-all hover:bg-neon-green/80"
            >
              Sign In
            </button>
            
            <button
              onClick={() => {
                setAuthMode('signup');
                setShowAuthModal(true);
              }}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              className="w-full bg-neon-blue text-white px-8 py-4 rounded font-bold text-lg uppercase tracking-wide transition-all hover:bg-neon-blue/80"
            >
              Create Account
            </button>
          </div>

          <div className="mt-8 p-4 bg-retro-gray rounded border border-neon-purple/30">
            <h3 className="text-lg font-bold text-neon-purple uppercase tracking-wide mb-3 font-vcr">
              Features
            </h3>
            <ul className="text-left text-gray-300 space-y-2">
              <li>🔮 AI-powered financial predictions</li>
              <li>💰 Real-time billing and usage tracking</li>
              <li>🏦 Integration with Nessie API for real financial data</li>
              <li>📊 Multi-agent AI comparison</li>
              <li>🎯 Personalized financial insights</li>
            </ul>
          </div>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
        />
      </div>
    );
  }

  return <FinancialTimeMachineApp />;
}

function FinancialTimeMachineApp() {
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

  // AI Agent data - try Echo API first, fallback to mock data
  const [aiAgents, setAiAgents] = useState<AIAgentPrediction[]>([]);
  const [evaluations, setEvaluations] = useState<OpikEvaluation[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Mock AI Agent data (fallback)
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

  // Load AI predictions from Echo API
  const loadAIPredictions = async () => {
    setAiLoading(true);
    try {
      const response = await fetch('/api/echo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          financialData,
          timelineMonths,
          scenarioChanges,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiAgents(data.predictions || []);
        setEvaluations(data.evaluations || []);
      } else {
        // Fallback to mock data
        setAiAgents(mockAIAgents);
        setEvaluations(mockEvaluations);
      }
    } catch (error) {
      console.error('Error loading AI predictions:', error);
      // Fallback to mock data
      setAiAgents(mockAIAgents);
      setEvaluations(mockEvaluations);
    } finally {
      setAiLoading(false);
    }
  };

  // Load AI predictions when data changes
  useEffect(() => {
    loadAIPredictions();
  }, [financialData, timelineMonths, scenarioChanges]);

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
                <h1 className="text-3xl font-bold text-neon-blue uppercase tracking-wider neon-glow font-vcr">
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
        {/* User Dashboard */}
        <UserDashboard />
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
            <h2 className="text-2xl font-bold text-neon-green uppercase tracking-wider mb-4 font-vcr">
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
        <AIAgentComparison 
          agents={aiAgents.length > 0 ? aiAgents : mockAIAgents} 
          evaluations={evaluations.length > 0 ? evaluations : mockEvaluations}
          loading={aiLoading}
        />

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

export default function Home() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

