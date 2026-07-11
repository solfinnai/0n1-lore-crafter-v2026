/**
 * Utility functions for NFT ownership verification
 */

/**
 * Verify if a wallet address owns a specific NFT
 */
export async function verifyNftOwnership(
  walletAddress: string, 
  tokenId: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/verify-ownership?address=${walletAddress}&tokenId=${tokenId}`)
    
    if (!response.ok) {
      console.error('Ownership verification API error:', response.status)
      return false
    }

    const data = await response.json()
    return data.owns === true
  } catch (error) {
    console.error('Ownership verification failed:', error)
    return false
  }
}

/**
 * Generate consistent error message for ownership failures
 */
export function createOwnershipError(tokenId: string): string {
  return `You don't own 0N1 Force #${tokenId}. You can only access characters you own.`
} 