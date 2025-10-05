import { FinancialData, TimelinePrediction } from '@/types/financial';

export type FinancialModel = 'linear' | 'exponential' | 'seasonal' | 'realistic' | 'conservative' | 'optimistic';

export interface ModelConfig {
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const FINANCIAL_MODELS: Record<FinancialModel, ModelConfig> = {
  linear: {
    name: 'Linear Growth',
    description: 'Steady, predictable growth',
    icon: '📈',
    color: '#4a9eff'
  },
  exponential: {
    name: 'Compound Growth',
    description: 'Exponential returns over time',
    icon: '🚀',
    color: '#5dd98a'
  },
  seasonal: {
    name: 'Seasonal Patterns',
    description: 'Accounts for seasonal variations',
    icon: '🌊',
    color: '#ffd700'
  },
  realistic: {
    name: 'Realistic Model',
    description: 'Considers market volatility',
    icon: '🎯',
    color: '#ff6b6b'
  },
  conservative: {
    name: 'Conservative',
    description: 'Lower risk, steady returns',
    icon: '🛡️',
    color: '#9c27b0'
  },
  optimistic: {
    name: 'Optimistic',
    description: 'Best-case scenario projections',
    icon: '✨',
    color: '#ff9800'
  }
};

/**
 * Linear growth model - steady, predictable growth
 */
export function calculateLinearModel(data: FinancialData, months: number): TimelinePrediction[] {
  const predictions: TimelinePrediction[] = [];
  const totalMonthlyExpenses = Object.values(data.monthlyExpenses).reduce((a, b) => a + b, 0);
  const monthlySavings = data.monthlyIncome - totalMonthlyExpenses;
  
  let currentSavings = data.currentSavings;
  let currentDebt = data.currentDebt;
  let totalSpent = 0;
  let totalSaved = 0;
  
  for (let month = 1; month <= months; month++) {
    totalSpent += totalMonthlyExpenses;
    totalSaved += monthlySavings;
    
    currentSavings += monthlySavings;
    
    // Simple debt reduction
    if (currentDebt > 0) {
      const debtPayment = Math.min(monthlySavings * 0.3, currentDebt);
      currentDebt -= debtPayment;
      currentSavings -= debtPayment;
    }
    
    predictions.push({
      month,
      netWorth: currentSavings - currentDebt,
      savings: currentSavings,
      debt: currentDebt,
      totalSpent,
      totalSaved,
    });
  }
  
  return predictions;
}

/**
 * Exponential growth model - compound returns
 */
export function calculateExponentialModel(data: FinancialData, months: number): TimelinePrediction[] {
  const predictions: TimelinePrediction[] = [];
  const totalMonthlyExpenses = Object.values(data.monthlyExpenses).reduce((a, b) => a + b, 0);
  const monthlySavings = data.monthlyIncome - totalMonthlyExpenses;
  
  let currentSavings = data.currentSavings;
  let currentDebt = data.currentDebt;
  let totalSpent = 0;
  let totalSaved = 0;
  let investmentPortfolio = 0;
  
  const monthlyReturnRate = 0.01; // 1% monthly return (12% annually)
  
  for (let month = 1; month <= months; month++) {
    totalSpent += totalMonthlyExpenses;
    totalSaved += monthlySavings;
    
    // Add to savings
    currentSavings += monthlySavings;
    
    // Compound investment growth
    investmentPortfolio *= (1 + monthlyReturnRate);
    investmentPortfolio += monthlySavings * 0.5; // 50% goes to investments
    
    // Debt reduction with compound interest
    if (currentDebt > 0) {
      const debtPayment = Math.min(monthlySavings * 0.4, currentDebt);
      currentDebt -= debtPayment;
      currentSavings -= debtPayment;
      currentDebt *= 1.02; // 2% monthly debt interest
    }
    
    predictions.push({
      month,
      netWorth: currentSavings + investmentPortfolio - currentDebt,
      savings: currentSavings + investmentPortfolio,
      debt: currentDebt,
      totalSpent,
      totalSaved,
    });
  }
  
  return predictions;
}

/**
 * Seasonal model - accounts for seasonal variations
 */
export function calculateSeasonalModel(data: FinancialData, months: number): TimelinePrediction[] {
  const predictions: TimelinePrediction[] = [];
  const totalMonthlyExpenses = Object.values(data.monthlyExpenses).reduce((a, b) => a + b, 0);
  const monthlySavings = data.monthlyIncome - totalMonthlyExpenses;
  
  let currentSavings = data.currentSavings;
  let currentDebt = data.currentDebt;
  let totalSpent = 0;
  let totalSaved = 0;
  
  for (let month = 1; month <= months; month++) {
    // Seasonal variations
    const seasonalMultiplier = getSeasonalMultiplier(month);
    const adjustedExpenses = totalMonthlyExpenses * seasonalMultiplier;
    const adjustedSavings = data.monthlyIncome - adjustedExpenses;
    
    totalSpent += adjustedExpenses;
    totalSaved += adjustedSavings;
    
    currentSavings += adjustedSavings;
    
    // Seasonal debt reduction
    if (currentDebt > 0) {
      const debtPayment = Math.min(adjustedSavings * 0.25, currentDebt);
      currentDebt -= debtPayment;
      currentSavings -= debtPayment;
    }
    
    predictions.push({
      month,
      netWorth: currentSavings - currentDebt,
      savings: currentSavings,
      debt: currentDebt,
      totalSpent,
      totalSaved,
    });
  }
  
  return predictions;
}

/**
 * Realistic model - considers market volatility
 */
export function calculateRealisticModel(data: FinancialData, months: number): TimelinePrediction[] {
  const predictions: TimelinePrediction[] = [];
  const totalMonthlyExpenses = Object.values(data.monthlyExpenses).reduce((a, b) => a + b, 0);
  const monthlySavings = data.monthlyIncome - totalMonthlyExpenses;
  
  let currentSavings = data.currentSavings;
  let currentDebt = data.currentDebt;
  let totalSpent = 0;
  let totalSaved = 0;
  let investmentPortfolio = 0;
  
  for (let month = 1; month <= months; month++) {
    totalSpent += totalMonthlyExpenses;
    totalSaved += monthlySavings;
    
    // Market volatility simulation
    const marketVolatility = (Math.random() - 0.5) * 0.1; // ±5% monthly volatility
    const monthlyReturnRate = 0.008 + marketVolatility; // Base 0.8% + volatility
    
    currentSavings += monthlySavings;
    
    // Investment growth with volatility
    investmentPortfolio *= (1 + monthlyReturnRate);
    investmentPortfolio += monthlySavings * 0.4; // 40% goes to investments
    
    // Realistic debt reduction
    if (currentDebt > 0) {
      const debtPayment = Math.min(monthlySavings * 0.35, currentDebt);
      currentDebt -= debtPayment;
      currentSavings -= debtPayment;
      currentDebt *= 1.015; // 1.5% monthly debt interest
    }
    
    predictions.push({
      month,
      netWorth: currentSavings + investmentPortfolio - currentDebt,
      savings: currentSavings + investmentPortfolio,
      debt: currentDebt,
      totalSpent,
      totalSaved,
    });
  }
  
  return predictions;
}

/**
 * Conservative model - lower risk, steady returns
 */
export function calculateConservativeModel(data: FinancialData, months: number): TimelinePrediction[] {
  const predictions: TimelinePrediction[] = [];
  const totalMonthlyExpenses = Object.values(data.monthlyExpenses).reduce((a, b) => a + b, 0);
  const monthlySavings = data.monthlyIncome - totalMonthlyExpenses;
  
  let currentSavings = data.currentSavings;
  let currentDebt = data.currentDebt;
  let totalSpent = 0;
  let totalSaved = 0;
  
  const conservativeReturnRate = 0.003; // 0.3% monthly (3.6% annually)
  
  for (let month = 1; month <= months; month++) {
    totalSpent += totalMonthlyExpenses;
    totalSaved += monthlySavings;
    
    currentSavings += monthlySavings;
    currentSavings *= (1 + conservativeReturnRate);
    
    // Conservative debt reduction
    if (currentDebt > 0) {
      const debtPayment = Math.min(monthlySavings * 0.2, currentDebt);
      currentDebt -= debtPayment;
      currentSavings -= debtPayment;
    }
    
    predictions.push({
      month,
      netWorth: currentSavings - currentDebt,
      savings: currentSavings,
      debt: currentDebt,
      totalSpent,
      totalSaved,
    });
  }
  
  return predictions;
}

/**
 * Optimistic model - best-case scenario
 */
export function calculateOptimisticModel(data: FinancialData, months: number): TimelinePrediction[] {
  const predictions: TimelinePrediction[] = [];
  const totalMonthlyExpenses = Object.values(data.monthlyExpenses).reduce((a, b) => a + b, 0);
  const monthlySavings = data.monthlyIncome - totalMonthlyExpenses;
  
  let currentSavings = data.currentSavings;
  let currentDebt = data.currentDebt;
  let totalSpent = 0;
  let totalSaved = 0;
  let investmentPortfolio = 0;
  
  const optimisticReturnRate = 0.015; // 1.5% monthly (18% annually)
  
  for (let month = 1; month <= months; month++) {
    totalSpent += totalMonthlyExpenses;
    totalSaved += monthlySavings;
    
    currentSavings += monthlySavings;
    
    // Optimistic investment growth
    investmentPortfolio *= (1 + optimisticReturnRate);
    investmentPortfolio += monthlySavings * 0.6; // 60% goes to investments
    
    // Aggressive debt reduction
    if (currentDebt > 0) {
      const debtPayment = Math.min(monthlySavings * 0.5, currentDebt);
      currentDebt -= debtPayment;
      currentSavings -= debtPayment;
    }
    
    predictions.push({
      month,
      netWorth: currentSavings + investmentPortfolio - currentDebt,
      savings: currentSavings + investmentPortfolio,
      debt: currentDebt,
      totalSpent,
      totalSaved,
    });
  }
  
  return predictions;
}

/**
 * Get seasonal multiplier for a given month
 */
function getSeasonalMultiplier(month: number): number {
  // January: 1.1 (holiday expenses)
  // February: 0.9 (low spending)
  // March: 1.0 (normal)
  // April: 1.05 (tax season)
  // May: 0.95 (spring)
  // June: 1.0 (normal)
  // July: 1.1 (summer activities)
  // August: 1.0 (normal)
  // September: 0.95 (back to school)
  // October: 1.0 (normal)
  // November: 1.1 (holiday prep)
  // December: 1.2 (holiday season)
  
  const seasonalFactors = [1.1, 0.9, 1.0, 1.05, 0.95, 1.0, 1.1, 1.0, 0.95, 1.0, 1.1, 1.2];
  return seasonalFactors[(month - 1) % 12];
}

/**
 * Calculate projections using specified model
 */
export function calculateProjectionWithModel(
  data: FinancialData, 
  months: number, 
  model: FinancialModel
): TimelinePrediction[] {
  switch (model) {
    case 'linear':
      return calculateLinearModel(data, months);
    case 'exponential':
      return calculateExponentialModel(data, months);
    case 'seasonal':
      return calculateSeasonalModel(data, months);
    case 'realistic':
      return calculateRealisticModel(data, months);
    case 'conservative':
      return calculateConservativeModel(data, months);
    case 'optimistic':
      return calculateOptimisticModel(data, months);
    default:
      return calculateLinearModel(data, months);
  }
}
