/**
 * Centralized configuration management
 * All environment variables and constants in one place
 */

// ==================== ENVIRONMENT VALIDATION ====================

function getEnvVar(key: string, required: boolean = true): string | undefined {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const num = parseFloat(value);
  if (isNaN(num)) {
    throw new Error(`Invalid number for environment variable ${key}: ${value}`);
  }
  return num;
}

// ==================== API CONFIGURATION ====================

export const API_CONFIG = {
  // Nessie API (Capital One)
  nessie: {
    baseUrl: 'https://api.nessieisreal.com', // Fixed to HTTPS
    apiKey: getEnvVar('NESSIE_API_KEY', false),
    timeout: 10000,
    retries: 3,
  },

  // OpenAI API
  openai: {
    apiKey: getEnvVar('OPENAI_API_KEY', false),
    model: 'gpt-4',
    maxTokens: 300,
    temperature: 0.7,
    timeout: 30000,
    retries: 2,
  },

  // Anthropic API (Claude)
  anthropic: {
    apiKey: getEnvVar('ANTHROPIC_API_KEY', false),
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 300,
    timeout: 30000,
    retries: 2,
  },

  // Google AI API (Gemini)
  google: {
    apiKey: getEnvVar('GEMINI_API_KEY', false) || getEnvVar('GOOGLE_AI_API_KEY', false),
    model: 'gemini-2.5-flash', // Using latest Gemini 2.5 Flash model
    timeout: 30000,
    retries: 2,
  },

  // Opik API (if we ever get it working properly)
  opik: {
    apiKey: getEnvVar('OPIK_API_KEY', false),
    projectName: 'financial-time-machine',
    workspaceName: 'divhacks-2025',
    timeout: 15000,
    retries: 2,
  },
} as const;

// ==================== FINANCIAL PARAMETERS ====================

export const FINANCIAL_PARAMS = {
  // Interest rates
  annualInflationRate: getEnvNumber('INFLATION_RATE', 0.025),
  savingsInterestRate: getEnvNumber('SAVINGS_INTEREST_RATE', 0.02),
  debtInterestRate: getEnvNumber('DEBT_INTEREST_RATE', 0.08),

  // Default values
  defaultTimelineMonths: 12,
  maxTimelineMonths: 120,
  minMonthlyIncome: 0,
  maxMonthlyIncome: 1000000,

  // Calculation parameters
  debtPaymentPercentage: 0.3, // 30% of net income goes to debt
  emergencyFundMonths: 6,
} as const;

// ==================== CACHE CONFIGURATION ====================

export const CACHE_CONFIG = {
  // Cache TTL in milliseconds
  nessieTransactions: 5 * 60 * 1000, // 5 minutes
  nessieAccounts: 10 * 60 * 1000, // 10 minutes
  aiPredictions: 15 * 60 * 1000, // 15 minutes
  opikEvaluations: 30 * 60 * 1000, // 30 minutes

  // Cache size limits
  maxCacheSize: 100,
  maxCacheSizeBytes: 10 * 1024 * 1024, // 10MB
} as const;

// ==================== CIRCUIT BREAKER CONFIGURATION ====================

export const CIRCUIT_BREAKER_CONFIG = {
  failureThreshold: 5, // Open circuit after 5 failures
  successThreshold: 2, // Close circuit after 2 successes in half-open state
  timeout: 60000, // Wait 60s before trying again
} as const;

// ==================== RETRY CONFIGURATION ====================

export const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

// ==================== FEATURE FLAGS ====================

export const FEATURE_FLAGS = {
  useRealOpikAPI: false, // Set to true when OPIK API is properly configured
  enableAIAgents: true,
  enableNessieAPI: true,
  enableCaching: true,
  enableCircuitBreaker: true,
  enableMonitoring: true,
} as const;

// ==================== VALIDATION ====================

/**
 * Validate configuration on startup
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate financial parameters
  if (FINANCIAL_PARAMS.annualInflationRate < 0 || FINANCIAL_PARAMS.annualInflationRate > 1) {
    errors.push('Invalid inflation rate: must be between 0 and 1');
  }
  if (FINANCIAL_PARAMS.savingsInterestRate < 0 || FINANCIAL_PARAMS.savingsInterestRate > 1) {
    errors.push('Invalid savings interest rate: must be between 0 and 1');
  }
  if (FINANCIAL_PARAMS.debtInterestRate < 0 || FINANCIAL_PARAMS.debtInterestRate > 1) {
    errors.push('Invalid debt interest rate: must be between 0 and 1');
  }

  // Validate cache configuration
  if (CACHE_CONFIG.maxCacheSize < 1) {
    errors.push('Invalid max cache size: must be at least 1');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ==================== HELPERS ====================

export function isAPIKeyConfigured(service: keyof typeof API_CONFIG): boolean {
  const config = API_CONFIG[service];
  return !!(config && 'apiKey' in config && config.apiKey);
}

export function getAvailableAIAgents(): string[] {
  const agents: string[] = [];
  if (isAPIKeyConfigured('openai')) agents.push('GPT-4');
  if (isAPIKeyConfigured('anthropic')) agents.push('Claude');
  if (isAPIKeyConfigured('google')) agents.push('Gemini');
  return agents;
}
