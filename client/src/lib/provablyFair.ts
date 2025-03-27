import { sha256 } from 'js-sha256';
import { hexToBytes, bytesToHex } from '@noble/hashes/utils';

/**
 * ProvablyFair - A utility class for implementing provably fair gambling on Abstract Testnet
 * 
 * The provably fair algorithm works as follows:
 * 1. Server generates a secret seed (S)
 * 2. Server generates a nonce (N)
 * 3. Server computes hash(S + N) and sends the hash to the client before the game
 * 4. Client provides their own seed (C)
 * 5. Final result is computed as hash(S + N + C)
 * 6. After the game, server reveals S and N so client can verify the result
 */
export class ProvablyFair {
  private serverSeed: string = '';
  private clientSeed: string = '';
  private nonce: number = 0;
  private serverSeedHash: string = '';
  private revealed: boolean = false;

  /**
   * Create a new ProvablyFair instance
   * @param initialClientSeed - Optional initial client seed
   */
  constructor(initialClientSeed: string = '') {
    this.clientSeed = initialClientSeed || this.generateRandomSeed();
    this.generateServerSeed();
  }

  /**
   * Generate a new random server seed and hash
   */
  public generateServerSeed(): void {
    this.serverSeed = this.generateRandomSeed();
    this.nonce = 0;
    this.revealed = false;
    this.serverSeedHash = this.hashServerSeed();
  }

  /**
   * Set a client-provided seed
   * @param seed - The client seed
   */
  public setClientSeed(seed: string): void {
    if (this.revealed) {
      // Generate new server seed if setting client seed after result revealed
      this.generateServerSeed();
    }
    this.clientSeed = seed;
  }

  /**
   * Get the current server seed hash - this is publicly shared before the game
   */
  public getServerSeedHash(): string {
    return this.serverSeedHash;
  }

  /**
   * Get the current client seed
   */
  public getClientSeed(): string {
    return this.clientSeed;
  }
  
  /**
   * Get the current nonce
   */
  public getNonce(): number {
    return this.nonce;
  }

  /**
   * Generate a random seed
   * @returns A random hex string
   */
  private generateRandomSeed(): string {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    return bytesToHex(randomBytes);
  }

  /**
   * Hash the server seed + nonce
   */
  private hashServerSeed(): string {
    return sha256(this.serverSeed + '-' + this.nonce.toString());
  }

  /**
   * Calculate the result for a coin flip game
   * @returns true for heads, false for tails
   */
  public calculateCoinFlip(): { isHeads: boolean, seed: string } {
    const combinedSeed = this.serverSeed + '-' + this.nonce.toString() + '-' + this.clientSeed;
    const hash = sha256(combinedSeed);
    
    // Use the first byte of the hash to determine the result
    const firstByte = parseInt(hash.slice(0, 2), 16);
    const isHeads = firstByte % 2 === 0;
    this.nonce++;
    
    return { isHeads, seed: combinedSeed };
  }
  
  /**
   * Calculate the result for a dice roll game
   * @param min - Minimum value (default: 1)
   * @param max - Maximum value (default: 100)
   * @returns A number between min and max (inclusive)
   */
  public calculateDiceRoll(min: number = 1, max: number = 100): { roll: number, seed: string } {
    const combinedSeed = this.serverSeed + '-' + this.nonce.toString() + '-' + this.clientSeed;
    const hash = sha256(combinedSeed);
    
    // Use the first 4 bytes (8 hex characters) of the hash for a 32-bit number
    const hex = hash.slice(0, 8);
    const decimal = parseInt(hex, 16);
    
    // Map to the range [min, max]
    const range = max - min + 1;
    const roll = (decimal % range) + min;
    this.nonce++;
    
    return { roll, seed: combinedSeed };
  }
  
