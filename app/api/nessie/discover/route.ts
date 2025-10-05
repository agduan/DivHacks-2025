/**
 * Nessie Discovery Endpoint
 * Helps you find your customer ID and see available data
 */

import { NextRequest, NextResponse } from 'next/server';
import { discoverYourCustomerId, NessieAPIClient } from '@/utils/nessieIntegration';
import { API_CONFIG } from '@/config';
import { logger } from '@/utils/monitoring';

const SERVICE_NAME = 'NessieDiscovery';

/**
 * GET /api/nessie/discover
 * Discover your customer ID and available accounts
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = API_CONFIG.nessie.apiKey;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Nessie API key not configured. Please add NESSIE_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }

    logger.info(SERVICE_NAME, 'Discovering Nessie data...');

    // Discover customers
    const { customers, suggestion } = await discoverYourCustomerId(apiKey);

    // If we have a suggested customer, fetch their accounts too
    let suggestedAccounts: any[] = [];
    if (suggestion) {
      try {
        const client = new NessieAPIClient(apiKey);
        suggestedAccounts = await client.getCustomerAccounts(suggestion);
      } catch (error) {
        logger.warn(SERVICE_NAME, 'Failed to fetch suggested customer accounts', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      totalCustomers: customers.length,
      customers: customers.map(c => ({
        id: c._id,
        name: `${c.first_name} ${c.last_name}`,
        city: c.address.city,
        state: c.address.state,
      })),
      suggestedCustomerId: suggestion,
      suggestedAccounts: suggestedAccounts.length > 0 ? suggestedAccounts.map(a => ({
        id: a._id,
        type: a.type,
        nickname: a.nickname,
        balance: a.balance,
      })) : undefined,
      instructions: {
        step1: 'Copy your customer ID from above',
        step2: 'Paste it into the "Nessie Customer ID" field in the Financial Input form',
        step3: 'Click "Load from Nessie" to import your real financial data',
      },
    });
  } catch (error) {
    logger.error(SERVICE_NAME, 'Discovery failed', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to discover Nessie data',
        details: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Make sure your NESSIE_API_KEY is correct and the Nessie API is accessible',
      },
      { status: 500 }
    );
  }
}
