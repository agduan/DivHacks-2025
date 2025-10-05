/**
 * AI Agents API Route
 * Handles requests for multi-agent financial predictions using real AI models
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMultiAgentPredictions } from '@/utils/aiAgents';
import { evaluateMultipleAgents } from '@/utils/opikEvaluation';
import { logger } from '@/utils/monitoring';
import { z } from 'zod';
import { FinancialDataSchema, ScenarioChangeSchema } from '@/utils/validation';

const SERVICE_NAME = 'AIAgentsRoute';

// ==================== REQUEST VALIDATION ====================

const PostRequestSchema = z.object({
  financialData: FinancialDataSchema,
  timelineMonths: z.number().int().positive().max(120),
  scenarioChanges: z.array(ScenarioChangeSchema).optional(),
});

// ==================== POST HANDLER ====================

/**
 * POST /api/ai-agents
 * Get multi-agent predictions and evaluations
 * Body: { financialData, timelineMonths, scenarioChanges? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = PostRequestSchema.safeParse(body);

    if (!validation.success) {
      logger.warn(SERVICE_NAME, 'Invalid POST request body', {
        errors: validation.error.issues,
      });
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { financialData, timelineMonths, scenarioChanges } = validation.data;

    logger.info(SERVICE_NAME, `Requesting AI predictions for ${timelineMonths} months`);

    // Import financial calculations to generate baseline timeline
    const { calculateFinancialProjection } = await import('@/utils/financialCalculations');
    const timeline = calculateFinancialProjection(financialData, timelineMonths);

    // Get predictions from all available AI agents
    const predictions = await getMultiAgentPredictions(
      financialData,
      timeline,
      scenarioChanges
    );

    // Evaluate all agents using OPIK-style evaluation
    const evaluations = evaluateMultipleAgents(predictions);

    logger.info(
      SERVICE_NAME,
      `Completed predictions from ${predictions.length} agents with evaluations`
    );

    return NextResponse.json({
      predictions,
      evaluations,
      success: true,
      source: 'ai-agents',
    });
  } catch (error) {
    logger.error(SERVICE_NAME, 'POST request failed', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to get AI predictions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ==================== GET HANDLER ====================

/**
 * GET /api/ai-agents
 * Get status of available AI agents
 */
export async function GET(request: NextRequest) {
  try {
    const { getAvailableAIAgents, API_CONFIG } = await import('@/config');
    const availableAgents = getAvailableAIAgents();

    logger.info(SERVICE_NAME, `Available agents: ${availableAgents.join(', ')}`);

    return NextResponse.json({
      availableAgents,
      totalAgents: 3,
      status: {
        'GPT-4': !!API_CONFIG.openai.apiKey,
        'Claude': !!API_CONFIG.anthropic.apiKey,
        'Gemini': !!API_CONFIG.google.apiKey,
      },
      success: true,
    });
  } catch (error) {
    logger.error(SERVICE_NAME, 'GET request failed', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to check AI agents status',
      },
      { status: 500 }
    );
  }
}