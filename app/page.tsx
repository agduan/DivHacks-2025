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
import CalendarTimeline from '@/components/CalendarTimeline';
import MarketDataDisplay from '@/components/MarketDataDisplay';
import LongTermProjection from '@/components/LongTermProjection';
import { FinancialModel, FINANCIAL_MODELS } from '@/utils/financialModels';
import { FinancialData, ScenarioChange, TimelinePrediction, AIAgentPrediction, OpikEvaluation } from '@/types/financial';
import { MOCK_FINANCIAL_DATA } from '@/utils/mockData';
import { calculateStatusQuo, calculateWhatIfScenario, determineAvatarState, generateInsights } from '@/utils/financialCalculations';
import { calculateProjectionWithModel } from '@/utils/financialModels';
import { fetchNessieFinancialData } from '@/utils/nessieDataIntegration';

function MainApp() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [guestMode, setGuestMode] = useState(false);

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
          <div className="animate-spin w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-neon-blue text-lg">Loading finosaur.ai...</p>
        </div>
      </div>
    );
  }

  if (!user && !guestMode) {
    return (
      <div className="min-h-screen bg-retro-darker flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <DinoSprite 
              variant="doux" 
              animation={showAuthModal ? 'run' : 'walk'} 
            />
          </div>
          <h1 className="text-6xl font-bold text-neon-purple uppercase tracking-wider mb-6 font-vcr">
            finosaur.ai
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
              className="w-full bg-neon-green text-black px-8 py-4 rounded font-bold text-lg uppercase tracking-wide transition-all hover:bg-neon-green/80"
            >
              Sign In
            </button>
            
            <button
              onClick={() => {
                setAuthMode('signup');
                setShowAuthModal(true);
              }}
              className="w-full bg-neon-blue text-white px-8 py-4 rounded font-bold text-lg uppercase tracking-wide transition-all hover:bg-neon-blue/80"
            >
              Create Account
            </button>
          </div>

          <div className="mt-8 p-4 bg-retro-gray rounded border border-neon-purple/30">
            <h3 className="text-lg font-bold text-neon-purple uppercase tracking-wide mb-3 font-vcr">
              Features
            </h3>
            <ul className="text-left text-gray-300 space-y-2 list-disc list-inside">
              <li>AI-powered financial predictions</li>
              <li>Real-time billing and usage tracking</li>
              <li>Integration with Nessie API for real financial data</li>
              <li>Multi-agent AI comparison</li>
              <li>Personalized financial insights</li>
            </ul>
          </div>

          <div className="mt-6">
            <button
              onClick={() => setGuestMode(true)}
              className="text-gray-400 hover:text-neon-blue text-sm transition-colors underline"
            >
              No thanks, let me test it out
            </button>
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
  const [selectedModel, setSelectedModel] = useState<FinancialModel>('linear');
  const [showCalendar, setShowCalendar] = useState(false);
  const [usingRealData, setUsingRealData] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  // Scroll spy effect to track active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['ai-advisors', 'timeline-section', 'market-section'];
      const scrollPosition = window.scrollY + 200; // Offset for header

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate timelines using selected model
  const statusQuoTimeline = calculateProjectionWithModel(financialData, timelineMonths, selectedModel);
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
  const [opikComparison, setOpikComparison] = useState<any>(null);
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

  // Load AI predictions with OPIK evaluation
  const loadAIPredictions = async () => {
    console.log('Loading AI predictions with OPIK evaluation...', { financialData, timelineMonths });
    setAiLoading(true);
    try {
      const response = await fetch('/api/ai-agents', {
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
        setAiAgents(data.predictions || []); // Fixed: API returns 'predictions' not 'agents'
        setEvaluations(data.evaluations || []);
        setOpikComparison(data.comparison || null);
      } else {
        // Fallback to mock data
        setAiAgents(mockAIAgents);
        setEvaluations(mockEvaluations);
        setOpikComparison(null);
      }
    } catch (error) {
      console.error('Error loading AI predictions:', error);
      // Fallback to mock data
      setAiAgents(mockAIAgents);
      setEvaluations(mockEvaluations);
      setOpikComparison(null);
    } finally {
      setAiLoading(false);
    }
  };

  // Load real financial data from Nessie API
  const loadRealFinancialData = async () => {
    setLoading(true);
    try {
      const realData = await fetchNessieFinancialData();
      if (realData) {
        setFinancialData(realData);
        setUsingRealData(true);
        console.log('✅ Loaded real financial data from Nessie API');
      } else {
        console.log('⚠️ Nessie API not available, using mock data');
      }
    } catch (error) {
      console.error('Error loading real financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't auto-load AI predictions - only when user clicks "Travel to Next Year"
  // useEffect(() => {
  //   loadAIPredictions();
  // }, [financialData, timelineMonths, scenarioChanges]);

  const handleTimeTravel = async () => {
    setLoading(true);
    setDinoAnimation('run');
    
    // Advance timeline by 12 months (1 year)
    setTimelineMonths(prev => prev + 12);
    
    // Run AI analysis with new timeline
    await loadAIPredictions();
    
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
                <h1 className="text-3xl font-extrabold text-neon-blue uppercase tracking-wider minimal-glow font-vcr">
                  finosaur.ai
                </h1>
                <p className="text-base text-neon-blue mt-1 italic">
                  See your financial future before it happens
                </p>
              </div>
            </div>
            <nav className="flex items-center gap-10">
              <a 
                href="#ai-advisors" 
                className={`hover:text-neon-blue transition-colors font-vcr flex flex-col items-center ${
                  activeSection === 'ai-advisors' ? 'text-white' : 'text-gray-400'
                }`}
              >
                <span className="text-xs text-gray-500 mb-1">01</span>
                <span className="text-base uppercase tracking-wide">AI Advisors</span>
              </a>
              <a 
                href="#timeline-section" 
                className={`hover:text-neon-blue transition-colors font-vcr flex flex-col items-center ${
                  activeSection === 'timeline-section' ? 'text-white' : 'text-gray-400'
                }`}
              >
                <span className="text-xs text-gray-500 mb-1">02</span>
                <span className="text-base uppercase tracking-wide">Timeline</span>
              </a>
              <a 
                href="#market-section" 
                className={`hover:text-neon-blue transition-colors font-vcr flex flex-col items-center ${
                  activeSection === 'market-section' ? 'text-white' : 'text-gray-400'
                }`}
              >
                <span className="text-xs text-gray-500 mb-1">03</span>
                <span className="text-base uppercase tracking-wide">Market Projection</span>
              </a>
            </nav>
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

        {/* Enhanced Time Travel Button */}
        <div className="bg-retro-gray p-6 rounded-lg border-2 border-neon-green/50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neon-green uppercase tracking-wider font-vcr mb-4">
              Time Travel Controls
            </h2>
            
            {/* Timeline Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Current Timeline</span>
                <span>{timelineMonths} months</span>
              </div>
                <div className="w-full bg-retro-darker rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-neon-blue to-neon-green transition-all duration-500"
                    style={{ width: `${Math.min((timelineMonths / 360) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {timelineMonths < 12 ? 'Short-term view' :
                   timelineMonths < 60 ? 'Medium-term projection' :
                   timelineMonths < 120 ? 'Long-term forecast' :
                   timelineMonths < 240 ? 'Extended forecast' :
                   'Ultra-long-term projection'}
                </p>
            </div>

            <button
              onClick={handleTimeTravel}
              disabled={loading}
              className={`relative px-8 py-4 rounded-lg font-bold text-lg uppercase tracking-wider transition-all transform ${
                loading
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-neon-blue to-neon-green text-retro-dark hover:from-neon-green hover:to-neon-blue hover:scale-105 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]'
              } ${dinoAnimation === 'run' ? 'animate-pulse' : ''} ${dinoAnimation === 'hurt' ? 'animate-bounce' : ''}`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  TRAVELING TO FUTURE...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  TRAVEL TO NEXT YEAR
                </span>
              )}
            </button>

            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm">
                Advance timeline by 12 months and get AI predictions
              </p>
            </div>
          </div>
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

        {/* AI Agent Comparison - Always show, with placeholder before analysis */}
        <div id="ai-advisors">
          <AIAgentComparison 
          agents={aiAgents} 
          evaluations={evaluations}
          comparison={opikComparison}
          loading={aiLoading}
        />
        </div>

        {/* Timeline Controls */}
        <div id="timeline-section" className="bg-retro-gray p-6 rounded-lg border-2 border-neon-green/50 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neon-green uppercase tracking-wider font-vcr">
              Timeline Analysis
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className={`px-4 py-2 rounded font-bold text-sm uppercase transition-all ${
                  showCalendar
                    ? 'bg-neon-blue text-retro-dark'
                    : 'bg-retro-darker text-gray-400 hover:text-neon-blue'
                }`}
              >
                {showCalendar ? 'Chart View' : 'Calendar View'}
              </button>
            </div>
          </div>
          
          {/* Financial Model Selector */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-neon-blue font-bold text-sm">Financial Projection Models</h3>
              <button
                onClick={loadRealFinancialData}
                disabled={loading}
                className={`px-3 py-1 rounded text-xs font-bold uppercase transition-all ${
                  usingRealData
                    ? 'bg-green-500 text-white'
                    : 'bg-neon-blue text-retro-dark hover:bg-neon-green'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Loading...' : usingRealData ? 'Real Data' : 'Load Real Data'}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(FINANCIAL_MODELS).map(([key, model]) => (
                <button
                  key={key}
                  onClick={() => setSelectedModel(key as FinancialModel)}
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
        </div>

        {/* Timeline Display */}
        {showCalendar ? (
          <CalendarTimeline
            statusQuoData={statusQuoTimeline}
            whatIfData={whatIfTimeline || undefined}
            onModelChange={setSelectedModel}
            selectedModel={selectedModel}
          />
        ) : (
          <TimelineChart
            statusQuoData={statusQuoTimeline}
            whatIfData={whatIfTimeline || undefined}
            onTimeRangeChange={setTimelineMonths}
          />
        )}

        {/* Long-term Projection Display - Only for 20+ year projections */}
        {timelineMonths >= 240 && (
          <LongTermProjection
            statusQuoData={statusQuoTimeline}
            whatIfData={whatIfTimeline || undefined}
            selectedModel={selectedModel}
          />
        )}

        {/* Real Market Data Display - Moved under timeline */}
        <div id="market-section">
          <MarketDataDisplay selectedModel={selectedModel} />
        </div>

  {/* Integration Placeholders removed as requested */}
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-neon-purple/50 bg-retro-darker/80 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-400 text-sm">
          <p>
            Built for DivHacks 2025 @ Columbia • <a href="https://github.com/agduan/DivHacks-2025" target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:text-neon-green transition-colors">GitHub</a>
          </p>
          <p className="mt-2">
            Powered by Next.js • TypeScript • Tailwind CSS • Recharts • Google Gemini API • Capital One Nessie API
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

