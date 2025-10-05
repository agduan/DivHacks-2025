import { NextRequest, NextResponse } from 'next/server';
import { opikService } from '@/utils/opikService';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.OPIK_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPIK API key not configured' },
        { status: 500 }
      );
    }

    // Get all traces and evaluations
    const traces = opikService.getTraces();
    const evaluations = opikService.getEvaluations();
    const comparison = opikService.compareAgents(['GPT-4', 'Claude', 'Gemini']);

    return NextResponse.json({
      traces,
      evaluations,
      comparison,
      success: true,
      apiKey: apiKey.substring(0, 8) + '...', // Show partial key for verification
    });
  } catch (error) {
    console.error('OPIK API error:', error);
    return NextResponse.json(
      { error: 'Failed to get OPIK data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, agentName, traceId, predictions } = body;

    const apiKey = process.env.OPIK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPIK API key not configured' },
        { status: 500 }
      );
    }

    let result;

    switch (action) {
      case 'startTrace':
        const { name, inputs } = body;
        const newTraceId = opikService.startTrace(name, agentName, inputs);
        result = { traceId: newTraceId };
        break;

      case 'endTrace':
        const { outputs, metadata } = body;
        opikService.endTrace(traceId, outputs, metadata);
        result = { success: true };
        break;

      case 'evaluate':
        const evaluation = opikService.evaluateAgent(traceId, agentName, predictions);
        result = { evaluation };
        break;

      case 'compare':
        const comparison = opikService.compareAgents(['GPT-4', 'Claude', 'Gemini']);
        result = { comparison };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      ...result,
      success: true,
    });
  } catch (error) {
    console.error('OPIK API error:', error);
    return NextResponse.json(
      { error: 'Failed to process OPIK request' },
      { status: 500 }
    );
  }
}
