import { FinancialData, TimelinePrediction } from '@/types/financial';
import { getCombinedMarketData, getMarketTrend, getSectorPerformance, REAL_SP500_DATA, REAL_NASDAQ_DATA } from '@/utils/realMarketData';

export type FinancialModel = 'linear' | 'exponential' | 'seasonal' | 'realistic' | 'conservative' | 'savings' | 'optimistic';

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
  savings: {
    name: 'Savings Account',
    description: 'Simple savings with 2% annual interest',
    icon: '🏦',
    color: '#00bcd4'
  },
  optimistic: {
    name: 'Optimistic',
    description: 'Best-case scenario projections',
    icon: '✨',
    color: '#ff9800'
  }
};

// ==================== DYNAMIC INCOME GROWTH ====================

interface PromotionEvent {
  month: number;
  salaryIncrease: number;
  bonus: number;
  type: 'promotion' | 'bonus' | 'job_change';
}

interface MarketData {
  month: number;
  sp500Return: number;
  volatility: number;
  recession: boolean;
}

// Generate promotion events based on model type
function generatePromotionEvents(months: number, model: FinancialModel): PromotionEvent[] {
  const events: PromotionEvent[] = [];
  
  // Base promotion schedule (every 24 months on average)
  const basePromotionInterval = 24;
  const promotionVariation = 6; // ±6 months variation
  
  for (let month = basePromotionInterval; month <= months; month += basePromotionInterval + Math.floor(Math.random() * promotionVariation * 2 - promotionVariation)) {
    let salaryIncrease = 0.08; // 8% base salary increase
    let bonus = 0;
    let type: 'promotion' | 'bonus' | 'job_change' = 'promotion';
    
    switch (model) {
      case 'optimistic':
        salaryIncrease = 0.15; // 15% increase
        bonus = 0.1; // 10% bonus
        type = Math.random() < 0.3 ? 'job_change' : 'promotion';
        break;
      case 'realistic':
        salaryIncrease = 0.08; // 8% increase
        bonus = 0.05; // 5% bonus
        break;
      case 'conservative':
        salaryIncrease = 0.05; // 5% increase
        bonus = 0.02; // 2% bonus
        break;
      case 'seasonal':
        salaryIncrease = 0.06; // 6% increase
        bonus = 0.03; // 3% bonus
        break;
      case 'exponential':
        salaryIncrease = 0.12; // 12% increase
        bonus = 0.08; // 8% bonus
        break;
      case 'savings':
        salaryIncrease = 0.04; // 4% increase (minimal)
        break;
      case 'linear':
        salaryIncrease = 0.06; // 6% increase
        break;
    }
    
    events.push({
      month,
      salaryIncrease,
      bonus,
      type
    });
  }
  
  return events;
}

// Get seasonal income multiplier (summer = 0 for seasonal model)
function getSeasonalIncomeMultiplier(month: number, model: FinancialModel): number {
  if (model === 'seasonal') {
    // Summer months (June, July, August) = 0 income (teacher, student, etc.)
    const summerMonths = [6, 7, 8];
    const monthInYear = ((month - 1) % 12) + 1;
    if (summerMonths.includes(monthInYear)) {
      return 0;
    }
    
    // Other months have normal income
    return 1.0;
  }
  
  return 1.0;
}

// Get seasonal expense multiplier
function getSeasonalExpenseMultiplier(month: number): number {
  const monthInYear = ((month - 1) % 12) + 1;
  const seasonalFactors = [1.1, 0.9, 1.0, 1.05, 0.95, 1.0, 1.1, 1.0, 0.95, 1.0, 1.1, 1.2];
  return seasonalFactors[monthInYear - 1];
}

// ==================== REAL MARKET DATA SIMULATION ====================

// Get real combined market data for realistic model
function getMarketData(month: number): MarketData {
  // Use real combined market data (S&P 500 + NASDAQ)
  const realData = getCombinedMarketData(month);
  
  return {
    month,
    sp500Return: realData.combined.return,
    volatility: realData.combined.volatility,
    recession: realData.combined.recession
  };
}

// ==================== ENHANCED FINANCIAL MODELS ====================

/**
 * LINEAR GROWTH MODEL - Enhanced with dynamic income
 * Now includes promotions, bonuses, and realistic growth
 */
