export interface FinancialData {
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
}

export interface ScenarioChange {
  category: keyof FinancialData['monthlyExpenses'] | 'income' | 'savings';
  changePercent?: number;
  changeAmount?: number;
}

export interface TimelinePrediction {
  month: number;
  netWorth: number;
  savings: number;
  debt: number;
  totalSpent: number;
  totalSaved: number;
}

export interface AIAgentPrediction {
  agentName: string;
  predictions: TimelinePrediction[];
  confidence: number;
  insights: string[];
  reasoning?: string;
}

export interface OpikEvaluation {
  agentName: string;
  consistency: number;
  accuracy: number;
  reliability: number;
  notes: string[];
}

export type AvatarState = 'struggling' | 'stable' | 'thriving' | 'wealthy';

