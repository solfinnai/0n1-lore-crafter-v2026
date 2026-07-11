import { NextRequest, NextResponse } from 'next/server';
import { generateAuthChallenge } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    // Validate wallet address
    if (!walletAddress) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Wallet address is required' 
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

    // Generate challenge
    console.log(`🎯 Generating authentication challenge for wallet: ${walletAddress}`);
    const challengeResponse = generateAuthChallenge(walletAddress);

    if (!challengeResponse.success) {
      return NextResponse.json(challengeResponse, { status: 500 });
    }

    // Return challenge for signing
    return NextResponse.json({
      success: true,
      challenge: challengeResponse.challenge,
      challengeId: challengeResponse.challengeId,
      message: challengeResponse.message,
      expiresAt: challengeResponse.expiresAt,
      instructions: {
        step1: 'Copy the challenge message above',
        step2: 'Sign it with your wallet (MetaMask personal_sign)',
        step3: 'Send the signature to /api/auth/verify',
        note: 'Challenge expires in 5 minutes'
      }
    });

  } catch (error) {
    console.error('Error generating challenge:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate authentication challenge' 
      },
      { status: 500 }
    );
  }
} 