export function calculateLinearModel(data: FinancialData, months: number): TimelinePrediction[] {
  const predictions: TimelinePrediction[] = [];
  const totalMonthlyExpenses = Object.values(data.monthlyExpenses).reduce((a, b) => a + b, 0);
  
  let currentSavings = data.currentSavings;
  let currentDebt = data.currentDebt;
  let totalSpent = 0;
  let totalSaved = 0;
  let currentIncome = data.monthlyIncome;
  
  const promotionEvents = generatePromotionEvents(months, 'linear');
  
  for (let month = 1; month <= months; month++) {
    // Apply promotions
    const promotion = promotionEvents.find(p => p.month === month);
    if (promotion) {
      currentIncome *= (1 + promotion.salaryIncrease);
      if (promotion.bonus > 0) {
        currentSavings += currentIncome * promotion.bonus;
      }
    }
    
    // Calculate expenses with inflation
    const inflationRate = 0.03; // 3% annual inflation
    const inflationAdjustment = Math.pow(1 + inflationRate / 12, month - 1);
    const adjustedExpenses = totalMonthlyExpenses * inflationAdjustment;
    
    const monthlySavings = currentIncome - adjustedExpenses;
    
    totalSpent += adjustedExpenses;
    totalSaved += monthlySavings;
    
    currentSavings += monthlySavings;
    
    // Linear growth: Future Value = Initial Value + (Growth Amount * Number of Periods)
    const monthlyGrowthAmount = 500; // Fixed amount added each month
    currentSavings += monthlyGrowthAmount;
    
    // Simple debt reduction
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
 * EXPONENTIAL/COMPOUND GROWTH MODEL - True exponential growth
 * Now includes aggressive investing and compound returns
 */
export function calculateExponentialModel(data: FinancialData, months: number): TimelinePrediction[] {
  const predictions: TimelinePrediction[] = [];
  const totalMonthlyExpenses = Object.values(data.monthlyExpenses).reduce((a, b) => a + b, 0);
  
  let currentSavings = data.currentSavings;
  let currentDebt = data.currentDebt;
  let totalSpent = 0;
  let totalSaved = 0;
  let investmentPortfolio = 0;
  let currentIncome = data.monthlyIncome;
  
  const promotionEvents = generatePromotionEvents(months, 'exponential');
  
  for (let month = 1; month <= months; month++) {
    // Apply promotions
    const promotion = promotionEvents.find(p => p.month === month);
    if (promotion) {
      currentIncome *= (1 + promotion.salaryIncrease);
      if (promotion.bonus > 0) {
        currentSavings += currentIncome * promotion.bonus;
      }
    }
    
    // Calculate expenses with inflation
    const inflationRate = 0.03;
    const inflationAdjustment = Math.pow(1 + inflationRate / 12, month - 1);
    const adjustedExpenses = totalMonthlyExpenses * inflationAdjustment;
    
    const monthlySavings = currentIncome - adjustedExpenses;
    
    totalSpent += adjustedExpenses;
    totalSaved += monthlySavings;
    
    currentSavings += monthlySavings;
    
    // TRUE EXPONENTIAL GROWTH - Compound returns
    let annualReturnRate = 0.12; // 12% annual return
    let monthlyReturnRate = annualReturnRate / 12;
    
    // Long-term adjustments for exponential model
    const isLongTerm = month > 240; // 20+ years
    const isUltraLongTerm = month > 360; // 30+ years
    
    if (isLongTerm) {
      // 20+ years: Slightly more conservative but still aggressive
      annualReturnRate = 0.10; // 10% annual return
      monthlyReturnRate = annualReturnRate / 12;
    }
    
    if (isUltraLongTerm) {
      // 30+ years: More conservative for retirement
      annualReturnRate = 0.08; // 8% annual return
      monthlyReturnRate = annualReturnRate / 12;
    }
    
    // 80% goes to investments for exponential growth
    let monthlyInvestment = monthlySavings * 0.8;
    
    // Long-term allocation adjustments
    if (isLongTerm) {
      monthlyInvestment = monthlySavings * 0.7; // 70% to investments
    }
    
    if (isUltraLongTerm) {
      monthlyInvestment = monthlySavings * 0.6; // 60% to investments
    }
    
    investmentPortfolio += monthlyInvestment;
    currentSavings -= monthlyInvestment;
    
    // Compound growth on investments
    investmentPortfolio *= (1 + monthlyReturnRate);
    
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
 * SEASONAL PATTERNS MODEL - Summer = 0 income
 * Now includes seasonal income patterns and expenses
 */
export function calculateSeasonalModel(data: FinancialData, months: number): TimelinePrediction[] {
  const predictions: TimelinePrediction[] = [];
  const totalMonthlyExpenses = Object.values(data.monthlyExpenses).reduce((a, b) => a + b, 0);
  
  let currentSavings = data.currentSavings;
  let currentDebt = data.currentDebt;
  let totalSpent = 0;
  let totalSaved = 0;
  let currentIncome = data.monthlyIncome;
  
  const promotionEvents = generatePromotionEvents(months, 'seasonal');
  
  for (let month = 1; month <= months; month++) {
    // Apply promotions
    const promotion = promotionEvents.find(p => p.month === month);
    if (promotion) {
      currentIncome *= (1 + promotion.salaryIncrease);
      if (promotion.bonus > 0) {
        currentSavings += currentIncome * promotion.bonus;
      }
    }
    
    // Seasonal income multiplier (summer = 0)
    const seasonalIncomeMultiplier = getSeasonalIncomeMultiplier(month, 'seasonal');
    const seasonalExpenseMultiplier = getSeasonalExpenseMultiplier(month);
    
    const adjustedIncome = currentIncome * seasonalIncomeMultiplier;
    const adjustedExpenses = totalMonthlyExpenses * seasonalExpenseMultiplier;
    
    const monthlySavings = adjustedIncome - adjustedExpenses;
    
    totalSpent += adjustedExpenses;
    totalSaved += monthlySavings;
    
    currentSavings += monthlySavings;
    
    // Seasonal investment returns
    const seasonalReturnMultiplier = getSeasonalExpenseMultiplier(month);
    const baseReturn = 0.06 / 12; // 6% annual base return
    const seasonalReturn = baseReturn * seasonalReturnMultiplier;
    
    currentSavings *= (1 + seasonalReturn);
    
    // Seasonal debt reduction
    if (currentDebt > 0) {
      const debtPayment = Math.min(monthlySavings * 0.25, currentDebt);
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
 * REALISTIC MODEL - Uses real S&P 500 data simulation
 * Now includes actual market trends and realistic volatility
 */
export function calculateRealisticModel(data: FinancialData, months: number): TimelinePrediction[] {
  const predictions: TimelinePrediction[] = [];
  const totalMonthlyExpenses = Object.values(data.monthlyExpenses).reduce((a, b) => a + b, 0);
  
  let currentSavings = data.currentSavings;
  let currentDebt = data.currentDebt;
  let totalSpent = 0;
  let totalSaved = 0;
  let investmentPortfolio = 0;
  let currentIncome = data.monthlyIncome;
  
  const promotionEvents = generatePromotionEvents(months, 'realistic');
  
  for (let month = 1; month <= months; month++) {
    // Apply promotions
    const promotion = promotionEvents.find(p => p.month === month);
    if (promotion) {
      currentIncome *= (1 + promotion.salaryIncrease);
      if (promotion.bonus > 0) {
        currentSavings += currentIncome * promotion.bonus;
      }
    }
    
    // Get real combined market data (S&P 500 + NASDAQ)
    const marketData = getCombinedMarketData(month);
    const marketTrend = getMarketTrend();
    const sectorPerformance = getSectorPerformance();
    
    // Enhanced long-term projections (20+ years)
    const isLongTerm = month > 240; // 20+ years
    const isUltraLongTerm = month > 360; // 30+ years
    
    // Calculate expenses with inflation
    const inflationRate = 0.03;
    const inflationAdjustment = Math.pow(1 + inflationRate / 12, month - 1);
    const adjustedExpenses = totalMonthlyExpenses * inflationAdjustment;
    
    const monthlySavings = currentIncome - adjustedExpenses;
    
    totalSpent += adjustedExpenses;
    totalSaved += monthlySavings;
    
    currentSavings += monthlySavings;
    
    // Realistic investment growth using REAL combined market data (S&P 500 + NASDAQ)
    let monthlyReturn = marketData.combined.return;
    let monthlyInvestment = monthlySavings * 0.4; // 40% to investments
    
    // Long-term adjustments
    if (isLongTerm) {
      // 20+ years: More conservative allocation, lower volatility
      monthlyInvestment = monthlySavings * 0.3; // 30% to investments
      monthlyReturn *= 0.8; // 20% reduction in volatility
    }
    
    if (isUltraLongTerm) {
      // 30+ years: Very conservative, focus on preservation
      monthlyInvestment = monthlySavings * 0.2; // 20% to investments
      monthlyReturn *= 0.6; // 40% reduction in volatility
    }
    
    investmentPortfolio += monthlyInvestment;
    currentSavings -= monthlyInvestment;
    
    // Apply REAL combined market returns (60% S&P 500, 40% NASDAQ)
    investmentPortfolio *= (1 + monthlyReturn);
    
    // Add sector diversification based on market conditions
    if (marketTrend.trend === 'bull') {
      // In bull markets, increase allocation to growth sectors
      const growthBonus = 0.02; // 2% bonus for growth sectors
      investmentPortfolio *= (1 + growthBonus);
    } else if (marketTrend.trend === 'bear') {
      // In bear markets, defensive positioning
      const defensiveAdjustment = -0.01; // 1% reduction for defensive positioning
      investmentPortfolio *= (1 + defensiveAdjustment);
    }
    
    // Long-term life events and economic factors
    if (isLongTerm) {
      // 20+ years: Major life events
      const majorLifeEvent = Math.random() < 0.001; // 0.1% chance per month
      if (majorLifeEvent) {
        const eventType = Math.random();
        if (eventType < 0.3) {
          // Major windfall (inheritance, lottery, etc.)
          currentSavings += currentIncome * 12; // 1 year salary
        } else if (eventType < 0.6) {
          // Major expense (house, medical, etc.)
          currentSavings -= currentIncome * 6; // 6 months salary
        } else {
          // Career change (could be positive or negative)
          currentIncome *= (Math.random() < 0.5 ? 1.5 : 0.7);
        }
      }
    }
    
    if (isUltraLongTerm) {
      // 30+ years: Retirement considerations
      const retirementAdjustment = Math.max(0, (month - 360) / 120); // Gradual retirement
      if (retirementAdjustment > 0) {
        currentIncome *= (1 - retirementAdjustment * 0.5); // Gradual income reduction
        // Increase savings allocation for retirement
        monthlyInvestment = monthlySavings * 0.5; // 50% to investments
      }
    }
    
    // Realistic debt reduction
    if (currentDebt > 0) {
      const debtInterest = currentDebt * 0.05 / 12; // 5% annual interest
      currentDebt += debtInterest;
      
      const debtPayment = Math.min(monthlySavings * 0.3, currentDebt);
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
 * CONSERVATIVE MODEL - Enhanced with savings focus
 * Now includes emergency fund priority and conservative growth
 */
export function calculateConservativeModel(data: FinancialData, months: number): TimelinePrediction[] {
  const predictions: TimelinePrediction[] = [];
  const totalMonthlyExpenses = Object.values(data.monthlyExpenses).reduce((a, b) => a + b, 0);
  
  let currentSavings = data.currentSavings;
  let currentDebt = data.currentDebt;
  let totalSpent = 0;
  let totalSaved = 0;
  let emergencyFund = 0;
  let currentIncome = data.monthlyIncome;
  
  const promotionEvents = generatePromotionEvents(months, 'conservative');
  const emergencyFundTarget = totalMonthlyExpenses * 6; // 6 months of expenses
  
  for (let month = 1; month <= months; month++) {
    // Apply promotions
    const promotion = promotionEvents.find(p => p.month === month);
    if (promotion) {
      currentIncome *= (1 + promotion.salaryIncrease);
      if (promotion.bonus > 0) {
        currentSavings += currentIncome * promotion.bonus;
      }
    }
    
    // Calculate expenses with inflation
    const inflationRate = 0.03;
    const inflationAdjustment = Math.pow(1 + inflationRate / 12, month - 1);
    const adjustedExpenses = totalMonthlyExpenses * inflationAdjustment;
    
    const monthlySavings = currentIncome - adjustedExpenses;
    
    totalSpent += adjustedExpenses;
    totalSaved += monthlySavings;
    
    currentSavings += monthlySavings;
    
    // Conservative growth - prioritize emergency fund
    const conservativeReturnRate = 0.025; // 2.5% annual return
    
    if (emergencyFund < emergencyFundTarget) {
      // Build emergency fund first
      const emergencyContribution = Math.min(monthlySavings * 0.8, emergencyFundTarget - emergencyFund);
      emergencyFund += emergencyContribution;
      currentSavings -= emergencyContribution;
    } else {
      // Once emergency fund is built, conservative growth
      currentSavings *= (1 + conservativeReturnRate / 12);
    }
    
    // Conservative debt reduction - only after emergency fund
    if (currentDebt > 0 && emergencyFund >= emergencyFundTarget) {
      const debtPayment = Math.min(monthlySavings * 0.4, currentDebt);
      currentDebt -= debtPayment;
      currentSavings -= debtPayment;
    }
    
    predictions.push({
      month,
      netWorth: currentSavings + emergencyFund - currentDebt,
      savings: currentSavings + emergencyFund,
      debt: currentDebt,
      totalSpent,
      totalSaved,
    });
  }
  
  return predictions;
}

/**
 * SAVINGS ACCOUNT MODEL - Enhanced with realistic interest
 * Now includes realistic interest rates and compound growth
 */
export function calculateSavingsModel(data: FinancialData, months: number): TimelinePrediction[] {
  const predictions: TimelinePrediction[] = [];
  const totalMonthlyExpenses = Object.values(data.monthlyExpenses).reduce((a, b) => a + b, 0);
  
  let currentSavings = data.currentSavings;
  let currentDebt = data.currentDebt;
  let totalSpent = 0;
  let totalSaved = 0;
  let currentIncome = data.monthlyIncome;
  
  const promotionEvents = generatePromotionEvents(months, 'savings');
  
  for (let month = 1; month <= months; month++) {
    // Apply promotions
    const promotion = promotionEvents.find(p => p.month === month);
    if (promotion) {
      currentIncome *= (1 + promotion.salaryIncrease);
      if (promotion.bonus > 0) {
        currentSavings += currentIncome * promotion.bonus;
      }
    }
    
    // Calculate expenses with inflation
    const inflationRate = 0.03;
    const inflationAdjustment = Math.pow(1 + inflationRate / 12, month - 1);
    const adjustedExpenses = totalMonthlyExpenses * inflationAdjustment;
    
    const monthlySavings = currentIncome - adjustedExpenses;
    
    totalSpent += adjustedExpenses;
    totalSaved += monthlySavings;
    
    currentSavings += monthlySavings;
    
    // Realistic savings account interest
    const baseInterestRate = 0.02; // 2% annual interest
    const monthlyInterestRate = baseInterestRate / 12;
    
    currentSavings *= (1 + monthlyInterestRate);
    
    // Simple debt reduction
    if (currentDebt > 0) {
      const debtInterest = currentDebt * 0.05 / 12; // 5% annual interest
      currentDebt += debtInterest;
      
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
 * OPTIMISTIC MODEL - Enhanced with aggressive growth
 * Now includes frequent promotions, bonuses, and aggressive investing
 */
export function calculateOptimisticModel(data: FinancialData, months: number): TimelinePrediction[] {
  const predictions: TimelinePrediction[] = [];
  const totalMonthlyExpenses = Object.values(data.monthlyExpenses).reduce((a, b) => a + b, 0);
  
  let currentSavings = data.currentSavings;
  let currentDebt = data.currentDebt;
  let totalSpent = 0;
  let totalSaved = 0;
  let investmentPortfolio = 0;
  let currentIncome = data.monthlyIncome;
  
  const promotionEvents = generatePromotionEvents(months, 'optimistic');
  
  for (let month = 1; month <= months; month++) {
    // Apply promotions
    const promotion = promotionEvents.find(p => p.month === month);
    if (promotion) {
      currentIncome *= (1 + promotion.salaryIncrease);
      if (promotion.bonus > 0) {
        currentSavings += currentIncome * promotion.bonus;
      }
    }
    
    // Calculate expenses with inflation
    const inflationRate = 0.03;
    const inflationAdjustment = Math.pow(1 + inflationRate / 12, month - 1);
    const adjustedExpenses = totalMonthlyExpenses * inflationAdjustment;
    
    const monthlySavings = currentIncome - adjustedExpenses;
    
    totalSpent += adjustedExpenses;
    totalSaved += monthlySavings;
    
    currentSavings += monthlySavings;
    
    // Optimistic investment growth
    const annualReturnRate = 0.15; // 15% annual return
    const monthlyReturnRate = annualReturnRate / 12;
    
    // 80% goes to investments for aggressive growth
    const monthlyInvestment = monthlySavings * 0.8;
    investmentPortfolio += monthlyInvestment;
    currentSavings -= monthlyInvestment;
    
    // Compound growth on investments
    investmentPortfolio *= (1 + monthlyReturnRate);
    
    // Aggressive debt reduction
    if (currentDebt > 0) {
      const debtPayment = Math.min(monthlySavings * 0.6, currentDebt);
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
    case 'savings':
      return calculateSavingsModel(data, months);
    case 'optimistic':
      return calculateOptimisticModel(data, months);
    default:
      return calculateLinearModel(data, months);
  }
}