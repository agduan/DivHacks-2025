'use client';

import { AIAgentPrediction, OpikEvaluation } from '@/types/financial';
import DinoSprite from './DinoSprite';

interface AIAgentComparisonProps {
  agents: AIAgentPrediction[];
  evaluations: OpikEvaluation[];
  comparison?: any;
  loading?: boolean;
}

export default function AIAgentComparison({ agents, evaluations, comparison, loading = false }: AIAgentComparisonProps) {
  const getAgentColors = (agentName: string) => {
    if (agentName.includes('Casey the Calculator')) {
      return {
        primary: 'text-neon-blue',
        border: 'border-neon-blue/50',
        accent: 'text-neon-blue',
        bg: 'bg-neon-blue/10',
      };
    }
    if (agentName.includes('Sunny Saver')) {
      return {
        primary: 'text-neon-green',
        border: 'border-neon-green/50',
        accent: 'text-neon-green',
        bg: 'bg-neon-green/10',
      };
    }
    // Grump Gains (default)
    return {
      primary: 'text-neon-pink',
      border: 'border-neon-pink/50',
      accent: 'text-neon-pink',
      bg: 'bg-neon-pink/10',
    };
  };

  const getDinoVariant = (agentName: string): 'doux' | 'mort' | 'vita' | 'tard' => {
    if (agentName.includes('Casey the Calculator')) {
      return 'doux';
    }
    if (agentName.includes('Sunny Saver')) {
      return 'vita';
    }
    // Grump Gains (default)
    return 'mort';
  };

  const getAgentIntro = (agentName: string) => {
    if (agentName.includes('Casey the Calculator')) {
      return "I'm Casey the Calculator, a pragmatic financial analyst who focuses on data-driven, realistic advice.";
    }
    if (agentName.includes('Sunny Saver')) {
      return "I'm Sunny Saver, an energetic wealth coach here to motivate you toward your financial dreams!";
    }
    // Grump Gains (default)
    return "I'm Grump Gains, a no-nonsense advisor who tells it like it is with a side of sarcasm.";
  };

  // Placeholder agents when no analysis has run yet
  const placeholderAgents: Partial<AIAgentPrediction>[] = [
    { agentName: 'Casey the Calculator' },
    { agentName: 'Sunny Saver' },
    { agentName: 'Grump Gains' },
  ];

  const displayAgents = agents.length > 0 ? agents : placeholderAgents;

  return (
    <div className="bg-retro-gray p-6 rounded-lg border-2 border-neon-purple/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neon-purple uppercase tracking-wider font-vcr">
          AI Financial Advisors
        </h2>
        <div className="flex items-center gap-4">
          {comparison && (
            <div className="flex items-center gap-2 text-neon-green text-sm">
              <span>OPIK Analysis Active</span>
            </div>
          )}
          {loading && (
            <div className="flex items-center gap-2 text-neon-blue">
              <span className="text-sm">Loading AI predictions...</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayAgents.map((agent, index) => {
          const evaluation = evaluations.find((e) => e.agentName === agent.agentName);
          const finalPrediction = agent.predictions ? agent.predictions[agent.predictions.length - 1] : null;
          const hasAnalysis = !!finalPrediction;

          const colors = getAgentColors(agent.agentName || '');
          return (
            <div
              key={agent.agentName || index}
              className={`bg-retro-darker p-4 rounded-lg border ${colors.border} space-y-3`}
            >
              {/* Agent Header */}
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-bold ${colors.primary}`}>{agent.agentName}</h3>
                {hasAnalysis && agent.confidence !== undefined && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">Confidence:</span>
                    <span className={`text-sm font-bold ${colors.accent}`}>
                      {(agent.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Predictions - only show when analysis is done */}
              {hasAnalysis && finalPrediction && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Net Worth:</span>
                    <span className={`font-bold ${colors.accent}`}>
                      ${finalPrediction.netWorth.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Savings:</span>
                    <span className={`font-bold ${colors.accent}`}>
                      ${finalPrediction.savings.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Debt:</span>
                    <span className="font-bold text-white">
                      ${finalPrediction.debt.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Dino and Speech Bubble */}
              <div className="flex gap-3 items-start">
                {/* Dino Sprite */}
                <div className="flex-shrink-0">
                  <DinoSprite 
                    variant={getDinoVariant(agent.agentName || '')} 
                    animation="idle"
                  />
                </div>
                
                {/* Speech Bubble */}
                <div className="flex-1 relative">
                  {/* Speech bubble tail - outer border */}
                  <div 
                    className="absolute left-0 w-0 h-0"
                    style={{
                      top: '16px',
                      borderTop: '8px solid transparent',
                      borderBottom: '8px solid transparent',
                      borderRight: '12px solid #4b5563',
                      transform: 'translateX(-10px)'
                    }}
                  ></div>
                  {/* Speech bubble tail - inner fill */}
                  <div 
                    className="absolute left-0 w-0 h-0"
                    style={{
                      top: '17px',
                      borderTop: '6px solid transparent',
                      borderBottom: '6px solid transparent',
                      borderRight: '10px solid #f3f4f6',
                      transform: 'translateX(-8px)'
                    }}
                  ></div>
                  
                  {/* Speech bubble content */}
                  <div className="bg-gray-100 border-2 border-gray-600 rounded-lg p-3">
                    {hasAnalysis && agent.insights ? (
                      // Show insights when analysis is done
                      <>
                        <p className={`text-xs uppercase tracking-wide font-bold ${colors.primary} mb-2`}>
                          Key Insights:
                        </p>
                        <ul className="text-xs text-gray-800 space-y-1">
                          {agent.insights?.slice(0, 2).map((insight: string, i: number) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className={colors.accent}>▸</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      // Show introduction before analysis
                      <p className="text-xs text-gray-800">
                        {getAgentIntro(agent.agentName || '')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Evaluation - only show when analysis is done */}
              {hasAnalysis && evaluation && (
                <div className={`pt-3 border-t ${colors.border} space-y-2`}>
                  <p className={`text-xs uppercase tracking-wide font-bold ${colors.primary}`}>
                    Opik Evaluation
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-gray-400">Consistency</div>
                      <div className={`font-bold ${colors.accent}`}>
                        {(evaluation.consistency * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Accuracy</div>
                      <div className={`font-bold ${colors.accent}`}>
                        {(evaluation.accuracy * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Reliability</div>
                      <div className={`font-bold ${colors.accent}`}>
                        {(evaluation.reliability * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* OPIK Comparison Insights */}
      {comparison && (
        <div className="mt-6 p-4 bg-neon-blue/10 border-2 border-neon-blue rounded-lg">
          <h3 className="text-lg font-bold text-neon-blue uppercase tracking-wide mb-3 font-vcr">
            OPIK Analysis Results
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-neon-green font-bold">Best Performer:</span>
              <span className="text-neon-blue font-bold">{comparison.bestPerformer}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-neon-purple">Avg Accuracy</div>
                <div className="text-neon-green font-bold">
                  {(comparison.averageMetrics.accuracy * 100).toFixed(0)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-neon-blue">Avg Consistency</div>
                <div className="text-neon-blue font-bold">
                  {(comparison.averageMetrics.consistency * 100).toFixed(0)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-neon-pink">Avg Reliability</div>
                <div className="text-neon-purple font-bold">
                  {(comparison.averageMetrics.reliability * 100).toFixed(0)}%
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-neon-green font-bold">Key Insights:</div>
              <ul className="text-sm text-gray-300 space-y-1">
                {comparison.insights.map((insight: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-neon-blue">▸</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Best Agent Highlight */}
      {evaluations.length > 0 && (
        <div className="mt-6 p-4 bg-gray-800/50 border-2 border-gray-600 rounded-lg">
          <p className="text-gray-300 font-bold text-center">
            Most Reliable Agent:{' '}
            <span className="text-white">
              {evaluations.reduce((best, current) =>
                current.reliability > best.reliability ? current : best
              ).agentName}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

