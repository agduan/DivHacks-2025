/**
 * Nessie Customer Data Endpoint
 * Fetches complete financial data for a specific customer
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCustomerFinancialData } from '@/utils/nessieIntegration';
import { API_CONFIG } from '@/config';
import { logger } from '@/utils/monitoring';
import { z } from 'zod';

const SERVICE_NAME = 'NessieCustomer';

const RequestSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
});

/**
 * POST /api/nessie/customer
 * Get complete financial data for a customer
 * Body: { customerId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validation = RequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { customerId } = validation.data;
    const apiKey = API_CONFIG.nessie.apiKey;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Nessie API key not configured' },
        { status: 500 }
      );
    }

    logger.info(SERVICE_NAME, `Fetching data for customer ${customerId}`);

    // Fetch complete financial data
    const result = await getCustomerFinancialData(apiKey, customerId);

    return NextResponse.json({
      success: true,
      customer: {
        id: result.customer._id,
        name: `${result.customer.first_name} ${result.customer.last_name}`,
        address: result.customer.address,
      },
      accounts: result.accounts.map(acc => ({
        id: acc._id,
        type: acc.type,
        nickname: acc.nickname,
        balance: acc.balance,
        rewards: acc.rewards,
      })),
      financialData: result.financialData,
      source: 'nessie-api',
    });
  } catch (error) {
    logger.error(SERVICE_NAME, 'Failed to fetch customer data', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to fetch customer financial data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
