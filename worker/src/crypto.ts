/**
 * Web Push crypto utilities for Cloudflare Workers
 * Implements VAPID and message encryption using Web Crypto API
 */

/**
 * Base64 URL encode
 */
export function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Base64 URL decode
 */
export function base64UrlDecode(str: string): Uint8Array {
  // Add padding if needed
  const padding = "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generate VAPID Authorization header
 */
export async function generateVapidHeaders(
  endpoint: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<{ authorization: string; cryptoKey: string }> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;

  // Create JWT header and payload
  const header = { typ: "JWT", alg: "ES256" };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
    sub: "mailto:push@solo.chat",
  };

  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key for signing
  const privateKeyBytes = base64UrlDecode(vapidPrivateKey);
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    convertRawPrivateKeyToPKCS8(privateKeyBytes),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  // Sign the token
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );

  // Convert signature from DER to raw format for JWT
  const signatureB64 = base64UrlEncode(convertDerToRaw(new Uint8Array(signature)));
  const jwt = `${unsignedToken}.${signatureB64}`;

  return {
    authorization: `vapid t=${jwt}, k=${vapidPublicKey}`,
    cryptoKey: `p256ecdsa=${vapidPublicKey}`,
  };
}

/**
 * Convert raw 32-byte private key to PKCS8 format
 */
function convertRawPrivateKeyToPKCS8(rawKey: Uint8Array): ArrayBuffer {
  // PKCS8 wrapper for P-256 EC private key
  const pkcs8Header = new Uint8Array([
    0x30, 0x81, 0x87, // SEQUENCE
    0x02, 0x01, 0x00, // INTEGER 0 (version)
    0x30, 0x13, // SEQUENCE (algorithm identifier)
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, // OID 1.2.840.10045.2.1 (ecPublicKey)
    0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07, // OID 1.2.840.10045.3.1.7 (P-256)
    0x04, 0x6d, // OCTET STRING
    0x30, 0x6b, // SEQUENCE
    0x02, 0x01, 0x01, // INTEGER 1 (version)
    0x04, 0x20, // OCTET STRING (32 bytes for private key)
  ]);

  // For simplicity, we'll construct a minimal PKCS8 without the public key
  const result = new Uint8Array(pkcs8Header.length + rawKey.length);
  result.set(pkcs8Header);
  result.set(rawKey, pkcs8Header.length);

  return result.buffer;
}

/**
 * Convert DER signature to raw format (R || S)
 */
function convertDerToRaw(der: Uint8Array): Uint8Array {
  // DER format: 0x30 [total-length] 0x02 [r-length] [r] 0x02 [s-length] [s]
  // Raw format: [r (32 bytes)] [s (32 bytes)]

  let offset = 2; // Skip 0x30 and length

  // Read R
  if (der[offset] !== 0x02) throw new Error("Invalid DER signature");
  offset++;
  const rLength = der[offset];
  offset++;
  const rSlice = der.slice(offset, offset + rLength);
  offset += rLength;

  // Read S
  if (der[offset] !== 0x02) throw new Error("Invalid DER signature");
  offset++;
  const sLength = der[offset];
  offset++;
  const sSlice = der.slice(offset, offset + sLength);

  // Pad or trim to 32 bytes
  const r = padOrTrim(rSlice, 32);
  const s = padOrTrim(sSlice, 32);

  const raw = new Uint8Array(64);
  raw.set(r, 0);
  raw.set(s, 32);
  return raw;
}

function padOrTrim(bytes: Uint8Array, length: number): Uint8Array {
  if (bytes.length === length) return bytes;
  if (bytes.length > length) {
    // Trim leading zeros
    return bytes.slice(bytes.length - length);
  }
  // Pad with leading zeros
  const padded = new Uint8Array(length);
  padded.set(bytes, length - bytes.length);
  return padded;
}

/**
 * Encrypt push message payload using the subscription keys
 */
