/**
 * Create auth props for Jazz with a passphrase (BIP-39 seed)
 * This allows the same account to be accessed from any device with the seed
 */
export function createPassphraseAuth(passphrase: string) {
  return {
    secret: passphrase,
  };
}

/**
 * Derive a deterministic room ID from a seed phrase
 * This allows users with the same seed to access the same chat room
 */
export function deriveRoomIdFromSeed(seed: string): string {
  // Simple hash function for deterministic ID
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `room-${Math.abs(hash).toString(36)}`;
}
