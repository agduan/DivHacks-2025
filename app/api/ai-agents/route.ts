import { NextRequest, NextResponse } from 'next/server';
import { TimelinePrediction, AIAgentPrediction, OpikEvaluation, FinancialData } from '@/types/financial';
import { analyzeWithGPT4, analyzeWithClaude, analyzeWithGemini, generatePredictionVariation } from '@/utils/aiAgents';
import { evaluateAgentPredictions, trackPrediction } from '@/utils/opikEvaluation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { statusQuoTimeline, financialData } = body as {
      statusQuoTimeline: TimelinePrediction[];
      financialData: FinancialData;
    };

    const agents: AIAgentPrediction[] = [];
    
    // Try to get real AI predictions (fallback to mock if APIs not configured)
    
    // GPT-4 Analysis
    const gpt4Analysis = await analyzeWithGPT4(financialData, statusQuoTimeline);
    agents.push({
      agentName: 'GPT-4',
      predictions: generatePredictionVariation(statusQuoTimeline, 1.05),
      confidence: gpt4Analysis?.confidence || 0.87,
      insights: gpt4Analysis?.insights || [
        'Strong growth potential identified',
        'Consider tax-advantaged accounts',
      ],
      reasoning: gpt4Analysis?.reasoning || 'Based on historical spending patterns and income stability',
    });

    // Claude Analysis
    const claudeAnalysis = await analyzeWithClaude(financialData, statusQuoTimeline);
    agents.push({
      agentName: 'Claude',
      predictions: statusQuoTimeline,
      confidence: claudeAnalysis?.confidence || 0.92,
      insights: claudeAnalysis?.insights || [
        'Balanced financial trajectory',
        'Emergency fund adequacy confirmed',
      ],
      reasoning: claudeAnalysis?.reasoning || 'Conservative estimate based on median outcomes',
    });

    // Gemini Analysis
    const geminiAnalysis = await analyzeWithGemini(financialData, statusQuoTimeline);
    agents.push({
      agentName: 'Gemini',
      predictions: generatePredictionVariation(statusQuoTimeline, 0.95),
      confidence: geminiAnalysis?.confidence || 0.84,
      insights: geminiAnalysis?.insights || [
        'Market volatility factors considered',
        'Diversification recommended',
      ],
      reasoning: geminiAnalysis?.reasoning || 'Risk-adjusted projections with market conditions',
    });

    // Evaluate all agents using Opik
    const evaluations = await evaluateAgentPredictions(agents);

    // Track predictions for longitudinal analysis
    for (const agent of agents) {
      await trackPrediction(agent.agentName, agent);
    }

    return NextResponse.json({
      agents,
      evaluations,
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

