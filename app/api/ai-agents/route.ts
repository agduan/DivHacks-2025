/**
 * AI Agents API Route
 * Handles requests for multi-agent financial predictions using real AI models
 */

import { NextRequest, NextResponse } from 'next/server';
import { getThreePersonalityAnalyses } from '@/utils/geminiPersonalities';
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

    // Get analyses from three Gemini personalities
    const predictions = await getThreePersonalityAnalyses(financialData, timeline);

    // Evaluate all personalities using OPIK-style evaluation
    const evaluations = evaluateMultipleAgents(predictions);

    logger.info(
      SERVICE_NAME,
      `Completed analyses from ${predictions.length} Gemini personalities with evaluations`
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
 * Get status of Gemini AI personalities
 */
export async function GET(request: NextRequest) {
  try {
    const { API_CONFIG } = await import('@/config');
    const geminiConfigured = !!API_CONFIG.google.apiKey;

    logger.info(SERVICE_NAME, `Gemini personalities configured: ${geminiConfigured}`);

    return NextResponse.json({
      personalities: [
        'Casey the Calculator',
        'Sunny Saver',
        'Grump Gains',
      ],
      totalPersonalities: 3,
      geminiConfigured,
      description: 'Three distinct Gemini AI personalities providing unique financial perspectives',
      success: true,
    });
  } catch (error) {
    logger.error(SERVICE_NAME, 'GET request failed', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to check AI status',
      },
      { status: 500 }
    );
  }
}