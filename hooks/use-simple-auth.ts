import { useState, useCallback } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  walletAddress: string | null;
  token: string | null;
  error: string | null;
}

interface UseSimpleAuthReturn extends AuthState {
  authenticate: (walletAddress: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const TOKEN_STORAGE_KEY = 'auth_token';
const REFRESH_TOKEN_STORAGE_KEY = 'auth_refresh_token';

export function useSimpleAuth(): UseSimpleAuthReturn {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: false,
    walletAddress: null,
    token: null,
    error: null
  });

  // Generate challenge and sign with wallet
  const authenticate = useCallback(async (walletAddress: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Step 1: Request challenge
      console.log('🎯 Requesting authentication challenge...');
      const challengeResponse = await fetch('/api/auth/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress })
      });

      if (!challengeResponse.ok) {
        const challengeError = await challengeResponse.json();
        throw new Error(challengeError.error || 'Failed to generate challenge');
      }

      const challengeData = await challengeResponse.json();
      console.log('✅ Challenge received');

      // Step 2: Sign challenge with MetaMask
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      console.log('✍️ Requesting signature...');
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [challengeData.challenge, walletAddress]
      });

      // Step 3: Verify signature
      console.log('🔐 Verifying signature...');
      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          signature,
          challengeId: challengeData.challengeId
        })
      });

      if (!verifyResponse.ok) {
        const verifyError = await verifyResponse.json();
        throw new Error(verifyError.error || 'Authentication failed');
      }

      const authData = await verifyResponse.json();
      console.log('🎉 Authentication successful!');

      // Store tokens
      localStorage.setItem(TOKEN_STORAGE_KEY, authData.token);
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, authData.refreshToken);

      // Update state
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        walletAddress: authData.walletAddress,
        token: authData.token,
        isLoading: false,
        error: null
      }));

      return true;

    } catch (error: any) {
      console.error('Authentication error:', error);
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'Authentication failed'
      }));
      return false;
    }
  }, []);

  // Logout and clear session
  const logout = useCallback(async (): Promise<void> => {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      
      if (token) {
        // Notify server of logout
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      // Clear local storage
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);

      // Reset state
      setState({
        isAuthenticated: false,
        isLoading: false,
        walletAddress: null,
        token: null,
        error: null
      });

      console.log('👋 Logged out successfully');

    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if server request fails
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        walletAddress: null,
        token: null
      }));
    }
  }, []);

  // Clear error message
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    authenticate,
    logout,
    clearError
  };
} 