/**
 * Gemini AI with Three Distinct Personalities
 * Each provides financial analysis with a unique tone and perspective
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { FinancialData, TimelinePrediction, AIAgentPrediction } from '@/types/financial';
import { API_CONFIG } from '@/config';
import { monitoring, logger } from './monitoring';

const SERVICE_NAME = 'GeminiPersonalities';

// Initialize Gemini client
const googleClient = API_CONFIG.google.apiKey
  ? new GoogleGenerativeAI(API_CONFIG.google.apiKey)
  : null;

// ==================== PERSONALITY DEFINITIONS ====================

const PERSONALITIES = {
  realist: {
    name: 'Casey the Calculator',
    emoji: '💼',
    systemPrompt: `You are Casey the Calculator, a professional financial advisor who focuses on realistic, sustainable plans. You're honest but supportive, emphasizing budgeting, steady investing, and long-term goals. 

Your tone is calm, pragmatic, and data-driven - like a seasoned financial planner or accountant. You provide rational, conservative advice that's grounded in practical financial principles.

When analyzing financial situations:
- Focus on sustainable, achievable changes
- Emphasize the importance of consistent, small improvements
- Use real numbers and percentages
- Avoid overpromising or hype
- Be supportive but realistic about challenges

Example style: "Cutting takeout by 15% will save you about $85 a month. Let's redirect that to a Roth IRA—small, steady wins add up."`,
  },
  
  optimist: {
    name: 'Sunny Saver',
    emoji: '🚀',
    systemPrompt: `You're Sunny Saver, a motivational financial coach who uses upbeat, energetic language to inspire users to build wealth and take positive financial actions.

Your tone is energetic, encouraging, and gamified - like a hype coach or positive YouTuber. You inspire users to dream bigger and feel excited about change while keeping advice practical.

When analyzing financial situations:
- Celebrate wins and progress
- Use energetic, positive language
- Frame challenges as opportunities
- Encourage ambitious but achievable goals
- Make finance feel exciting and empowering

Example style: "You're so close to hitting your savings milestone! Trim 10% from your entertainment budget and that future-you will be thriving."`,
  },
  
  cynic: {
    name: 'Grump Gains',
    emoji: '🔥',
    systemPrompt: `You are Grump Gains, a brutally honest financial advisor with a sharp wit. You don't sugarcoat. You use dry humor and sarcasm to motivate users to make better financial choices.

Your tone is blunt, sarcastic, and no-nonsense - think Gordon Ramsay meets Wall Street, but still ethical. You use humor and tough love to push users toward smarter behavior.

When analyzing financial situations:
- Be direct and call out questionable spending
- Use witty, sarcastic observations
- Point out obvious financial mistakes with humor
- Still provide actionable advice despite the snark
- Make users laugh while making them think

Example style: "You spent $400 on coffee this month. Unless you own the café, that's not an investment."`,
  },
};

// ==================== PROMPT GENERATION ====================

function createPersonalityPrompt(
  personality: keyof typeof PERSONALITIES,
  data: FinancialData,
  timeline: TimelinePrediction[]
): string {
  const totalExpenses = Object.values(data.monthlyExpenses).reduce((a, b) => a + b, 0);
  const netMonthly = data.monthlyIncome - totalExpenses;
  const finalNetWorth = timeline[timeline.length - 1].netWorth;
  const initialNetWorth = timeline[0].netWorth;
  const netWorthChange = finalNetWorth - initialNetWorth;

  return `${PERSONALITIES[personality].systemPrompt}

Analyze this financial situation and provide insights in your unique voice:

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

Projected Timeline (${timeline.length} months):
- Starting Net Worth: $${initialNetWorth.toLocaleString()}
- Ending Net Worth: $${finalNetWorth.toLocaleString()}
- Total Change: $${netWorthChange.toLocaleString()}

Provide your analysis with:
1. Two key insights about their financial situation (stay in character!). Feel free to be more expressive and specific.
2. A confidence score (0-1) for your prediction
3. Brief reasoning for your assessment

Format your response as JSON:
{
  "insights": ["insight 1", "insight 2"],
  "confidence": 0.85,
  "reasoning": "your reasoning here"
}

IMPORTANT: 
- Stay in character for your personality
- Keep insights concise but expressive (under 35 words each)
- Make reasoning brief (under 80 words)
- Return ONLY valid JSON, no other text`;
}

// ==================== GEMINI API CALL ====================

async function analyzeWithGeminiPersonality(
  personality: keyof typeof PERSONALITIES,
  data: FinancialData,
  timeline: TimelinePrediction[]
): Promise<{
  insights: string[];
  confidence: number;
  reasoning: string;
} | null> {
  if (!googleClient) {
    logger.warn(SERVICE_NAME, 'Gemini API key not configured');
    return null;
  }

  const startTime = Date.now();

  try {
    logger.info(SERVICE_NAME, `Requesting analysis from ${PERSONALITIES[personality].emoji} ${PERSONALITIES[personality].name}`);

    const model = googleClient.getGenerativeModel({ 
      model: API_CONFIG.google.model,
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });
    const prompt = createPersonalityPrompt(personality, data, timeline);
    
    logger.info(SERVICE_NAME, `Calling Gemini with model: ${API_CONFIG.google.model}`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    logger.info(SERVICE_NAME, `Received response from ${personality}: ${content.substring(0, 100)}...`);

    // Try to extract JSON from the response
    let parsed;
    try {
      // Clean up the content first
      let cleanContent = content.trim();
      
      // Remove markdown code blocks
      if (cleanContent.includes('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }
      if (cleanContent.includes('```')) {
        cleanContent = cleanContent.replace(/```\n?/g, '').trim();
      }
      
      // Try to find JSON object
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : cleanContent;
      
      parsed = JSON.parse(jsonText);
      
      // Validate the response has required fields
      if (!parsed.insights || !Array.isArray(parsed.insights) || !parsed.confidence || !parsed.reasoning) {
        throw new Error('Response missing required fields');
      }
      
      // Ensure insights is an array of strings
      if (!parsed.insights.every((insight: any) => typeof insight === 'string')) {
        throw new Error('Insights must be an array of strings');
      }
      
      // Ensure confidence is a number between 0 and 1
      if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
        parsed.confidence = 0.5; // Default confidence
      }
      
    } catch (parseError) {
      logger.warn(SERVICE_NAME, `Failed to parse JSON from ${personality}, using fallback`, {
        content: content.substring(0, 200),
        error: parseError instanceof Error ? parseError.message : 'Unknown error',
      });
      // Create fallback based on personality
      parsed = createFallbackResponse(personality, data, timeline);
    }

    // Track success
    monitoring.trackAPICall({
      service: `Gemini-${personality}`,
      endpoint: '/generateContent',
      method: 'POST',
      duration: Date.now() - startTime,
      status: 200,
      success: true,
      cached: false,
    });

    return parsed;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(SERVICE_NAME, `${personality} analysis failed: ${errorMessage}`, error as Error);
    
    // Check for common API errors
    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('401')) {
      logger.error(SERVICE_NAME, 'Gemini API key is invalid or expired');
    } else if (errorMessage.includes('QUOTA_EXCEEDED') || errorMessage.includes('429')) {
      logger.error(SERVICE_NAME, 'Gemini API quota exceeded');
    } else if (errorMessage.includes('models/') || errorMessage.includes('404')) {
      logger.error(SERVICE_NAME, `Model ${API_CONFIG.google.model} not found. Try 'gemini-1.5-flash' or 'gemini-1.5-pro'`);
    }
    
    monitoring.trackAPICall({
      service: `Gemini-${personality}`,
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

// ==================== FALLBACK RESPONSES ====================

function createFallbackResponse(
  personality: keyof typeof PERSONALITIES,
  data: FinancialData,
  timeline: TimelinePrediction[]
): {
  insights: string[];
  confidence: number;
  reasoning: string;
} {
  const totalExpenses = Object.values(data.monthlyExpenses).reduce((a, b) => a + b, 0);
  const netMonthly = data.monthlyIncome - totalExpenses;
  const savingsRate = (netMonthly / data.monthlyIncome) * 100;
  
  const finalNetWorth = timeline[timeline.length - 1].netWorth;
  const change = finalNetWorth - timeline[0].netWorth;

  switch (personality) {
    case 'realist':
      return {
        insights: [
          `Your ${savingsRate.toFixed(0)}% savings rate is ${savingsRate > 20 ? 'solid' : 'a good starting point'}`,
          `Net worth projected to ${change > 0 ? 'increase' : 'decrease'} by $${Math.abs(change).toLocaleString()}`,
        ],
        confidence: 0.75,
        reasoning: 'Conservative analysis based on your current spending patterns and income stability',
      };
    
    case 'optimist':
      return {
        insights: [
          `You're building momentum with $${Math.abs(netMonthly).toLocaleString()} ${netMonthly > 0 ? 'saved' : 'to optimize'} monthly!`,
          `${timeline.length} months from now, you could be $${Math.abs(change).toLocaleString()} ${change > 0 ? 'richer' : 'better positioned'}!`,
        ],
        confidence: 0.82,
        reasoning: 'With focused effort, your financial trajectory looks promising!',
      };
    
    case 'cynic':
      return {
        insights: [
          data.monthlyExpenses.entertainment > data.monthlyIncome * 0.1
            ? `Entertainment is ${((data.monthlyExpenses.entertainment / data.monthlyIncome) * 100).toFixed(0)}% of income. Netflix doesn't count as diversifying.`
            : `At least you're not spending rent money on DoorDash. Yet.`,
          data.currentDebt > data.currentSavings
            ? `More debt than savings. Bold strategy, let's see if it pays off.`
            : `You've got $${Math.abs(netMonthly).toLocaleString()} monthly to work with. Don't blow it.`,
        ],
        confidence: 0.70,
        reasoning: 'The math doesn\'t lie, even if your budget does.',
      };
  }
}

// ==================== MAIN EXPORT ====================

/**
 * Get analyses from all three Gemini personalities
 */
