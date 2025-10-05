/**
 * Nessie API Route Handler
 * Secure proxy for Nessie API requests with proper validation and error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { NessieService } from '@/utils/nessieService';
import { logger } from '@/utils/monitoring';
import { checkRateLimit, addSecurityHeaders, validateAPIInput } from '@/utils/security';
import { z } from 'zod';

const SERVICE_NAME = 'NessieRoute';

// ==================== REQUEST VALIDATION ====================

const GetRequestSchema = z.object({
  accountId: z.string().optional(),
  useMock: z.string().optional(),
});

const PostRequestSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
});

// ==================== GET HANDLER ====================

/**
 * GET /api/nessie
 * Fetch account transactions
 * Query params: accountId (optional), useMock (optional)
 */
export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimit = checkRateLimit(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const validation = GetRequestSchema.safeParse({
      accountId: searchParams.get('accountId'),
      useMock: searchParams.get('useMock'),
    });

    if (!validation.success) {
      logger.warn(SERVICE_NAME, 'Invalid GET request parameters', {
        errors: validation.error.issues,
      });
      return NextResponse.json(
        { 
          error: 'Invalid request parameters',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { accountId, useMock } = validation.data;
    const shouldUseMock = useMock === 'true';

    // If no accountId provided, use mock data
    if (!accountId || shouldUseMock) {
      logger.info(SERVICE_NAME, 'Fetching mock transaction data');
      const result = await NessieService.getAccountTransactions('', true);
      
      return NextResponse.json({
        transactions: result.data?.transactions || [],
        parsedData: result.data?.parsedData,
        success: result.success,
        source: result.source,
      });
    }

    // Fetch real data from Nessie API
    logger.info(SERVICE_NAME, `Fetching transactions for account ${accountId}`);
    const result = await NessieService.getAccountTransactions(accountId, false);

    // Return with appropriate status
    if (!result.success && result.source === 'fallback') {
      logger.warn(SERVICE_NAME, 'API call failed, returned fallback data', {
        error: result.error,
      });
      return NextResponse.json({
        transactions: result.data?.transactions || [],
        parsedData: result.data?.parsedData,
        success: false,
        source: result.source,
        error: result.error,
      }, { status: 503 }); // Service Unavailable for fallback
    }

    const response = NextResponse.json({
      transactions: result.data?.transactions || [],
      parsedData: result.data?.parsedData,
      success: result.success,
      source: result.source,
    });

    // Add security headers
    addSecurityHeaders(response.headers);
    
    return response;
    
  } catch (error) {
    logger.error(SERVICE_NAME, 'GET request failed', error as Error);
    
    // Return proper error status instead of 200 with fallback
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        source: 'error',
      },
      { status: 500 } // Internal Server Error
    );
  }
}

// ==================== POST HANDLER ====================

/**
 * POST /api/nessie
 * Fetch customer accounts
 * Body: { customerId: string }
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

    const { customerId } = validation.data;

    logger.info(SERVICE_NAME, `Fetching accounts for customer ${customerId}`);
    const result = await NessieService.getCustomerAccounts(customerId);

    if (!result.success) {
      logger.warn(SERVICE_NAME, 'Failed to fetch customer accounts', {
        error: result.error,
      });
      return NextResponse.json(
        {
          error: 'Failed to fetch customer accounts',
          details: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      accounts: result.data || [],
      success: result.success,
      source: result.source,
    });
    
  } catch (error) {
    logger.error(SERVICE_NAME, 'POST request failed', error as Error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch customer accounts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}