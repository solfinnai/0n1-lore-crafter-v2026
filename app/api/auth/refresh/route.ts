import { NextRequest, NextResponse } from 'next/server';
import { refreshAuthToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    // Validate refresh token
    if (!refreshToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Refresh token is required' 
        },
        { status: 400 }
      );
    }

    console.log(`🔄 Refreshing authentication token`);
    
    // Refresh the token
    const authResponse = await refreshAuthToken(refreshToken);

    if (!authResponse.success) {
      console.log(`❌ Token refresh failed: ${authResponse.error}`);
      return NextResponse.json(
        {
          success: false,
          error: authResponse.error,
          code: 'REFRESH_FAILED',
          action: 'Please re-authenticate with your wallet'
        }, 
        { status: 401 }
      );
    }

    console.log(`✅ Token refreshed successfully`);
    
    // Return new tokens
    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      token: authResponse.token,
      refreshToken: authResponse.refreshToken,
      expiresAt: authResponse.expiresAt,
      refreshed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to refresh authentication token',
        code: 'REFRESH_ERROR',
        action: 'Please re-authenticate with your wallet'
      },
      { status: 500 }
    );
  }
} 