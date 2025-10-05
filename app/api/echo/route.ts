import { NextRequest, NextResponse } from 'next/server';
import { EchoService } from '@/utils/echoService';
import { FinancialData, ScenarioChange } from '@/types/financial';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { financialData, timelineMonths, scenarioChanges } = body;

    const apiKey = process.env.ECHO_API_KEY;
    const appId = process.env.ECHO_APP_ID;
    
    if (!apiKey || !appId) {
      return NextResponse.json(
        { error: 'Echo API key and app ID not configured' },
        { status: 500 }
      );
    }

    // Initialize Echo service
    EchoService.initialize(apiKey, appId);

    // Get AI predictions
    const predictions = await EchoService.getMultiAgentPredictions({
      financialData,
      timelineMonths,
      scenarioChanges,
    });

    // Get Opik evaluations
    const evaluations = await EchoService.getOpikEvaluations(predictions);

    return NextResponse.json({
      predictions,
      evaluations,
      success: true,
      source: 'echo-api'
    });
  } catch (error) {
    console.error('Echo API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get AI predictions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.ECHO_API_KEY;
    const appId = process.env.ECHO_APP_ID;
    
    if (!apiKey || !appId) {
      return NextResponse.json(
        { error: 'Echo API key and app ID not configured' },
        { status: 500 }
      );
    }

    // Return Echo API status
    return NextResponse.json({
      status: 'connected',
      apiKey: apiKey.substring(0, 8) + '...', // Show partial key for verification
      appId: appId.substring(0, 8) + '...', // Show partial app ID for verification
      success: true,
    });
  } catch (error) {
    console.error('Echo API status error:', error);
    return NextResponse.json(
      { error: 'Failed to check Echo API status' },
      { status: 500 }
    );
  }
}
