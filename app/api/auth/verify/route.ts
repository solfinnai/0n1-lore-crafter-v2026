import { NextRequest, NextResponse } from 'next/server';
import { verifyWalletSignature } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, signature, challengeId } = body;

    // Validate required fields
    if (!walletAddress || !signature || !challengeId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Wallet address, signature, and challenge ID are required' 
        },
        { status: 400 }
      );
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/i.test(walletAddress)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid Ethereum address format' 
        },
        { status: 400 }
      );
    }

    // Validate signature format (basic check)
    if (!signature.startsWith('0x') || signature.length !== 132) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid signature format' 
        },
        { status: 400 }
      );
    }

    console.log(`🔐 Verifying signature for wallet: ${walletAddress}`);
    console.log(`🔐 Challenge ID: ${challengeId}`);
    
    // Verify signature and create session
    const authResponse = await verifyWalletSignature(walletAddress, signature, challengeId);

    if (!authResponse.success) {
      console.log(`❌ Authentication failed for ${walletAddress}: ${authResponse.error}`);
      return NextResponse.json(authResponse, { status: 401 });
    }

    console.log(`✅ Authentication successful for wallet: ${walletAddress}`);
    
    // Return success with tokens
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      token: authResponse.token,
      refreshToken: authResponse.refreshToken,
      expiresAt: authResponse.expiresAt,
      walletAddress: walletAddress.toLowerCase(),
      usage: {
        authenticated: true,
        enhanced_limits: {
          opensea: '100 requests/hour',
          ai_messages: '50 per day',
          summaries: '15 per day', 
          tokens: '150,000 per day'
        }
      },
      next_steps: {
        include_header: 'Add "Authorization: Bearer <token>" to your requests',
        token_refresh: 'Use /api/auth/refresh when token expires',
        logout: 'Use /api/auth/logout to end session'
      }
    });

  } catch (error) {
    console.error('Error verifying signature:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to verify wallet signature' 
      },
      { status: 500 }
    );
  }
} 