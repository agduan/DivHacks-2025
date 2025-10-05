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

    // Input validation
    if (!financialData) {
      return NextResponse.json(
        { 
          error: 'Financial data is required',
          code: 'MISSING_FINANCIAL_DATA',
          success: false 
        },
        { status: 400 }
      );
    }

    // Validate months parameter
    const timelineMonths = Math.min(Math.max(months || 12, 1), 120); // Clamp between 1-120 months

    const statusQuo = calculateStatusQuo(financialData, timelineMonths);
    const whatIf = scenarioChanges && scenarioChanges.length > 0
      ? calculateWhatIfScenario(financialData, scenarioChanges, timelineMonths)
      : null;

    return NextResponse.json({
      statusQuo,
      whatIf,
      success: true,
      source: 'forecast',
    });
  } catch (error) {
    console.error('Forecast error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate forecast',
        code: 'FORECAST_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500 }
    );
  }
}

