/**
 * OPIK-Style Evaluation Service
 * Local AI model evaluation and comparison
 * 
 * NOTE: This performs LOCAL evaluation calculations.
 * OPIK's real API requires their Python SDK and is not directly accessible via REST.
 * This service provides similar evaluation metrics locally.
 */

import { AIAgentPrediction, OpikEvaluation } from '@/types/financial';
import { logger, monitoring } from './monitoring';
import { validateOpikEvaluation } from './validation';

const SERVICE_NAME = 'OpikEvaluation';

// ==================== EVALUATION METRICS ====================

/**
 * Calculate accuracy score based on prediction quality
 * Higher score = predictions are more mathematically sound
 */
function calculateAccuracy(predictions: AIAgentPrediction['predictions']): number {
  if (predictions.length === 0) return 0;

  // Check for reasonable financial predictions
  let validCount = 0;
  let totalChecks = 0;

  for (const prediction of predictions) {
    totalChecks += 4;

    // Check 1: Net worth should equal savings - debt
    const expectedNetWorth = prediction.savings - prediction.debt;
    if (Math.abs(prediction.netWorth - expectedNetWorth) < 1) {
      validCount++;
    }

    // Check 2: Values should be finite numbers
    if (
      isFinite(prediction.netWorth) &&
      isFinite(prediction.savings) &&
      isFinite(prediction.debt)
    ) {
      validCount++;
    }

    // Check 3: Savings should be non-negative
    if (prediction.savings >= 0) {
      validCount++;
    }

    // Check 4: Debt should be non-negative
    if (prediction.debt >= 0) {
      validCount++;
    }
  }

  return totalChecks > 0 ? validCount / totalChecks : 0;
}

/**
 * Calculate consistency score based on prediction trends
 * Higher score = predictions follow logical, consistent patterns
 */
function calculateConsistency(predictions: AIAgentPrediction['predictions']): number {
  if (predictions.length < 2) return 1;

  let consistentTransitions = 0;
  let totalTransitions = predictions.length - 1;

  for (let i = 1; i < predictions.length; i++) {
    const prev = predictions[i - 1];
    const curr = predictions[i];

    // Check if changes are consistent (not erratic)
    const netWorthChange = curr.netWorth - prev.netWorth;
    const savingsChange = curr.savings - prev.savings;
    const debtChange = curr.debt - prev.debt;

    // Changes should be reasonable (not more than 50% swing month-to-month)
    const netWorthPctChange = Math.abs(netWorthChange / Math.max(Math.abs(prev.netWorth), 1));
    const savingsPctChange = Math.abs(savingsChange / Math.max(prev.savings, 1));
    const debtPctChange = Math.abs(debtChange / Math.max(prev.debt, 1));

    if (netWorthPctChange < 0.5 && savingsPctChange < 0.5 && debtPctChange < 0.5) {
      consistentTransitions++;
    }
  }

  return totalTransitions > 0 ? consistentTransitions / totalTransitions : 1;
}

/**
 * Calculate reliability score based on prediction variance
 * Higher score = predictions are stable and reliable
 */
function calculateReliability(predictions: AIAgentPrediction['predictions']): number {
  if (predictions.length < 2) return 1;

  // Calculate variance in month-to-month changes
  const netWorthChanges: number[] = [];
  for (let i = 1; i < predictions.length; i++) {
    netWorthChanges.push(predictions[i].netWorth - predictions[i - 1].netWorth);
  }

  if (netWorthChanges.length === 0) return 1;

  // Calculate coefficient of variation
  const mean = netWorthChanges.reduce((a, b) => a + b, 0) / netWorthChanges.length;
  const variance =
    netWorthChanges.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    netWorthChanges.length;
  const stdDev = Math.sqrt(variance);

  // Lower variance relative to mean = higher reliability
  const coefficientOfVariation = Math.abs(mean) > 0 ? stdDev / Math.abs(mean) : 0;

  // Convert to 0-1 score (lower CV = higher score)
  return Math.max(0, Math.min(1, 1 - coefficientOfVariation / 2));
}

/**
 * Generate evaluation feedback based on metrics
 */
