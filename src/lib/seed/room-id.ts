/**
 * Derives a deterministic room identifier from a BIP-39 seed phrase.
 * 
 * Since Jazz doesn't support creating CoValues with deterministic IDs,
 * we use a different approach:
 * 
 * 1. Derive a unique "room key" from the seed phrase
 * 2. Store room IDs in localStorage keyed by this room key
 * 3. When a new room is created, it's announced to the cloud
 * 4. Other devices poll/sync to discover the existing room
 * 
 * This module provides the room key derivation.
 */

import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import { mnemonicToEntropy } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";

/**
 * Derives a deterministic room key from a seed phrase.
 * This key is used as a localStorage key to remember the room ID.
 */
export function deriveRoomKey(seedPhrase: string): string {
  // Normalize the seed phrase
  const normalizedSeed = seedPhrase.trim().toLowerCase().replace(/\s+/g, " ");
  
  // Convert mnemonic to entropy (16 bytes for 12-word phrase)
  const entropy = mnemonicToEntropy(normalizedSeed, wordlist);
  
  // Hash the entropy to get a unique room key
  // We add a domain separator to avoid collisions with other uses
  const domainSeparator = new TextEncoder().encode("solo-chat-room-v1:");
  const combined = new Uint8Array(domainSeparator.length + entropy.length);
  combined.set(domainSeparator);
  combined.set(entropy, domainSeparator.length);
  
  const hash = sha256(combined);
  return bytesToHex(hash);
}

/**
 * Gets the stored room ID for a seed phrase from localStorage.
 */
export function getStoredRoomId(seedPhrase: string): string | null {
  const roomKey = deriveRoomKey(seedPhrase);
  return localStorage.getItem(`solo-chat-room:${roomKey}`);
}

/**
 * Stores a room ID for a seed phrase in localStorage.
 */
export function storeRoomId(seedPhrase: string, roomId: string): void {
  const roomKey = deriveRoomKey(seedPhrase);
  localStorage.setItem(`solo-chat-room:${roomKey}`, roomId);
}

/**
 * Clears the stored room ID for a seed phrase.
 */
export function clearStoredRoomId(seedPhrase: string): void {
  const roomKey = deriveRoomKey(seedPhrase);
  localStorage.removeItem(`solo-chat-room:${roomKey}`);
}
