import CryptoJS from 'crypto-js';

const secretKey = process.env.NEXT_PUBLIC_DM_SECRET_KEY || '';
const key = CryptoJS.SHA256(secretKey);
const iv = CryptoJS.enc.Utf8.parse('1234567890123456');

export function encryptWithKey(dmId: string): string {
  if (!secretKey) throw new Error('Key is not set!');
  const ciphertext = CryptoJS.AES.encrypt(dmId, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
  return encodeURIComponent(ciphertext);
}

export function decryptWithKey(encryptedId: string): string {
  if (!secretKey) throw new Error('Key is not set!');
  const decoded = decodeURIComponent(encryptedId);
  const bytes = CryptoJS.AES.decrypt(decoded, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  if (!decrypted) throw new Error('Decryption failed. Possibly invalid key or corrupted data.');
  return decrypted;
}
