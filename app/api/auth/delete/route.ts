import { NextRequest, NextResponse } from 'next/server';
import { EchoAuthService } from '@/utils/echoAuth';
import { userDatabase } from '@/utils/userDatabase';

export async function DELETE(request: NextRequest) {
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

    // Verify token and get user
    const user = await EchoAuthService.verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Delete user from database
    const deleted = await userDatabase.deleteUser(user.id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Account permanently deleted',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
