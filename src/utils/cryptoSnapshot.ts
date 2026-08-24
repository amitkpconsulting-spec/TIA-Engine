import { TransferProfile } from '../types/tia';

export interface EncryptedSnapshotEnvelope {
  format: 'SOVEREIGN_TIA_ENCRYPTED_SNAPSHOT_V1';
  version: '4.2';
  timestamp: string;
  profileId: string;
  tiaReferenceId?: string;
  profileTitle: string;
  encryption: {
    algorithm: 'AES-GCM';
    keyLength: 256;
    kdf: 'PBKDF2-SHA256';
    iterations: number;
    salt: string; // Base64
    iv: string;   // Base64
    isCustomPassphrase: boolean;
  };
  integrity: {
    sha256Digest: string; // Hex of ciphertext
  };
  ciphertext: string; // Base64
}

export interface DecryptedSnapshotResult {
  profile: TransferProfile;
  activeStep: number;
  timestamp: string;
  tiaReferenceId?: string;
}

const DEFAULT_SYSTEM_SECRET = 'SovereignTIA_PRA_SS221_EDPB_DefaultMasterKey_2026_BankGrade';
const PBKDF2_ITERATIONS = 100000;

/**
 * Converts ArrayBuffer to Base64
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converts Base64 to Uint8Array
 */
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Computes SHA-256 hex digest of a string
 */
async function computeSha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Derives a CryptoKey using PBKDF2
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Creates an encrypted backup snapshot blob of the TIA state.
 */
export async function createEncryptedSnapshot(
  profile: TransferProfile,
  activeStep: number = 1,
  customPassphrase?: string
): Promise<{ blob: Blob; filename: string; envelope: EncryptedSnapshotEnvelope }> {
  const payloadToEncrypt = {
    profile,
    activeStep,
    timestamp: new Date().toISOString(),
    engineVersion: '4.2',
    referenceId: profile.tiaReferenceId,
    client: 'SovereignTIA Regulatory Suite'
  };

  const jsonString = JSON.stringify(payloadToEncrypt, null, 2);
  const encoder = new TextEncoder();
  const plaintextBuffer = encoder.encode(jsonString);

  // Generate cryptographically secure random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const secretToUse = customPassphrase && customPassphrase.trim().length > 0 
    ? customPassphrase.trim() 
    : DEFAULT_SYSTEM_SECRET;

  const key = await deriveKey(secretToUse, salt);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    plaintextBuffer
  );

  const ciphertextBase64 = bufferToBase64(encryptedBuffer);
  const sha256Digest = await computeSha256(ciphertextBase64);

  const envelope: EncryptedSnapshotEnvelope = {
    format: 'SOVEREIGN_TIA_ENCRYPTED_SNAPSHOT_V1',
    version: '4.2',
    timestamp: new Date().toISOString(),
    profileId: profile.id,
    tiaReferenceId: profile.tiaReferenceId,
    profileTitle: profile.title || 'Untitled Assessment',
    encryption: {
      algorithm: 'AES-GCM',
      keyLength: 256,
      kdf: 'PBKDF2-SHA256',
      iterations: PBKDF2_ITERATIONS,
      salt: bufferToBase64(salt.buffer),
      iv: bufferToBase64(iv.buffer),
      isCustomPassphrase: !!(customPassphrase && customPassphrase.trim().length > 0)
    },
    integrity: {
      sha256Digest
    },
    ciphertext: ciphertextBase64
  };

  const finalBlobContent = JSON.stringify(envelope, null, 2);
  const blob = new Blob([finalBlobContent], { type: 'application/json' });

  const dateTag = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const cleanRef = (profile.tiaReferenceId || 'DRAFT').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `TIA_SNAPSHOT_${cleanRef}_${dateTag}.tiasnap.json`;

  return { blob, filename, envelope };
}

/**
 * Decrypts a snapshot envelope from text content or file.
 */
export async function decryptSnapshot(
  fileContent: string,
  passphrase?: string
): Promise<DecryptedSnapshotResult> {
  let envelope: EncryptedSnapshotEnvelope;
  try {
    envelope = JSON.parse(fileContent);
  } catch {
    throw new Error('Invalid snapshot file: Could not parse JSON structure.');
  }

  if (envelope.format !== 'SOVEREIGN_TIA_ENCRYPTED_SNAPSHOT_V1') {
    throw new Error('Unsupported snapshot format or outdated version.');
  }

  // Integrity validation
  const calculatedSha = await computeSha256(envelope.ciphertext);
  if (calculatedSha !== envelope.integrity.sha256Digest) {
    throw new Error('Integrity verification failed! The snapshot file has been tampered with or corrupted.');
  }

  const saltBuffer = base64ToBuffer(envelope.encryption.salt);
  const ivBuffer = base64ToBuffer(envelope.encryption.iv);
  const ciphertextBuffer = base64ToBuffer(envelope.ciphertext);

  const secretToUse = passphrase && passphrase.trim().length > 0
    ? passphrase.trim()
    : DEFAULT_SYSTEM_SECRET;

  try {
    const key = await deriveKey(secretToUse, saltBuffer);
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer
      },
      key,
      ciphertextBuffer
    );

    const decoder = new TextDecoder();
    const decryptedJson = decoder.decode(decryptedBuffer);
    const parsedPayload = JSON.parse(decryptedJson);

    if (!parsedPayload.profile || !parsedPayload.profile.id) {
      throw new Error('Decrypted payload does not contain a valid TransferProfile.');
    }

    return {
      profile: parsedPayload.profile,
      activeStep: parsedPayload.activeStep || 1,
      timestamp: parsedPayload.timestamp || envelope.timestamp,
      tiaReferenceId: parsedPayload.referenceId || envelope.tiaReferenceId
    };
  } catch (err) {
    if (envelope.encryption.isCustomPassphrase) {
      throw new Error('Decryption failed. Please verify that your custom passphrase is correct.');
    }
    throw new Error(`Decryption failed: ${err instanceof Error ? err.message : 'Invalid key or corrupted data.'}`);
  }
}

/**
 * Triggers a browser file download for a given Blob
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
