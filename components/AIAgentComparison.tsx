'use client';

import { AIAgentPrediction, OpikEvaluation } from '@/types/financial';

interface AIAgentComparisonProps {
  agents: AIAgentPrediction[];
  evaluations: OpikEvaluation[];
  loading?: boolean;
}

export default function AIAgentComparison({ agents, evaluations, loading = false }: AIAgentComparisonProps) {
  return (
    <div className="bg-retro-gray p-6 rounded-lg border-2 border-neon-purple/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neon-purple uppercase tracking-wider">
          AI Agent Comparison
        </h2>
        {loading && (
          <div className="flex items-center gap-2 text-neon-blue">
            <span className="animate-spin">⏳</span>
            <span className="text-sm">Loading AI predictions...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent, index) => {
          const evaluation = evaluations.find((e) => e.agentName === agent.agentName);
          const finalPrediction = agent.predictions[agent.predictions.length - 1];

          return (
            <div
              key={agent.agentName}
              className="bg-retro-darker p-4 rounded-lg border border-neon-green/50 space-y-3"
            >
              {/* Agent Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-neon-blue">{agent.agentName}</h3>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-neon-blue">Confidence:</span>
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
                    ${finalPrediction.netWorth.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neon-purple">Savings:</span>
                  <span className="text-neon-blue font-bold">
                    ${finalPrediction.savings.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neon-pink">Debt:</span>
                  <span className="text-neon-pink font-bold">
                    ${finalPrediction.debt.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Insights */}
              <div className="space-y-1">
                <p className="text-xs text-neon-purple uppercase tracking-wide font-bold">Key Insights:</p>
                <ul className="text-xs text-neon-green space-y-1">
                  {agent.insights.slice(0, 2).map((insight, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-neon-green">▸</span>
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

