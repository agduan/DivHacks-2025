# Configuration Guide

This document outlines all the configurable parameters in the application and how to set them up properly.

## Environment Variables

### API Configuration

#### Nessie API (Capital One)
```bash
NESSIE_API_KEY=your_nessie_api_key_here
NESSIE_BASE_URL=https://api.nessieisreal.com
NESSIE_TIMEOUT=10000
NESSIE_RETRIES=3
```

#### OpenAI API
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

#### Google AI API (Gemini)
```bash
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

#### Anthropic API (Claude)
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

#### Opik API (if available)
```bash
OPIK_API_KEY=your_opik_api_key_here
```

### Financial Parameters

#### Interest Rates
```bash
INFLATION_RATE=0.025                    # 2.5% annual inflation
SAVINGS_INTEREST_RATE=0.02             # 2% annual savings interest
DEBT_INTEREST_RATE=0.08                # 8% annual debt interest
INVESTMENT_RETURN_RATE=0.06            # 6% annual investment return
```

#### Investment Allocation
```bash
INVESTMENT_ALLOCATION=0.5              # 50% of savings to investments
EMERGENCY_FUND_ALLOCATION=0.8          # 80% of savings to emergency fund until target
```

#### Timeline Configuration
```bash
DEFAULT_TIMELINE_MONTHS=12             # Default projection timeline
MAX_TIMELINE_MONTHS=120                # Maximum projection timeline
MIN_MONTHLY_INCOME=0                   # Minimum monthly income validation
MAX_MONTHLY_INCOME=1000000             # Maximum monthly income validation
```

#### Debt and Emergency Fund
```bash
DEBT_PAYMENT_PERCENTAGE=0.3            # 30% of net income to debt payment
EMERGENCY_FUND_MONTHS=6                # 6 months of expenses for emergency fund
```

#### Market Data Parameters
```bash
MARKET_VOLATILITY=0.15                 # 15% market volatility
RECESSION_THRESHOLD=-0.05              # -5% threshold for recession detection
```

#### Promotion Parameters
```bash
BASE_PROMOTION_INTERVAL=24             # Base promotion interval in months
PROMOTION_VARIATION=6                  # Promotion variation in months
BASE_SALARY_INCREASE=0.08              # 8% base salary increase
```

### Cache Configuration

#### Cache TTL (in milliseconds)
```bash
CACHE_NESSIE_TRANSACTIONS_TTL=300000   # 5 minutes
CACHE_NESSIE_ACCOUNTS_TTL=600000       # 10 minutes
CACHE_AI_PREDICTIONS_TTL=900000        # 15 minutes
CACHE_OPIK_EVALUATIONS_TTL=1800000     # 30 minutes
CACHE_MARKET_DATA_TTL=3600000          # 1 hour
```

#### Cache Size Limits
```bash
CACHE_MAX_ENTRIES=100                  # Maximum cache entries
CACHE_MAX_SIZE_BYTES=10485760          # 10MB cache size limit
```

#### Cache Warming
```bash
ENABLE_CACHE_WARMING=false             # Enable cache warming
CACHE_WARMING_INTERVAL=300000          # Cache warming interval (5 minutes)
```

### Security Configuration

#### Rate Limiting
```bash
RATE_LIMIT_MAX_REQUESTS=100            # Maximum requests per window
RATE_LIMIT_WINDOW_MS=900000            # Rate limit window (15 minutes)
RATE_LIMIT_BLOCK_DURATION_MS=3600000   # Block duration (1 hour)
```

### Feature Flags

```bash
USE_REAL_OPIK_API=false                # Use real Opik API (currently disabled)
ENABLE_AI_AGENTS=true                  # Enable AI agents
ENABLE_NESSIE_API=true                 # Enable Nessie API
ENABLE_CACHING=true                    # Enable caching
ENABLE_CIRCUIT_BREAKER=true            # Enable circuit breaker
ENABLE_MONITORING=true                  # Enable monitoring
```

### Development Configuration

```bash
NODE_ENV=development                    # Environment
LOG_LEVEL=info                         # Log level
ENABLE_DEBUG_LOGS=true                 # Enable debug logs
```

## Security Best Practices

### 1. API Key Management
- Never commit real API keys to version control
- Use different keys for development, staging, and production
- Rotate API keys regularly
- Use environment-specific configuration files
- Consider using a secrets management service for production

### 2. Environment-Specific Configuration
- Development: Use mock data and relaxed limits
- Staging: Use test API keys with production-like limits
- Production: Use production API keys with strict limits

### 3. Monitoring and Alerting
- Set up monitoring for API failures
- Configure alerts for rate limit violations
- Monitor cache hit rates and performance
- Track financial calculation accuracy

## Configuration Validation

The application validates configuration on startup. If any required parameters are missing or invalid, the application will:

1. Log the validation errors
2. Use default values where possible
3. Fail to start if critical parameters are missing

## Example Configuration Files

### Development (.env.development)
```bash
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_DEBUG_LOGS=true
RATE_LIMIT_MAX_REQUESTS=1000
CACHE_NESSIE_TRANSACTIONS_TTL=60000
```

### Production (.env.production)
```bash
NODE_ENV=production
LOG_LEVEL=warn
ENABLE_DEBUG_LOGS=false
RATE_LIMIT_MAX_REQUESTS=100
CACHE_NESSIE_TRANSACTIONS_TTL=300000
```

## Troubleshooting

### Common Issues

1. **API Key Not Found**: Ensure all required API keys are set in environment variables
2. **Rate Limit Exceeded**: Check rate limiting configuration and increase limits if needed
3. **Cache Issues**: Verify cache configuration and clear cache if needed
4. **Financial Calculation Errors**: Check financial parameter configuration

### Debug Mode

Enable debug mode by setting:
```bash
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_DEBUG_LOGS=true
```

This will provide detailed logging for troubleshooting.
