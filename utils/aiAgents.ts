/**
 * AI Agent Service
 * Properly integrated with OpenAI, Anthropic (Claude), and Google (Gemini)
 * Each agent is actually a different AI model, not fake variations
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FinancialData, TimelinePrediction, AIAgentPrediction } from '@/types/financial';
import { API_CONFIG, getAvailableAIAgents } from '@/config';
import { monitoring, logger } from './monitoring';
import { validateAIAgentPrediction } from './validation';

// ==================== TYPES ====================

export interface AIAnalysisRequest {
  financialData: FinancialData;
  timeline: TimelinePrediction[];
  scenarioChanges?: Array<{
    category: string;
    changePercent?: number;
    changeAmount?: number;
  }>;
}

export interface AIAnalysisResponse {
  insights: string[];
  confidence: number;
  reasoning: string;
}

// ==================== AI CLIENT INITIALIZATION ====================

// Only initialize clients if API keys are available
const openaiClient = API_CONFIG.openai.apiKey
  ? new OpenAI({ apiKey: API_CONFIG.openai.apiKey })
  : null;

const anthropicClient = API_CONFIG.anthropic.apiKey
  ? new Anthropic({ apiKey: API_CONFIG.anthropic.apiKey })
  : null;

const googleClient = API_CONFIG.google.apiKey
  ? new GoogleGenerativeAI(API_CONFIG.google.apiKey)
  : null;

// ==================== PROMPT GENERATION ====================

/**
 * Create a financial analysis prompt for AI models
 */
function createFinancialPrompt(data: FinancialData, timeline: TimelinePrediction[]): string {
  const totalExpenses = Object.values(data.monthlyExpenses).reduce((a, b) => a + b, 0);
  const netMonthly = data.monthlyIncome - totalExpenses;

  return `You are a financial advisor AI. Analyze this financial situation and provide insights.

Current Financial Data:
- Monthly Income: $${data.monthlyIncome.toLocaleString()}
- Monthly Expenses: $${totalExpenses.toLocaleString()}
  - Housing: $${data.monthlyExpenses.housing}
  - Food: $${data.monthlyExpenses.food}
  - Transportation: $${data.monthlyExpenses.transportation}
  - Entertainment: $${data.monthlyExpenses.entertainment}
  - Utilities: $${data.monthlyExpenses.utilities}
  - Other: $${data.monthlyExpenses.other}
- Net Monthly: $${netMonthly.toLocaleString()}
- Current Savings: $${data.currentSavings.toLocaleString()}
- Current Debt: $${data.currentDebt.toLocaleString()}
${data.savingsGoal ? `- Savings Goal: $${data.savingsGoal.toLocaleString()}` : ''}

Projected Timeline (Status Quo - ${timeline.length} months):
- Starting Net Worth: $${timeline[0].netWorth.toLocaleString()}
- Ending Net Worth: $${timeline[timeline.length - 1].netWorth.toLocaleString()}
- Total Change: $${(timeline[timeline.length - 1].netWorth - timeline[0].netWorth).toLocaleString()}

Provide:
1. Two key insights about their financial trajectory (each under 15 words)
2. A confidence score (0-1) for your prediction
3. Brief reasoning for your assessment (under 30 words)

Format your response as JSON:
{
  "insights": ["insight 1", "insight 2"],
  "confidence": 0.85,
  "reasoning": "your reasoning here"
}

IMPORTANT: Return ONLY valid JSON, no other text.`;
}

// ==================== GPT-4 AGENT ====================

/**
 * Analyze with GPT-4 (OpenAI)
 */
export async function analyzeWithGPT4(request: AIAnalysisRequest): Promise<AIAnalysisResponse | null> {
  if (!openaiClient) {
    logger.warn('GPT-4', 'API key not configured');
    return null;
  }

  const startTime = Date.now();

  try {
    logger.info('GPT-4', 'Requesting analysis');

    const response = await openaiClient.chat.completions.create({
      model: API_CONFIG.openai.model,
      messages: [
        {
          role: 'system',
          content: 'You are a financial advisor providing brief, actionable insights. Always respond in valid JSON format.',
        },
        {
          role: 'user',
          content: createFinancialPrompt(request.financialData, request.timeline),
        },
      ],
      temperature: API_CONFIG.openai.temperature,
      max_tokens: API_CONFIG.openai.maxTokens,
    });

    const content = response.choices[0].message.content || '{}';
    const parsed = JSON.parse(content);

    // Track success
    monitoring.trackAPICall({
      service: 'GPT-4',
      endpoint: '/chat/completions',
      method: 'POST',
      duration: Date.now() - startTime,
      status: 200,
      success: true,
      cached: false,
    });

    return parsed;
  } catch (error) {
    logger.error('GPT-4', 'Analysis failed', error as Error);
    
    monitoring.trackAPICall({
      service: 'GPT-4',
      endpoint: '/chat/completions',
      method: 'POST',
      duration: Date.now() - startTime,
      status: 500,
      success: false,
      cached: false,
    });

    return null;
  }
}

// ==================== CLAUDE AGENT ====================

/**
 * Analyze with Claude (Anthropic)
 */