function generateFeedback(metrics: {
  accuracy: number;
  consistency: number;
  reliability: number;
}): string[] {
  const feedback: string[] = [];

  // Accuracy feedback
  if (metrics.accuracy >= 0.9) {
    feedback.push('Excellent mathematical accuracy in predictions');
  } else if (metrics.accuracy >= 0.7) {
    feedback.push('Good accuracy with minor calculation variations');
  } else if (metrics.accuracy >= 0.5) {
    feedback.push('Moderate accuracy - some calculation inconsistencies');
  } else {
    feedback.push('Low accuracy - significant calculation issues detected');
  }

  // Consistency feedback
  if (metrics.consistency >= 0.9) {
    feedback.push('Highly consistent prediction patterns');
  } else if (metrics.consistency >= 0.7) {
    feedback.push('Generally consistent with minor fluctuations');
  } else if (metrics.consistency >= 0.5) {
    feedback.push('Moderate consistency - some erratic changes');
  } else {
    feedback.push('Low consistency - unstable prediction patterns');
  }

  // Reliability feedback
  if (metrics.reliability >= 0.9) {
    feedback.push('Very reliable with stable variance');
  } else if (metrics.reliability >= 0.7) {
    feedback.push('Reliable predictions with acceptable variance');
  } else if (metrics.reliability >= 0.5) {
    feedback.push('Moderately reliable - higher variance observed');
  } else {
    feedback.push('Low reliability - high variance in predictions');
  }

  return feedback;
}

// ==================== EVALUATION SERVICE ====================

/**
 * Evaluate a single AI agent's predictions
 */
export function evaluateAgent(prediction: AIAgentPrediction): OpikEvaluation {
  const startTime = Date.now();

  try {
    logger.info(SERVICE_NAME, `Evaluating ${prediction.agentName}`);

    // Calculate metrics
    const accuracy = calculateAccuracy(prediction.predictions);
    const consistency = calculateConsistency(prediction.predictions);
    const reliability = calculateReliability(prediction.predictions);

    // Generate feedback
    const notes = generateFeedback({ accuracy, consistency, reliability });

    const evaluation: OpikEvaluation = {
      agentName: prediction.agentName,
      accuracy,
      consistency,
      reliability,
      notes,
    };

    // Track evaluation
    monitoring.trackAPICall({
      service: SERVICE_NAME,
      endpoint: '/evaluate',
      method: 'POST',
      duration: Date.now() - startTime,
      status: 200,
      success: true,
      cached: false,
    });

    return evaluation;
  } catch (error) {
    logger.error(SERVICE_NAME, `Failed to evaluate ${prediction.agentName}`, error as Error);

    // Return default evaluation on error
    return {
      agentName: prediction.agentName,
      accuracy: 0.5,
      consistency: 0.5,
      reliability: 0.5,
      notes: ['Evaluation failed - using default scores'],
    };
  }
}

/**
 * Evaluate multiple AI agents and compare them
 */
export function evaluateMultipleAgents(predictions: AIAgentPrediction[]): OpikEvaluation[] {
  logger.info(SERVICE_NAME, `Evaluating ${predictions.length} agents`);

  const evaluations = predictions.map((prediction) => evaluateAgent(prediction));

  // Log comparison
  const bestAgent = evaluations.reduce((best, current) => {
    const bestScore = (best.accuracy + best.consistency + best.reliability) / 3;
    const currentScore = (current.accuracy + current.consistency + current.reliability) / 3;
    return currentScore > bestScore ? current : best;
  });

  logger.info(SERVICE_NAME, `Best performing agent: ${bestAgent.agentName}`);

  return evaluations;
}

/**
 * Compare agents and find the best performer
 */
export function compareAgents(evaluations: OpikEvaluation[]): {
  bestAgent: string;
  rankings: Array<{ agentName: string; score: number }>;
  insights: string[];
} {
  if (evaluations.length === 0) {
    return {
      bestAgent: 'None',
      rankings: [],
      insights: ['No evaluations available'],
    };
  }

  // Calculate overall scores
  const rankings = evaluations
    .map((evaluation) => ({
      agentName: evaluation.agentName,
      score: (evaluation.accuracy + evaluation.consistency + evaluation.reliability) / 3,
      accuracy: evaluation.accuracy,
      consistency: evaluation.consistency,
      reliability: evaluation.reliability,
    }))
    .sort((a, b) => b.score - a.score);

  const bestAgent = rankings[0].agentName;
  const insights: string[] = [];

  // Generate insights
  insights.push(`${bestAgent} performs best overall with ${(rankings[0].score * 100).toFixed(1)}% score`);

  // Find specialists
  const mostAccurate = evaluations.reduce((best, curr) =>
    curr.accuracy > best.accuracy ? curr : best
  );
  if (mostAccurate.agentName !== bestAgent) {
    insights.push(`${mostAccurate.agentName} has highest accuracy`);
  }

  const mostConsistent = evaluations.reduce((best, curr) =>
    curr.consistency > best.consistency ? curr : best
  );
  if (mostConsistent.agentName !== bestAgent) {
    insights.push(`${mostConsistent.agentName} is most consistent`);
  }

  const mostReliable = evaluations.reduce((best, curr) =>
    curr.reliability > best.reliability ? curr : best
  );
  if (mostReliable.agentName !== bestAgent) {
    insights.push(`${mostReliable.agentName} is most reliable`);
  }

  return {
    bestAgent,
    rankings,
    insights,
  };
}