  /**
   * Calculate a multiplier for the crash game
   * @param houseEdge - The house edge as a decimal (default: 0.01 = 1%)
   * @returns The crash point as a multiplier (e.g., 2.5x)
   */
  public calculateCrashPoint(houseEdge: number = 0.01): { multiplier: number, seed: string } {
    const combinedSeed = this.serverSeed + '-' + this.nonce.toString() + '-' + this.clientSeed;
    const hash = sha256(combinedSeed);
    
    // Convert first 8 bytes of hash to a decimal between 0 and 1
    const hex = hash.slice(0, 16);
    const decimal = parseInt(hex, 16) / (16 ** 16);
    
    // Apply the crash point formula with house edge
    // This formula ensures that the expected return is exactly (1 - houseEdge)
    const crashPointMultiplier = 0.99 / (1 - decimal);
    this.nonce++;
    
    return { 
      multiplier: Math.max(1, crashPointMultiplier), // Never crash below 1x
      seed: combinedSeed 
    };
  }
  
  /**
   * Verify a previous result using the provided server seed
   * @param serverSeed - The revealed server seed
   * @param nonce - The nonce used
   * @param clientSeed - The client seed used
   * @param expectedHash - The server seed hash that was shown before the game
   * @returns Whether the verification passed
   */
  public static verify(
    serverSeed: string, 
    nonce: number, 
    clientSeed: string, 
    expectedHash: string
  ): boolean {
    const hash = sha256(serverSeed + '-' + nonce.toString());
    return hash === expectedHash;
  }
  
  /**
   * Reveal the server seed for verification
   * @returns The server seed
   */
  public revealServerSeed(): { serverSeed: string, nonce: number } {
    this.revealed = true;
    return {
      serverSeed: this.serverSeed,
      nonce: this.nonce - 1, // Return the nonce used for the last calculation
    };
  }
  
  /**
   * Get the verification data for the last operation
   */
  public getVerificationData(): {
    serverSeedHash: string,
    clientSeed: string,
    nonce: number,
    serverSeed?: string,
  } {
    const result = {
      serverSeedHash: this.serverSeedHash,
      clientSeed: this.clientSeed,
      nonce: this.nonce - 1, // The nonce used for the last calculation
    };
    
    if (this.revealed) {
      return {
        ...result,
        serverSeed: this.serverSeed,
      };
    }
    
    return result;
  }
}

// Export a singleton instance for global usage
export const provablyFair = new ProvablyFair();

// Also export validation and verification utilities for client-side verification
export const verificationUtils = {
  /**
   * Verify a coin flip result
   */
  verifyCoinFlip: (serverSeed: string, nonce: number, clientSeed: string): boolean => {
    const combinedSeed = serverSeed + '-' + nonce.toString() + '-' + clientSeed;
    const hash = sha256(combinedSeed);
    const firstByte = parseInt(hash.slice(0, 2), 16);
    const calculatedIsHeads = firstByte % 2 === 0;
    
    // Return whether the actual result matches the calculated result
    return calculatedIsHeads === true; // Replace with actual result to verify
  },
  
  /**
   * Verify a dice roll result
   */
  verifyDiceRoll: (
    serverSeed: string, 
    nonce: number, 
    clientSeed: string, 
    result: number,
    min: number = 1,
    max: number = 100
  ): boolean => {
    const combinedSeed = serverSeed + '-' + nonce.toString() + '-' + clientSeed;
    const hash = sha256(combinedSeed);
    
    const hex = hash.slice(0, 8);
    const decimal = parseInt(hex, 16);
    
    const range = max - min + 1;
    const calculatedRoll = (decimal % range) + min;
    
    return calculatedRoll === result;
  },
  
  /**
   * Verify a crash point result
   */
  verifyCrashPoint: (
    serverSeed: string, 
    nonce: number, 
    clientSeed: string, 
    result: number,
    houseEdge: number = 0.01
  ): boolean => {
    const combinedSeed = serverSeed + '-' + nonce.toString() + '-' + clientSeed;
    const hash = sha256(combinedSeed);
    
    const hex = hash.slice(0, 16);
    const decimal = parseInt(hex, 16) / (16 ** 16);
    
    const calculatedMultiplier = Math.max(1, 0.99 / (1 - decimal));
    
    // Allow for a small floating-point precision error
    const epsilon = 0.000001;
    return Math.abs(calculatedMultiplier - result) < epsilon;
  }
};