import { NextRequest, NextResponse } from 'next/server';
import { EchoAuthService } from '@/utils/echoAuth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
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

    // Verify token
    const user = await EchoAuthService.verifyToken(token);

    if (user) {
      // Get Nessie customer ID
      const customerId = await EchoAuthService.getNessieCustomerId(user.id, token);

      return NextResponse.json({
        success: true,
        user: {
          ...user,
          customerId,
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
