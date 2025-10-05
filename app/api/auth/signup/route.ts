import { NextRequest, NextResponse } from 'next/server';
import { EchoAuthService } from '@/utils/echoAuth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Input validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { 
          error: 'Email, password, and name are required',
          code: 'MISSING_REQUIRED_FIELDS',
          success: false 
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.ECHO_API_KEY;
    const appId = process.env.ECHO_APP_ID;
    
    if (!apiKey || !appId) {
      return NextResponse.json(
        { 
          error: 'Echo API not configured',
          code: 'API_NOT_CONFIGURED',
          success: false 
        },
        { status: 500 }
      );
    }

    // Initialize Echo Auth
    EchoAuthService.initialize(apiKey, appId);

    // Sign up user
    const result = await EchoAuthService.signUp(email, password, name);

    if (result.success && result.user && result.token) {
      // Create Nessie customer for the new user
      const customerId = await EchoAuthService.createNessieCustomer(
        result.user.id,
        result.token,
        {
          firstName: name.split(' ')[0],
          lastName: name.split(' ').slice(1).join(' ') || '',
          address: {
            streetNumber: '1',
            streetName: 'Demo Street',
            city: 'Demo City',
            state: 'DC',
            zip: '00000',
          },
        }
      );

      return NextResponse.json({
        success: true,
        user: {
          ...result.user,
          customerId,
        },
        token: result.token,
        source: 'echo-auth',
      });
    } else {
      return NextResponse.json(
        { 
          error: result.error || 'Signup failed',
          code: 'SIGNUP_FAILED',
          success: false 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500 }
    );
  }
}
