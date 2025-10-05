import { FinancialData, TimelinePrediction, ScenarioChange, AvatarState } from '@/types/financial';

export function calculateStatusQuo(data: FinancialData, months: number = 12): TimelinePrediction[] {
  console.log('📊 Calculating sophisticated timeline with data:', { data, months });
  const predictions: TimelinePrediction[] = [];
  const totalMonthlyExpenses = Object.values(data.monthlyExpenses).reduce((a, b) => a + b, 0);
  const monthlySavings = data.monthlyIncome - totalMonthlyExpenses;
  
  console.log('📊 Financial calculations:', {
    totalMonthlyExpenses,
    monthlySavings,
    currentSavings: data.currentSavings,
    currentDebt: data.currentDebt
  });

  // Realistic financial modeling parameters
  const annualInflationRate = 0.025; // 2.5% inflation (more realistic)
  const monthlyInflationRate = annualInflationRate / 12;
  const savingsInterestRate = 0.02; // 2% annual savings interest (realistic)
  const monthlySavingsRate = savingsInterestRate / 12;
  const debtInterestRate = 0.08; // 8% annual debt interest (realistic)
  const monthlyDebtRate = debtInterestRate / 12;
  
  // Emergency fund target (3 months expenses - more achievable)
  const emergencyFundTarget = totalMonthlyExpenses * 3;
  
  // Investment allocation (after emergency fund is built)
  const investmentAllocation = 0.5; // 50% of savings go to investments (conservative)
  const investmentReturnRate = 0.06; // 6% annual investment return (realistic)
  const monthlyInvestmentRate = investmentReturnRate / 12;

  let currentSavings = data.currentSavings;
  let currentDebt = data.currentDebt;
  let totalSpent = 0;
  let totalSaved = 0;
  let investmentPortfolio = 0;
  let emergencyFund = Math.min(currentSavings, emergencyFundTarget);

  for (let month = 1; month <= months; month++) {
    // Apply inflation to expenses
    const inflatedExpenses = totalMonthlyExpenses * Math.pow(1 + monthlyInflationRate, month - 1);
    const actualMonthlySavings = data.monthlyIncome - inflatedExpenses;
    
    // Update totals
    totalSpent += inflatedExpenses;
    totalSaved += actualMonthlySavings;
    
    // Emergency fund building (priority)
    if (emergencyFund < emergencyFundTarget) {
      const emergencyContribution = Math.min(actualMonthlySavings, emergencyFundTarget - emergencyFund);
      emergencyFund += emergencyContribution;
      currentSavings += emergencyContribution;
      
      // Remaining savings go to investments
      const remainingSavings = actualMonthlySavings - emergencyContribution;
      if (remainingSavings > 0) {
        investmentPortfolio += remainingSavings * investmentAllocation;
        currentSavings += remainingSavings * (1 - investmentAllocation);
      }
    } else {
      // Emergency fund complete - allocate to investments
      investmentPortfolio += actualMonthlySavings * investmentAllocation;
      currentSavings += actualMonthlySavings * (1 - investmentAllocation);
    }
    
    // Apply interest to savings and investments
    currentSavings *= (1 + monthlySavingsRate);
    investmentPortfolio *= (1 + monthlyInvestmentRate);
    
    // Debt management (realistic payoff strategy)
    if (currentDebt > 0) {
      // Minimum payment (3% of income)
      const minPayment = data.monthlyIncome * 0.03;
      // Extra payment (up to 15% of income if emergency fund is built)
      const extraPayment = emergencyFund >= emergencyFundTarget ? 
        Math.min(data.monthlyIncome * 0.15, currentDebt) : 0;
      
      const debtPayment = minPayment + extraPayment;
      const actualDebtPayment = Math.min(debtPayment, currentDebt);
      
      currentDebt -= actualDebtPayment;
      currentSavings -= actualDebtPayment;
      
      // Apply debt interest
      currentDebt *= (1 + monthlyDebtRate);
    }

    // Calculate total net worth including investments
    const totalNetWorth = currentSavings + investmentPortfolio - currentDebt;

    predictions.push({
      month,
      netWorth: totalNetWorth,
      savings: currentSavings + investmentPortfolio,
      debt: currentDebt,
      totalSpent,
      totalSaved,
    });
  }

  console.log('📊 Advanced model results:', {
    finalNetWorth: predictions[predictions.length - 1].netWorth,
    finalSavings: predictions[predictions.length - 1].savings,
    finalDebt: predictions[predictions.length - 1].debt,
    investmentPortfolio,
    emergencyFund
  });

  return predictions;
}

export function calculateWhatIfScenario(
  data: FinancialData,
  changes: ScenarioChange[],
  months: number = 12
): TimelinePrediction[] {
  const modifiedData = JSON.parse(JSON.stringify(data)) as FinancialData;

  changes.forEach(change => {
    if (change.category === 'income') {
      if (change.changePercent) {
        modifiedData.monthlyIncome *= (1 + change.changePercent / 100);
      } else if (change.changeAmount) {
        modifiedData.monthlyIncome += change.changeAmount;
      }
    } else if (change.category in modifiedData.monthlyExpenses) {
      const expenseKey = change.category as keyof typeof modifiedData.monthlyExpenses;
      if (change.changePercent) {
        modifiedData.monthlyExpenses[expenseKey] *= (1 + change.changePercent / 100);
      } else if (change.changeAmount) {
        modifiedData.monthlyExpenses[expenseKey] += change.changeAmount;
      }
    }
  });

  return calculateStatusQuo(modifiedData, months);
}

export function determineAvatarState(netWorth: number, debt: number): AvatarState {
  if (netWorth > 50000 && debt === 0) return 'wealthy';
  if (netWorth > 10000 && debt < netWorth * 0.2) return 'thriving';
  if (netWorth > 0 && debt < netWorth) return 'stable';
  return 'struggling';
}

export function generateInsights(
  statusQuo: TimelinePrediction[],
  whatIf: TimelinePrediction[]
): string[] {
  const insights: string[] = [];
  const sqFinal = statusQuo[statusQuo.length - 1];
  const wiFinal = whatIf[whatIf.length - 1];
  
  const netWorthDiff = wiFinal.netWorth - sqFinal.netWorth;
  const savingsDiff = wiFinal.savings - sqFinal.savings;

  if (netWorthDiff > 0) {
    insights.push(`Your net worth could increase by $${netWorthDiff.toFixed(2)} in one year!`);
  } else if (netWorthDiff < 0) {
    insights.push(`Warning: This path could decrease your net worth by $${Math.abs(netWorthDiff).toFixed(2)}`);
  }

  if (savingsDiff > 5000) {
    insights.push(`You could save an extra $${savingsDiff.toFixed(2)} by making these changes!`);
  }

  if (wiFinal.debt === 0 && sqFinal.debt > 0) {
    insights.push('You could be debt-free with these adjustments!');
  }

  const sqMonthlyGrowth = (sqFinal.netWorth - statusQuo[0].netWorth) / statusQuo.length;
  const wiMonthlyGrowth = (wiFinal.netWorth - whatIf[0].netWorth) / whatIf.length;
  
  if (wiMonthlyGrowth > sqMonthlyGrowth * 1.5) {
    insights.push('Your financial growth rate could increase by over 50%!');
  }

  return insights;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

