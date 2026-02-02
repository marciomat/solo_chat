import { validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";

/**
 * Validate that a string is a valid BIP-39 mnemonic
 * @param seed - The seed phrase to validate
 * @returns true if valid, false otherwise
 */
export function isValidSeed(seed: string): boolean {
  if (!seed || typeof seed !== "string") {
    return false;
  }
  
  // Normalize the seed (lowercase, trim, collapse whitespace)
  const normalizedSeed = seed.toLowerCase().trim().replace(/\s+/g, " ");
  
  return validateMnemonic(normalizedSeed, wordlist);
}

/**
 * Normalize a seed phrase (lowercase, trim, collapse whitespace)
 * @param seed - The seed phrase to normalize
 * @returns Normalized seed phrase
 */
export function normalizeSeed(seed: string): string {
  return seed.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Get the word count of a seed phrase
 * @param seed - The seed phrase
 * @returns Number of words
 */
export function getSeedWordCount(seed: string): number {
  const normalized = normalizeSeed(seed);
  if (!normalized) return 0;
  return normalized.split(" ").length;
}

/**
 * Validate seed and return detailed error message if invalid
 * @param seed - The seed phrase to validate
 * @returns Object with isValid boolean and optional error message
 */
export function validateSeedWithMessage(seed: string): {
  isValid: boolean;
  error?: string;
} {
  if (!seed || typeof seed !== "string") {
    return { isValid: false, error: "Please enter a seed phrase" };
  }

  const wordCount = getSeedWordCount(seed);
  
  if (wordCount === 0) {
    return { isValid: false, error: "Please enter a seed phrase" };
  }
  
  if (wordCount !== 12) {
    return { 
      isValid: false, 
      error: `Seed must be exactly 12 words (currently ${wordCount})` 
    };
  }

  if (!isValidSeed(seed)) {
    return { 
      isValid: false, 
      error: "Invalid seed phrase. Please check the words are correct." 
    };
  }

  return { isValid: true };
}
