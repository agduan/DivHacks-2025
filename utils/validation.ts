import { z } from 'zod';

/**
 * Validation schemas for all API inputs and outputs
 * Ensures type safety and data integrity across the application
 */

// ==================== FINANCIAL DATA SCHEMAS ====================

export const MonthlyExpensesSchema = z.object({
  housing: z.number().min(0, 'Housing expenses cannot be negative'),
  food: z.number().min(0, 'Food expenses cannot be negative'),
  transportation: z.number().min(0, 'Transportation expenses cannot be negative'),
  entertainment: z.number().min(0, 'Entertainment expenses cannot be negative'),
  utilities: z.number().min(0, 'Utilities expenses cannot be negative'),
  other: z.number().min(0, 'Other expenses cannot be negative'),
});

export const FinancialDataSchema = z.object({
  monthlyIncome: z.number().positive('Monthly income must be positive'),
  monthlyExpenses: MonthlyExpensesSchema,
  currentSavings: z.number().min(0, 'Savings cannot be negative'),
  currentDebt: z.number().min(0, 'Debt cannot be negative'),
  savingsGoal: z.number().optional(),
});

export const ScenarioChangeSchema = z.object({
  id: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  changeType: z.enum(['income', 'expense']).optional(),
  changePercent: z.number().optional(),
  changeAmount: z.number().optional(),
  description: z.string().optional(),
});

export const TimelinePredictionSchema = z.object({
  month: z.number().int().positive(),
  netWorth: z.number(),
  savings: z.number().min(0),
  debt: z.number().min(0),
  totalSpent: z.number().min(0),
  totalSaved: z.number(),
});

// ==================== AI AGENT SCHEMAS ====================

export const AIAgentPredictionSchema = z.object({
  agentName: z.string(),
  predictions: z.array(TimelinePredictionSchema),
  confidence: z.number().min(0).max(1),
  insights: z.array(z.string()),
  reasoning: z.string().optional(),
});

// ==================== NESSIE API SCHEMAS ====================

export const NessieTransactionSchema = z.object({
  _id: z.string(),
  merchant_id: z.string(),
  medium: z.string(),
  purchase_date: z.string(),
  amount: z.number(),
  status: z.string(),
  description: z.string().optional(),
});

export const NessieAccountSchema = z.object({
  _id: z.string(),
  type: z.string(),
  nickname: z.string(),
  rewards: z.number(),
  balance: z.number(),
  customer_id: z.string(),
});

export const NessieCustomerSchema = z.object({
  _id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  address: z.object({
    street_number: z.string(),
    street_name: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
  }),
});

// ==================== OPIK EVALUATION SCHEMAS ====================

export const OpikMetricsSchema = z.object({
  accuracy: z.number().min(0).max(1),
  consistency: z.number().min(0).max(1),
  reliability: z.number().min(0).max(1),
  realism: z.number().min(0).max(1).optional(),
  hallucination: z.number().min(0).max(1).optional(),
});

export const OpikEvaluationSchema = z.object({
  agentName: z.string(),
  consistency: z.number().min(0).max(1),
  accuracy: z.number().min(0).max(1),
  reliability: z.number().min(0).max(1),
  notes: z.array(z.string()),
});

// ==================== API RESPONSE SCHEMAS ====================

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  source: z.enum(['api', 'mock', 'fallback', 'cache']).optional(),
});

// ==================== VALIDATION HELPERS ====================

export function validateFinancialData(data: unknown) {
  return FinancialDataSchema.parse(data);
}

export function validateScenarioChange(data: unknown) {
  return ScenarioChangeSchema.parse(data);
}

export function validateAIAgentPrediction(data: unknown) {
  return AIAgentPredictionSchema.parse(data);
}

export function validateNessieTransaction(data: unknown) {
  return NessieTransactionSchema.parse(data);
}

export function validateNessieAccount(data: unknown) {
  return NessieAccountSchema.parse(data);
}

export function validateOpikEvaluation(data: unknown) {
  return OpikEvaluationSchema.parse(data);
}

export function validateNessieCustomer(data: unknown) {
  return NessieCustomerSchema.parse(data);
}

/**
 * Safe validation that returns a result object instead of throwing
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
