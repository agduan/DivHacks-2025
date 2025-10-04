import { NextRequest, NextResponse } from 'next/server';
import { FinancialData, ScenarioChange, TimelinePrediction } from '@/types/financial';
import { calculateStatusQuo, calculateWhatIfScenario } from '@/utils/financialCalculations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { financialData, scenarioChanges, months } = body as {
      financialData: FinancialData;
      scenarioChanges?: ScenarioChange[];
      months?: number;
    };

    if (!financialData) {
      return NextResponse.json(
        { error: 'Financial data is required' },
        { status: 400 }
      );
    }

    const timelineMonths = months || 12;
    const statusQuo = calculateStatusQuo(financialData, timelineMonths);
    const whatIf = scenarioChanges && scenarioChanges.length > 0
      ? calculateWhatIfScenario(financialData, scenarioChanges, timelineMonths)
      : null;

    return NextResponse.json({
      statusQuo,
      whatIf,
      success: true,
    });
  } catch (error) {
    console.error('Forecast error:', error);
    return NextResponse.json(
      { error: 'Failed to generate forecast' },
      { status: 500 }
    );
  }
}

