import { NextRequest, NextResponse } from 'next/server';
import { opikService } from '@/utils/opikService';

export async function GET(request: NextRequest) {
  try {
    console.log('🔬 OPIK Test: Starting OPIK service test...');
    
    // Test data
    const testPredictions = [
      { netWorth: 10000, savings: 12000, debt: 2000 },
      { netWorth: 12000, savings: 14000, debt: 2000 },
      { netWorth: 15000, savings: 17000, debt: 2000 },
    ];
    
    const testInputs = {
      monthlyIncome: 5000,
      currentSavings: 10000,
      currentDebt: 2000,
      agentName: 'TestAgent'
    };
    
    // Start a trace
    const traceId = opikService.startTrace('Test Financial Analysis', 'TestAgent', testInputs);
    console.log('🔬 OPIK Test: Started trace:', traceId);
    
    // Evaluate the agent
    const evaluation = await opikService.evaluateAgent(traceId, 'TestAgent', testPredictions);
    console.log('🔬 OPIK Test: Evaluation result:', evaluation);
    
    // Get UI format
    const uiEvaluation = opikService.getEvaluationForUI('TestAgent');
    console.log('🔬 OPIK Test: UI evaluation:', uiEvaluation);
    
    return NextResponse.json({
      success: true,
      traceId,
      evaluation,
      uiEvaluation,
      message: 'OPIK test completed successfully'
    });
    
  } catch (error) {
    console.error('🔬 OPIK Test Error:', error);
    return NextResponse.json(
      { 
        error: 'OPIK test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
