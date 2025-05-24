import crypto from 'crypto';

const algorithm = 'aes-256-cbc';

const key = crypto.scryptSync(process.env.NEXT_PUBLIC_DM_SECRET_KEY || '', 'salt', 32);

export function encryptWithKey(dmId: string): string {
  if (!process.env.NEXT_PUBLIC_DM_SECRET_KEY) {
    throw new Error('DM_SECRET_KEY is not set');
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(dmId, 'utf8'), cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decryptWithKey(encryptedId: string): string {
  if (!process.env.NEXT_PUBLIC_DM_SECRET_KEY) {
    throw new Error('DM_SECRET_KEY is not set');
  }

  const [ivHex, encryptedHex] = encryptedId.split(':');
  if (!ivHex || !encryptedHex) {
    throw new Error('Invalid encryptedId format');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);

  return decrypted.toString('utf8');
}
