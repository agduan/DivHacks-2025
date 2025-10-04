import { FinancialData, TimelinePrediction, ScenarioChange, AvatarState } from '@/types/financial';

export function calculateStatusQuo(data: FinancialData, months: number = 12): TimelinePrediction[] {
  const predictions: TimelinePrediction[] = [];
  const totalMonthlyExpenses = Object.values(data.monthlyExpenses).reduce((a, b) => a + b, 0);
  const monthlySavings = data.monthlyIncome - totalMonthlyExpenses;

  let currentSavings = data.currentSavings;
  let currentDebt = data.currentDebt;
  let totalSpent = 0;
  let totalSaved = 0;

  for (let month = 1; month <= months; month++) {
    currentSavings += monthlySavings;
    totalSpent += totalMonthlyExpenses;
    totalSaved += monthlySavings;

    // Simple debt payoff (assume 5% of income goes to debt if exists)
    if (currentDebt > 0) {
      const debtPayment = Math.min(data.monthlyIncome * 0.05, currentDebt);
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

