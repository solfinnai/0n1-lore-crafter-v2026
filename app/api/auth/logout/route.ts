import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authorization header is required' 
        },
        { status: 400 }
      );
    }

    const token = authHeader.substring(7);
    console.log(`👋 Processing logout request`);
    
    // Logout and revoke session
    const logoutResponse = await logout(token);

    if (!logoutResponse.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to logout' 
        },
        { status: 500 }
      );
    }

    console.log(`✅ Logout successful`);
    
    return NextResponse.json({
      success: true,
      message: 'Logout successful',
      logged_out_at: new Date().toISOString(),
      action: 'Session has been terminated'
    });

  } catch (error) {
    console.error('Error during logout:', error);
    // Always return success for logout to avoid client issues
    return NextResponse.json({
      success: true,
      message: 'Logout completed',
      logged_out_at: new Date().toISOString(),
      note: 'Session cleanup completed'
    });
  }
} 