export async function analyzeWithClaude(request: AIAnalysisRequest): Promise<AIAnalysisResponse | null> {
  if (!anthropicClient) {
    logger.warn('Claude', 'API key not configured');
    return null;
  }

  const startTime = Date.now();

  try {
    logger.info('Claude', 'Requesting analysis');

    const response = await anthropicClient.messages.create({
      model: API_CONFIG.anthropic.model,
      max_tokens: API_CONFIG.anthropic.maxTokens,
      messages: [
        {
          role: 'user',
          content: createFinancialPrompt(request.financialData, request.timeline),
        },
      ],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '{}';
    const parsed = JSON.parse(content);

    // Track success
    monitoring.trackAPICall({
      service: 'Claude',
      endpoint: '/messages',
      method: 'POST',
      duration: Date.now() - startTime,
      status: 200,
      success: true,
      cached: false,
    });

    return parsed;
  } catch (error) {
    logger.error('Claude', 'Analysis failed', error as Error);
    
    monitoring.trackAPICall({
      service: 'Claude',
      endpoint: '/messages',
      method: 'POST',
      duration: Date.now() - startTime,
      status: 500,
      success: false,
      cached: false,
    });

    return null;
  }
}

// ==================== GEMINI AGENT ====================

/**
 * Analyze with Gemini (Google)
 */
export async function analyzeWithGemini(request: AIAnalysisRequest): Promise<AIAnalysisResponse | null> {
  if (!googleClient) {
    logger.warn('Gemini', 'API key not configured');
    return null;
  }

  const startTime = Date.now();

  try {
    logger.info('Gemini', 'Requesting analysis');

    const model = googleClient.getGenerativeModel({ model: API_CONFIG.google.model });
    const result = await model.generateContent(createFinancialPrompt(request.financialData, request.timeline));
    const response = await result.response;
    const content = response.text();

    const parsed = JSON.parse(content);

    // Track success
    monitoring.trackAPICall({
      service: 'Gemini',
      endpoint: '/generateContent',
      method: 'POST',
      duration: Date.now() - startTime,
      status: 200,
      success: true,
      cached: false,
    });

    return parsed;
  } catch (error) {
    logger.error('Gemini', 'Analysis failed', error as Error);
    
    monitoring.trackAPICall({
      service: 'Gemini',
      endpoint: '/generateContent',
      method: 'POST',
      duration: Date.now() - startTime,
      status: 500,
      success: false,
      cached: false,
    });

    return null;
  }
}

// ==================== MULTI-AGENT PREDICTIONS ====================

/**
 * Get predictions from all available AI agents
 * This actually calls different AI models, not fake variations
 */
export async function getMultiAgentPredictions(
  financialData: FinancialData,
  timeline: TimelinePrediction[],
  scenarioChanges?: Array<{ category: string; changePercent?: number; changeAmount?: number }>
): Promise<AIAgentPrediction[]> {
  const request: AIAnalysisRequest = {
    financialData,
    timeline,
    scenarioChanges,
  };

  const predictions: AIAgentPrediction[] = [];
  const availableAgents = getAvailableAIAgents();

  logger.info('MultiAgent', `Requesting predictions from ${availableAgents.length} agents: ${availableAgents.join(', ')}`);

  // Run all agents in parallel for better performance
  const agentPromises: Promise<void>[] = [];

  // GPT-4
  if (availableAgents.includes('GPT-4')) {
    agentPromises.push(
      analyzeWithGPT4(request).then((analysis) => {
        if (analysis) {
          predictions.push({
            agentName: 'GPT-4',
            predictions: timeline, // Use actual timeline
            confidence: analysis.confidence,
            insights: analysis.insights,
            reasoning: analysis.reasoning,
          });
        } else {
          predictions.push(createFallbackPrediction('GPT-4', timeline));
        }
      })
    );
  }

  // Claude
  if (availableAgents.includes('Claude')) {
    agentPromises.push(
      analyzeWithClaude(request).then((analysis) => {
        if (analysis) {
          predictions.push({
            agentName: 'Claude',
            predictions: timeline,
            confidence: analysis.confidence,
            insights: analysis.insights,
            reasoning: analysis.reasoning,
          });
        } else {
          predictions.push(createFallbackPrediction('Claude', timeline));
        }
      })
    );
  }

  // Gemini
  if (availableAgents.includes('Gemini')) {
    agentPromises.push(
      analyzeWithGemini(request).then((analysis) => {
        if (analysis) {
          predictions.push({
            agentName: 'Gemini',
            predictions: timeline,
            confidence: analysis.confidence,
            insights: analysis.insights,
            reasoning: analysis.reasoning,
          });
        } else {
          predictions.push(createFallbackPrediction('Gemini', timeline));
        }
      })
    );
  }

  // Wait for all agents to complete
  await Promise.all(agentPromises);

  // If no agents are available, return fallback predictions for demo purposes
  if (predictions.length === 0) {
    logger.warn('MultiAgent', 'No AI agents available, using fallback predictions');
    return [
      createFallbackPrediction('GPT-4', timeline),
      createFallbackPrediction('Claude', timeline),
      createFallbackPrediction('Gemini', timeline),
    ];
  }

  logger.info('MultiAgent', `Received ${predictions.length} predictions`);
  return predictions;
}

/**
 * Create a fallback prediction when an agent fails
 */
function createFallbackPrediction(agentName: string, timeline: TimelinePrediction[]): AIAgentPrediction {
  const startNetWorth = timeline[0].netWorth;
  const endNetWorth = timeline[timeline.length - 1].netWorth;
  const change = endNetWorth - startNetWorth;
  const trend = change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable';

  return {
    agentName,
    predictions: timeline,
    confidence: 0.5,
    insights: [
      `Net worth ${trend} by $${Math.abs(change).toLocaleString()} over ${timeline.length} months`,
      `${agentName} analysis unavailable - showing baseline projection`,
    ],
    reasoning: 'AI service unavailable, showing calculated projections based on current financial data',
  };
}