export async function encryptPayload(
  payload: string,
  p256dhKey: string,
  authSecret: string
): Promise<{ ciphertext: ArrayBuffer; salt: Uint8Array; localPublicKey: ArrayBuffer }> {
  // Generate local key pair for ECDH
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  // Import subscriber's public key
  const subscriberPublicKeyBytes = base64UrlDecode(p256dhKey);
  const subscriberPublicKey = await crypto.subtle.importKey(
    "raw",
    subscriberPublicKeyBytes.buffer as ArrayBuffer,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // Derive shared secret
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: "ECDH", public: subscriberPublicKey },
    localKeyPair.privateKey,
    256
  );

  // Get local public key in raw format
  const localPublicKey = await crypto.subtle.exportKey("raw", localKeyPair.publicKey);

  // Generate random salt - copy to new typed array to ensure correct type
  const saltRandom = crypto.getRandomValues(new Uint8Array(16));
  const salt = new Uint8Array(saltRandom);

  // Derive encryption key using HKDF
  const authSecretBytes = base64UrlDecode(authSecret);

  // Import shared secret for HKDF
  const sharedSecretKey = await crypto.subtle.importKey(
    "raw",
    sharedSecret,
    { name: "HKDF" },
    false,
    ["deriveBits", "deriveKey"]
  );

  // PRK = HKDF-Extract(auth_secret, shared_secret)
  const prkInfo = concatBuffers(
    new TextEncoder().encode("WebPush: info\0"),
    subscriberPublicKeyBytes,
    new Uint8Array(localPublicKey)
  );

  const prk = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(authSecretBytes),
      info: new Uint8Array(prkInfo),
    },
    sharedSecretKey,
    256
  );

  // Import PRK for further derivation
  const prkKey = await crypto.subtle.importKey(
    "raw",
    prk,
    { name: "HKDF" },
    false,
    ["deriveBits", "deriveKey"]
  );

  // Derive CEK (Content Encryption Key)
  const cekInfo = new TextEncoder().encode("Content-Encoding: aes128gcm\0");
  const cek = await crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(salt),
      info: new Uint8Array(cekInfo),
    },
    prkKey,
    { name: "AES-GCM", length: 128 },
    false,
    ["encrypt"]
  );

  // Derive nonce
  const nonceInfo = new TextEncoder().encode("Content-Encoding: nonce\0");
  const nonce = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(salt),
      info: new Uint8Array(nonceInfo),
    },
    prkKey,
    96 // 12 bytes
  );

  // Add padding delimiter (0x02 for final record)
  const payloadBytes = new TextEncoder().encode(payload);
  const paddedPayload = new Uint8Array(payloadBytes.length + 1);
  paddedPayload.set(payloadBytes);
  paddedPayload[payloadBytes.length] = 0x02;

  // Encrypt with AES-128-GCM
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: new Uint8Array(nonce) },
    cek,
    paddedPayload
  );

  return { ciphertext, salt, localPublicKey };
}

/**
 * Build the full encrypted body in aes128gcm format
 */
export function buildEncryptedBody(
  ciphertext: ArrayBuffer,
  salt: Uint8Array,
  localPublicKey: ArrayBuffer
): ArrayBuffer {
  const localPublicKeyBytes = new Uint8Array(localPublicKey);

  // Header: salt (16) + record size (4) + key length (1) + key (65)
  const header = new Uint8Array(16 + 4 + 1 + localPublicKeyBytes.length);
  header.set(salt, 0);

  // Record size (4 bytes, big endian) - using 4096
  const recordSize = 4096;
  header[16] = (recordSize >> 24) & 0xff;
  header[17] = (recordSize >> 16) & 0xff;
  header[18] = (recordSize >> 8) & 0xff;
  header[19] = recordSize & 0xff;

  // Key length
  header[20] = localPublicKeyBytes.length;

  // Local public key
  header.set(localPublicKeyBytes, 21);

  // Combine header and ciphertext
  const body = new Uint8Array(header.length + ciphertext.byteLength);
  body.set(header);
  body.set(new Uint8Array(ciphertext), header.length);

  return body.buffer;
}

function concatBuffers(...buffers: (Uint8Array | ArrayBuffer)[]): Uint8Array {
  const arrays = buffers.map(b => b instanceof Uint8Array ? b : new Uint8Array(b));
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}
