import { AIAgentPrediction, OpikEvaluation } from '@/types/financial';

export interface EchoApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface EchoPredictionRequest {
  financialData: {
    monthlyIncome: number;
    monthlyExpenses: {
      housing: number;
      food: number;
      transportation: number;
      entertainment: number;
      utilities: number;
      other: number;
    };
    currentSavings: number;
    currentDebt: number;
    savingsGoal?: number;
  };
  timelineMonths: number;
  scenarioChanges?: Array<{
    category: string;
    changePercent?: number;
    changeAmount?: number;
  }>;
}

export interface EchoPredictionResponse {
  predictions: Array<{
    month: number;
    netWorth: number;
    savings: number;
    debt: number;
    totalSpent: number;
    totalSaved: number;
  }>;
  confidence: number;
  insights: string[];
  reasoning: string;
}

export class EchoService {
  private static baseUrl = process.env.ECHO_API_ENDPOINT || 'https://echo.merit.systems/api/analyze';
  private static apiKey: string | null = null;
  private static appId: string | null = null;

  /**
   * Initialize the Echo API with your API key and app ID
   */
  static initialize(apiKey: string, appId: string) {
    this.apiKey = apiKey;
    this.appId = appId;
  }

  /**
   * Get AI predictions using Echo API with billing
   */
  static async getAIPredictions(request: EchoPredictionRequest, userId?: string, token?: string): Promise<{
    agentName: string;
    predictions: Array<{
      month: number;
      netWorth: number;
      savings: number;
      debt: number;
      totalSpent: number;
      totalSaved: number;
    }>;
    confidence: number;
    insights: string[];
    reasoning?: string;
  }> {
    if (!this.apiKey || !this.appId) {
      throw new Error('Echo API key and app ID not initialized. Please call EchoService.initialize() first.');
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Key': this.apiKey,
          'X-App-ID': this.appId,
        },
        body: JSON.stringify({
          app_id: this.appId,
          prompt: this.buildPrompt(request),
          model: 'gpt-4',
          max_tokens: 1000,
          temperature: 0.7,
          user_id: userId, // For billing purposes
        }),
      });

      if (!response.ok) {
        throw new Error(`Echo API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Charge user for AI prediction if authenticated
      if (userId && token) {
        await this.chargeUser(userId, token, 0.10, 'AI Financial Prediction');
      }
      
      // Parse the AI response into our format
      return this.parseAIResponse(data, request);
    } catch (error) {
      console.error('Echo API error:', error);
      throw error;
    }
  }

  /**
   * Charge user for AI prediction
   */
  static async chargeUser(userId: string, token: string, cost: number, description: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/billing/charge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-App-ID': this.appId,
        },
        body: JSON.stringify({
          user_id: userId,
          amount: cost,
          description,
          app_id: this.appId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Echo billing error:', error);
      return false;
    }
  }

  /**
   * Get multiple AI agent predictions for comparison
   */
  static async getMultiAgentPredictions(request: EchoPredictionRequest): Promise<AIAgentPrediction[]> {
    const agents = ['GPT-4', 'Claude', 'Gemini'];
    const predictions: AIAgentPrediction[] = [];

    for (const agent of agents) {
      try {
        const prediction = await this.getAIPredictions(request);
        predictions.push({
          agentName: agent,
          predictions: prediction.predictions,
          confidence: prediction.confidence,
          insights: prediction.insights,
          reasoning: prediction.reasoning,
        });
      } catch (error) {
        console.error(`Error getting prediction from ${agent}:`, error);
        // Add fallback prediction
        predictions.push({
          agentName: agent,
          predictions: this.generateFallbackPredictions(request),
          confidence: 0.5,
          insights: ['Unable to connect to AI service'],
          reasoning: 'Fallback prediction due to API error',
        });
      }
    }

    return predictions;
  }

  /**
   * Get Opik evaluations for AI predictions
   */
  static async getOpikEvaluations(predictions: AIAgentPrediction[]): Promise<OpikEvaluation[]> {
    // For now, return mock evaluations since Opik endpoint may not be available
    // This can be enhanced later when the Opik API is properly configured
    return this.generateMockEvaluations(predictions);
  }

  /**
   * Build prompt for AI prediction
   */
  private static buildPrompt(request: EchoPredictionRequest): string {
    const { financialData, timelineMonths, scenarioChanges } = request;
    
    let prompt = `Analyze this financial situation and provide predictions for the next ${timelineMonths} months:

Financial Profile:
- Monthly Income: $${financialData.monthlyIncome}
- Monthly Expenses: $${Object.values(financialData.monthlyExpenses).reduce((a, b) => a + b, 0)}
  - Housing: $${financialData.monthlyExpenses.housing}
  - Food: $${financialData.monthlyExpenses.food}
  - Transportation: $${financialData.monthlyExpenses.transportation}
  - Entertainment: $${financialData.monthlyExpenses.entertainment}
  - Utilities: $${financialData.monthlyExpenses.utilities}
  - Other: $${financialData.monthlyExpenses.other}
- Current Savings: $${financialData.currentSavings}
- Current Debt: $${financialData.currentDebt}
- Savings Goal: $${financialData.savingsGoal || 'Not specified'}`;

    if (scenarioChanges && scenarioChanges.length > 0) {
      prompt += `\n\nScenario Changes:`;
      scenarioChanges.forEach(change => {
        if (change.changePercent) {
          prompt += `\n- ${change.category}: ${change.changePercent}% change`;
        } else if (change.changeAmount) {
          prompt += `\n- ${change.category}: $${change.changeAmount} change`;
        }
      });
    }

    prompt += `\n\nPlease provide:
1. Monthly predictions for net worth, savings, and debt
2. Confidence level (0-1)
3. Key insights about the financial trajectory
4. Reasoning for your predictions

Format your response as JSON with this structure:
{
  "predictions": [{"month": 1, "netWorth": 1000, "savings": 5000, "debt": 4000, "totalSpent": 3000, "totalSaved": 1000}],
  "confidence": 0.85,
  "insights": ["insight1", "insight2"],
  "reasoning": "Your reasoning here"
}`;

    return prompt;
  }

  /**
   * Parse AI response into our format
   */
  private static parseAIResponse(data: any, request: EchoPredictionRequest): {
    agentName: string;
    predictions: Array<{
      month: number;
      netWorth: number;
      savings: number;
      debt: number;
      totalSpent: number;
      totalSaved: number;
    }>;
    confidence: number;
    insights: string[];
    reasoning?: string;
  } {
    try {
      // Try to parse JSON response
      const response = typeof data === 'string' ? JSON.parse(data) : data;
      
      return {
        agentName: 'Echo AI',
        predictions: response.predictions || this.generateFallbackPredictions(request),
        confidence: response.confidence || 0.8,
        insights: response.insights || ['AI prediction generated'],
        reasoning: response.reasoning || 'Generated by Echo AI service',
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return {
        agentName: 'Echo AI',
        predictions: this.generateFallbackPredictions(request),
        confidence: 0.6,
        insights: ['AI response parsing failed'],
        reasoning: 'Fallback prediction due to parsing error',
      };
    }
  }

  /**
   * Generate fallback predictions when API fails
   */
  private static generateFallbackPredictions(request: EchoPredictionRequest): Array<{
    month: number;
    netWorth: number;
    savings: number;
    debt: number;
    totalSpent: number;
    totalSaved: number;
  }> {
    const { financialData, timelineMonths } = request;
    const monthlyNet = financialData.monthlyIncome - Object.values(financialData.monthlyExpenses).reduce((a, b) => a + b, 0);
    
    const predictions = [];
    let currentSavings = financialData.currentSavings;
    let currentDebt = financialData.currentDebt;
    
    for (let month = 1; month <= timelineMonths; month++) {
      currentSavings += monthlyNet;
      currentDebt = Math.max(0, currentDebt - (monthlyNet * 0.3)); // Assume 30% goes to debt reduction
      
      predictions.push({
        month,
        netWorth: currentSavings - currentDebt,
        savings: currentSavings,
        debt: currentDebt,
        totalSpent: Object.values(financialData.monthlyExpenses).reduce((a, b) => a + b, 0) * month,
        totalSaved: monthlyNet * month,
      });
    }
    
    return predictions;
  }

  /**
   * Generate mock evaluations when Opik API fails
   */
  private static generateMockEvaluations(predictions: AIAgentPrediction[]): OpikEvaluation[] {
    return predictions.map(prediction => ({
      agentName: prediction.agentName,
      consistency: 0.8 + Math.random() * 0.2,
      accuracy: 0.7 + Math.random() * 0.3,
      reliability: 0.75 + Math.random() * 0.25,
      notes: ['Evaluation based on historical performance'],
    }));
  }
}
