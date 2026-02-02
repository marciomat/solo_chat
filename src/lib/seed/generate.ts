import { generateMnemonic, validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { isValidSeed } from "./validate";

/**
 * Generate a new 12-word BIP-39 mnemonic seed
 * @returns A 12-word mnemonic string
 */
export function generateSeed(): string {
  // 128 bits = 12 words
  return generateMnemonic(wordlist, 128);
}

/**
 * Generate a seed from a room name (for deterministic room creation)
 * This allows users to join a room by name
 */
export function generateSeedFromInput(input: string): string {
  // For simple room joining, we'll just use the input as-is if it's a valid mnemonic
  // Otherwise, generate a new seed
  if (isValidSeed(input)) {
    return input;
  }
  return generateSeed();
}
