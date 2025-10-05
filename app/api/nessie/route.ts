import { NextRequest, NextResponse } from 'next/server';
import { MOCK_NESSIE_TRANSACTIONS, parseNessieData } from '@/utils/mockData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const useMock = searchParams.get('useMock') === 'true';
    
    const apiKey = process.env.NESSIE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // If no accountId provided, return mock data
    if (!accountId || useMock) {
      const parsedData = parseNessieData(MOCK_NESSIE_TRANSACTIONS);
      return NextResponse.json({
        transactions: MOCK_NESSIE_TRANSACTIONS,
        parsedData,
        success: true,
        source: 'mock'
      });
    }
    
    // Fetch real data from Nessie API
    const response = await fetch(`http://api.nessieisreal.com/accounts/${accountId}/purchases?key=${apiKey}`, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Nessie API error: ${response.status} ${response.statusText}`);
    }

    const transactions = await response.json();
    const parsedData = parseNessieData(transactions);

    return NextResponse.json({
      transactions,
      parsedData,
      success: true,
      source: 'api'
    });
  } catch (error) {
    console.error('Nessie API error:', error);
    
    // Fallback to mock data on error
    const parsedData = parseNessieData(MOCK_NESSIE_TRANSACTIONS);
    return NextResponse.json({
      transactions: MOCK_NESSIE_TRANSACTIONS,
      parsedData,
      success: true,
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId } = body;

    const apiKey = process.env.NESSIE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Fetch customer accounts from Nessie API
    const response = await fetch(`http://api.nessieisreal.com/customers/${customerId}/accounts?key=${apiKey}`, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Nessie API error: ${response.status} ${response.statusText}`);
    }

    const accounts = await response.json();

    return NextResponse.json({
      accounts,
      success: true,
      source: 'api'
    });
  } catch (error) {
    console.error('Nessie API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch customer accounts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