export async function getThreePersonalityAnalyses(
  data: FinancialData,
  timeline: TimelinePrediction[]
): Promise<AIAgentPrediction[]> {
  
  logger.info(SERVICE_NAME, 'Requesting analyses from all three personalities');

  const personalities: Array<keyof typeof PERSONALITIES> = ['realist', 'optimist', 'cynic'];
  const predictions: AIAgentPrediction[] = [];

  // Run all personalities in parallel for better performance
  const analysisPromises = personalities.map(async (personality) => {
    const analysis = await analyzeWithGeminiPersonality(personality, data, timeline);
    
    if (analysis) {
      return {
        agentName: `${PERSONALITIES[personality].name}`,
        predictions: timeline,
        confidence: analysis.confidence,
        insights: analysis.insights,
        reasoning: analysis.reasoning,
      };
    } else {
      // Use fallback
      const fallback = createFallbackResponse(personality, data, timeline);
      return {
        agentName: `${PERSONALITIES[personality].name}`,
        predictions: timeline,
        confidence: fallback.confidence,
        insights: fallback.insights,
        reasoning: fallback.reasoning,
      };
    }
  });

  const results = await Promise.all(analysisPromises);
  predictions.push(...results);

  logger.info(SERVICE_NAME, `Completed analyses from ${predictions.length} personalities`);
  
  return predictions;
}
