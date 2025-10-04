import { NextRequest, NextResponse } from 'next/server';
import { MOCK_NESSIE_TRANSACTIONS, parseNessieData } from '@/utils/mockData';

// This is a placeholder for Capital One Nessie API integration
// Replace with actual API calls when keys are available

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    
    const apiKey = process.env.NESSIE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }
    
    const response = await fetch(`http://api.nessieisreal.com/accounts/${accountId}/purchases?key=${apiKey}`);
    const transactions = await response.json();
    const parsedData = parseNessieData(transactions);

    return NextResponse.json({
      transactions,
      parsedData,
      success: true,
    });
  } catch (error) {
    console.error('Nessie API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId } = body;

    // Placeholder for fetching customer accounts
    // const apiKey = process.env.NESSIE_API_KEY;
    // const response = await fetch(`http://api.nessieisreal.com/customers/${customerId}/accounts?key=${apiKey}`);

    return NextResponse.json({
      message: 'Nessie API integration placeholder',
      customerId,
      success: true,
    });
  } catch (error) {
    console.error('Nessie API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

