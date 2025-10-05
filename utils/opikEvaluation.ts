import { Opik } from 'opik';
import { AIAgentPrediction, OpikEvaluation } from '@/types/financial';

// Initialize Opik client
let opikClient: Opik | null = null;

if (process.env.OPIK_API_KEY) {
  opikClient = new Opik({
    apiKey: process.env.OPIK_API_KEY,
  });
}

// Evaluate AI agent predictions using Opik
export async function evaluateAgentPredictions(
  agents: AIAgentPrediction[],
  groundTruth?: AIAgentPrediction
): Promise<OpikEvaluation[]> {
  if (!opikClient) {
    console.warn('Opik not configured, using mock evaluations');
    return generateMockEvaluations(agents);
  }

  const evaluations: OpikEvaluation[] = [];

  for (const agent of agents) {
    try {
      // Create a trace for this prediction
      const trace = opikClient.trace({
        name: `financial-prediction-${agent.agentName}`,
        input: {
          agentName: agent.agentName,
          predictions: agent.predictions,
        },
        output: {
          insights: agent.insights,
          reasoning: agent.reasoning,
        },
        metadata: {
          confidence: agent.confidence,
        },
      });

      // Evaluate consistency (how stable are predictions across similar inputs)
      const consistency = evaluateConsistency(agent);

      // Evaluate accuracy (if ground truth available)
      const accuracy = groundTruth
        ? evaluateAccuracy(agent, groundTruth)
        : agent.confidence;

      // Calculate overall reliability
      const reliability = (consistency + accuracy) / 2;

      evaluations.push({
        agentName: agent.agentName,
        consistency,
        accuracy,
        reliability,
        notes: generateEvaluationNotes(agent, consistency, accuracy),
      });

      // Log scores to Opik
      await trace.log({
        scores: {
          consistency,
          accuracy,
          reliability,
        },
      });
    } catch (error) {
      console.error(`Error evaluating ${agent.agentName}:`, error);
    }
  }

  return evaluations;
}

// Evaluate prediction consistency
function evaluateConsistency(agent: AIAgentPrediction): number {
  const predictions = agent.predictions;
  if (predictions.length < 2) return 1.0;

  // Calculate variance in growth rate
  const growthRates: number[] = [];
  for (let i = 1; i < predictions.length; i++) {
    const growth = predictions[i].netWorth - predictions[i - 1].netWorth;
    growthRates.push(growth);
  }

  const mean = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
  const variance =
    growthRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) /
    growthRates.length;
  const stdDev = Math.sqrt(variance);

  // Lower standard deviation = higher consistency
  // Normalize to 0-1 scale (assuming reasonable variance range)
  const consistency = Math.max(0, 1 - stdDev / 1000);
  return Math.min(1, consistency);
}

// Evaluate prediction accuracy against ground truth
function evaluateAccuracy(
  agent: AIAgentPrediction,
  groundTruth: AIAgentPrediction
): number {
  const predictions = agent.predictions;
  const truth = groundTruth.predictions;

  if (predictions.length !== truth.length) return 0.5;

  let totalError = 0;
  let count = 0;

  for (let i = 0; i < predictions.length; i++) {
    const predicted = predictions[i].netWorth;
    const actual = truth[i].netWorth;
    const error = Math.abs(predicted - actual) / Math.max(Math.abs(actual), 1);
    totalError += error;
    count++;
  }

  const avgError = totalError / count;
  // Convert error to accuracy score (lower error = higher accuracy)
  const accuracy = Math.max(0, 1 - avgError);
  return Math.min(1, accuracy);
}

// Generate evaluation notes
function generateEvaluationNotes(
  agent: AIAgentPrediction,
  consistency: number,
  accuracy: number
): string[] {
  const notes: string[] = [];

  if (consistency > 0.9) {
    notes.push('Highly consistent predictions');
  } else if (consistency < 0.7) {
    notes.push('Predictions show high variance');
  }

  if (accuracy > 0.9) {
    notes.push('Excellent accuracy');
  } else if (accuracy < 0.7) {
    notes.push('Consider recalibration');
  }

  if (agent.confidence > accuracy + 0.15) {
    notes.push('Overconfident predictions detected');
  } else if (agent.confidence < accuracy - 0.15) {
    notes.push('Underconfident, could be more decisive');
  }

  const finalPrediction = agent.predictions[agent.predictions.length - 1];
  if (finalPrediction.netWorth > agent.predictions[0].netWorth * 1.5) {
    notes.push('Optimistic growth projection');
  } else if (finalPrediction.netWorth < agent.predictions[0].netWorth) {
    notes.push('Conservative outlook');
  }

  return notes.length > 0 ? notes : ['Balanced assessment'];
}

// Mock evaluations for when Opik is not configured
function generateMockEvaluations(agents: AIAgentPrediction[]): OpikEvaluation[] {
  return agents.map((agent) => {
    const baseScore = 0.85 + (Math.random() - 0.5) * 0.2;
    return {
      agentName: agent.agentName,
      consistency: Math.min(1, baseScore + 0.05),
      accuracy: Math.min(1, baseScore),
      reliability: Math.min(1, baseScore + 0.02),
      notes: ['Mock evaluation - configure Opik for real scores'],
    };
  });
}

// Track prediction over time for longitudinal evaluation
export async function trackPrediction(
  agentName: string,
  prediction: AIAgentPrediction,
  userId?: string
): Promise<void> {
  if (!opikClient) return;

  try {
    await opikClient.log({
      projectName: 'financial-time-machine',
      name: `prediction-${agentName}`,
      input: { agentName, userId },
      output: prediction,
      metadata: {
        timestamp: new Date().toISOString(),
        confidence: prediction.confidence,
      },
    });
  } catch (error) {
    console.error('Error tracking prediction:', error);
  }
}
