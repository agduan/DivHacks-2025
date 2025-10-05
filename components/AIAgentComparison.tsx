'use client';

import { AIAgentPrediction, OpikEvaluation } from '@/types/financial';

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
        headerText: 'text-neon-blue',
        border: 'border-neon-blue/50',
        bullet: 'text-neon-blue',
        confidenceLabel: 'text-neon-blue',
      };
    }
    if (agentName.includes('Sunny Saver')) {
      return {
        headerText: 'text-neon-green',
        border: 'border-neon-green/50',
        bullet: 'text-neon-green',
        confidenceLabel: 'text-neon-green',
      };
    }
    // Grump Gains (default)
    return {
      headerText: 'text-neon-pink',
      border: 'border-neon-pink/50',
      bullet: 'text-neon-pink',
      confidenceLabel: 'text-neon-pink',
    };
  };

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
        {agents.map((agent, index) => {
          const evaluation = evaluations.find((e) => e.agentName === agent.agentName);
          const finalPrediction = agent.predictions[agent.predictions.length - 1];

          const colors = getAgentColors(agent.agentName);
          return (
            <div
              key={agent.agentName}
              className={`bg-retro-darker p-4 rounded-lg border ${colors.border} space-y-3`}
            >
              {/* Agent Header */}
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-bold ${colors.headerText}`}>{agent.agentName}</h3>
                <div className="flex items-center gap-1">
                  <span className={`text-xs ${colors.confidenceLabel}`}>Confidence:</span>
                  <span className="text-sm font-bold text-neon-green">
                    {(agent.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Predictions */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neon-blue">Net Worth:</span>
                  <span className="text-neon-green font-bold">
                    ${finalPrediction.netWorth.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neon-purple">Savings:</span>
                  <span className="text-neon-blue font-bold">
                    ${finalPrediction.savings.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neon-pink">Debt:</span>
                  <span className="text-neon-pink font-bold">
                    ${finalPrediction.debt.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Insights */}
              <div className="space-y-1">
                <p className="text-xs text-neon-purple uppercase tracking-wide font-bold">Key Insights:</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  {agent.insights.slice(0, 2).map((insight, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className={`${colors.bullet}`}>▸</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Evaluation */}
              {evaluation && (
                <div className="pt-3 border-t border-neon-purple/30 space-y-2">
                  <p className="text-xs text-neon-purple uppercase tracking-wide font-bold">
                    Opik Evaluation
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-neon-blue">Consistency</div>
                      <div className="text-neon-green font-bold">
                        {(evaluation.consistency * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-neon-purple">Accuracy</div>
                      <div className="text-neon-blue font-bold">
                        {(evaluation.accuracy * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-neon-pink">Reliability</div>
                      <div className="text-neon-purple font-bold">
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
        <div className="mt-6 p-4 bg-neon-green/10 border-2 border-neon-green rounded-lg">
          <p className="text-neon-green font-bold text-center">
            Most Reliable Agent:{' '}
            {evaluations.reduce((best, current) =>
              current.reliability > best.reliability ? current : best
            ).agentName}
          </p>
        </div>
      )}
    </div>
  );
}

