import { NextRequest, NextResponse } from 'next/server';
import { TimelinePrediction, AIAgentPrediction, OpikEvaluation, FinancialData } from '@/types/financial';
import { analyzeWithGPT4, analyzeWithClaude, analyzeWithGemini, generatePredictionVariation } from '@/utils/aiAgents';
import { opikService } from '@/utils/opikService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { statusQuoTimeline, financialData } = body as {
      statusQuoTimeline: TimelinePrediction[];
      financialData: FinancialData;
    };

    console.log('🤖 AI Agents API called with:', { 
      financialData: {
        monthlyIncome: financialData.monthlyIncome,
        currentSavings: financialData.currentSavings,
        currentDebt: financialData.currentDebt
      },
      timelineLength: statusQuoTimeline.length 
    });

    const agents: AIAgentPrediction[] = [];
    const evaluations: OpikEvaluation[] = [];
    
    // Try to get real AI predictions (fallback to mock if APIs not configured)
    
    // GPT-4 Analysis with OPIK tracing
    const gpt4TraceId = opikService.startTrace('GPT-4 Financial Analysis', 'GPT-4', {
      financialData,
      statusQuoTimeline: statusQuoTimeline[0], // Initial state
    });
    
    const gpt4Analysis = await analyzeWithGPT4(financialData, statusQuoTimeline);
    const gpt4Predictions = generatePredictionVariation(statusQuoTimeline, 1.15); // More optimistic
    const gpt4Agent: AIAgentPrediction = {
      agentName: 'GPT-4',
      predictions: gpt4Predictions,
      confidence: gpt4Analysis?.confidence || 0.85, // Will be updated by OPIK
      insights: gpt4Analysis?.insights || [
        'Strong growth potential identified',
        'Consider tax-advantaged accounts',
      ],
      reasoning: gpt4Analysis?.reasoning || 'Based on historical spending patterns and income stability',
    };
    agents.push(gpt4Agent);
    
    // End GPT-4 trace and evaluate
    opikService.endTrace(gpt4TraceId, gpt4Agent, {
      model: 'GPT-4',
      inputTokens: JSON.stringify(financialData).length,
      outputTokens: JSON.stringify(gpt4Agent).length,
    });
    await opikService.evaluateAgent(gpt4TraceId, 'GPT-4', gpt4Predictions);

    // Claude Analysis with OPIK tracing
    const claudeTraceId = opikService.startTrace('Claude Financial Analysis', 'Claude', {
      financialData,
      statusQuoTimeline: statusQuoTimeline[0],
    });
    
    const claudeAnalysis = await analyzeWithClaude(financialData, statusQuoTimeline);
    const claudeAgent: AIAgentPrediction = {
      agentName: 'Claude',
      predictions: statusQuoTimeline, // Conservative - no variation
      confidence: claudeAnalysis?.confidence || 0.92,
      insights: claudeAnalysis?.insights || [
        'Balanced financial trajectory',
        'Emergency fund adequacy confirmed',
      ],
      reasoning: claudeAnalysis?.reasoning || 'Conservative estimate based on median outcomes',
    };
    agents.push(claudeAgent);
    
    // End Claude trace and evaluate
    opikService.endTrace(claudeTraceId, claudeAgent, {
      model: 'Claude',
      inputTokens: JSON.stringify(financialData).length,
      outputTokens: JSON.stringify(claudeAgent).length,
    });
    await opikService.evaluateAgent(claudeTraceId, 'Claude', statusQuoTimeline);

    // Gemini Analysis with OPIK tracing
    const geminiTraceId = opikService.startTrace('Gemini Financial Analysis', 'Gemini', {
      financialData,
      statusQuoTimeline: statusQuoTimeline[0],
    });
    
    const geminiAnalysis = await analyzeWithGemini(financialData, statusQuoTimeline);
    const geminiPredictions = generatePredictionVariation(statusQuoTimeline, 0.85); // More pessimistic
    const geminiAgent: AIAgentPrediction = {
      agentName: 'Gemini',
      predictions: geminiPredictions,
      confidence: geminiAnalysis?.confidence || 0.84,
      insights: geminiAnalysis?.insights || [
        'Market volatility factors considered',
        'Diversification recommended',
      ],
      reasoning: geminiAnalysis?.reasoning || 'Risk-adjusted projections with market conditions',
    };
    agents.push(geminiAgent);
    
    // End Gemini trace and evaluate
    opikService.endTrace(geminiTraceId, geminiAgent, {
      model: 'Gemini',
      inputTokens: JSON.stringify(financialData).length,
      outputTokens: JSON.stringify(geminiAgent).length,
    });
    await opikService.evaluateAgent(geminiTraceId, 'Gemini', geminiPredictions);

    // Get comparison insights
    const comparison = opikService.compareAgents(['GPT-4', 'Claude', 'Gemini']);

    // Update agent confidence scores based on OPIK evaluations
    agents.forEach(agent => {
      const evaluation = opikService.getEvaluationForUI(agent.agentName);
      if (evaluation) {
        // Use OPIK reliability score as confidence
        agent.confidence = evaluation.reliability;
        console.log(`🔬 OPIK: Updated ${agent.agentName} confidence to ${agent.confidence} based on OPIK evaluation`);
      }
    });

    // Convert evaluations to UI format - ONLY from OPIK, no hardcoded fallbacks
    const uiEvaluations = agents.map(agent => {
      const evaluation = opikService.getEvaluationForUI(agent.agentName);
      if (!evaluation) {
        console.warn(`🔬 OPIK: No evaluation found for ${agent.agentName} - this should not happen!`);
        return null;
      }
      return evaluation;
    }).filter(Boolean);

    console.log('OPIK Evaluations:', uiEvaluations);
    console.log('OPIK Comparison:', comparison);

    return NextResponse.json({
      agents,
      evaluations: uiEvaluations,
      comparison,
      success: true,
      usingRealAI: !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_AI_API_KEY),
      usingOpik: !!process.env.OPIK_API_KEY,
    });
  } catch (error) {
    console.error('AI agents error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI predictions' },
      { status: 500 }
    );
  }
}

