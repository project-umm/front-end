import CryptoJS from 'crypto-js';

const key = process.env.NEXT_PUBLIC_DM_SECRET_KEY || '';

export function encryptWithKey(dmId: string): string {
  if (!key) throw new Error('Key is not set!');
  const ciphertext = CryptoJS.AES.encrypt(dmId, key).toString();
  return encodeURIComponent(ciphertext);
}

export function decryptWithKey(encryptedId: string): string {
  if (!key) throw new Error('Key is not set!');
  // 👉 URL 디코딩 후 복호화
  const decoded = decodeURIComponent(encryptedId);
  const bytes = CryptoJS.AES.decrypt(decoded, key);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  if (!decrypted) throw new Error('Decryption failed. Possibly invalid key or corrupted data.');
  return decrypted;
}
