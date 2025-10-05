import { NextRequest, NextResponse } from 'next/server';
import { EchoAuthService } from '@/utils/echoAuth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ECHO_API_KEY;
    const appId = process.env.ECHO_APP_ID;
    
    if (!apiKey || !appId) {
      return NextResponse.json(
        { error: 'Echo API not configured' },
        { status: 500 }
      );
    }

    // Initialize Echo Auth
    EchoAuthService.initialize(apiKey, appId);

    // Sign in user
    const result = await EchoAuthService.signIn(email, password);

    if (result.success && result.user && result.token) {
      // Get Nessie customer ID for the user
      const customerId = await EchoAuthService.getNessieCustomerId(
        result.user.id,
        result.token
      );

      return NextResponse.json({
        success: true,
        user: {
          ...result.user,
          customerId,
        },
        token: result.token,
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Signin failed' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
