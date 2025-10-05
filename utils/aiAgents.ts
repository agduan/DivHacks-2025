import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FinancialData, TimelinePrediction } from '@/types/financial';

// Initialize AI clients (only if API keys exist)
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const googleAI = process.env.GOOGLE_AI_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  : null;

// Create a prompt for financial prediction
function createFinancialPrompt(data: FinancialData, timeline: TimelinePrediction[]): string {
  return `You are a financial advisor AI. Analyze this financial situation and provide insights.

Current Financial Data:
- Monthly Income: $${data.monthlyIncome}
- Monthly Expenses: $${Object.values(data.monthlyExpenses).reduce((a, b) => a + b, 0)}
- Current Savings: $${data.currentSavings}
- Current Debt: $${data.currentDebt}

Projected Timeline (Status Quo):
- Starting Net Worth: $${timeline[0].netWorth}
- Ending Net Worth (${timeline.length} months): $${timeline[timeline.length - 1].netWorth}

Provide:
1. Two key insights about their financial trajectory (each under 15 words)
2. A confidence score (0-1) for your prediction
3. Brief reasoning for your assessment (under 30 words)

Format your response as JSON:
{
  "insights": ["insight 1", "insight 2"],
  "confidence": 0.85,
  "reasoning": "your reasoning here"
}`;
}

// GPT-4 Analysis
export async function analyzeWithGPT4(
  data: FinancialData,
  timeline: TimelinePrediction[]
): Promise<{ insights: string[]; confidence: number; reasoning: string } | null> {
  if (!openai) {
    console.warn('OpenAI API key not configured');
    return null;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a financial advisor providing brief, actionable insights. Always respond in valid JSON format.',
        },
        {
          role: 'user',
          content: createFinancialPrompt(data, timeline),
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const content = response.choices[0].message.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('GPT-4 error:', error);
    return null;
  }
}

// Claude Analysis
export async function analyzeWithClaude(
  data: FinancialData,
  timeline: TimelinePrediction[]
): Promise<{ insights: string[]; confidence: number; reasoning: string } | null> {
  if (!anthropic) {
    console.warn('Anthropic API key not configured');
    return null;
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: createFinancialPrompt(data, timeline),
        },
      ],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Claude error:', error);
    return null;
  }
}

// Gemini Analysis
export async function analyzeWithGemini(
  data: FinancialData,
  timeline: TimelinePrediction[]
): Promise<{ insights: string[]; confidence: number; reasoning: string } | null> {
  if (!googleAI) {
    console.warn('Google AI API key not configured');
    return null;
  }

  try {
    const model = googleAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(createFinancialPrompt(data, timeline));
    const response = await result.response;
    const content = response.text();
    
    return JSON.parse(content);
  } catch (error) {
    console.error('Gemini error:', error);
    return null;
  }
}

// Generate slight prediction variations for demo purposes
export function generatePredictionVariation(
  timeline: TimelinePrediction[],
  factor: number
): TimelinePrediction[] {
  return timeline.map((point) => ({
    ...point,
    netWorth: Math.round(point.netWorth * factor),
    savings: Math.round(point.savings * factor),
    debt: Math.round(point.debt * (2 - factor)), // Inverse relationship with savings
    totalSpent: Math.round(point.totalSpent * factor),
    totalSaved: Math.round(point.totalSaved * factor),
  }));
}
