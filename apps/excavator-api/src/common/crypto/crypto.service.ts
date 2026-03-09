import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

@Injectable()
export class CryptoService {
  private readonly key: Buffer;

  constructor(private configService: ConfigService) {
    const raw = this.configService.get<string>('ENCRYPTION_KEY');
    if (!raw || raw.length < 32) {
      throw new Error(
        'ENCRYPTION_KEY must be set and at least 32 characters (64 hex chars recommended for AES-256)',
      );
    }
    this.key = raw.length === 64 && /^[0-9a-fA-F]+$/.test(raw)
      ? Buffer.from(raw, 'hex')
      : crypto.scryptSync(raw, 'excavator-salt', KEY_LENGTH);
  }

  /**
   * 加密明文，返回 base64 字符串（IV + authTag + ciphertext）
   */
  encrypt(plainText: string | null | undefined): string | null {
    if (plainText == null || plainText === '') return null;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    const encrypted = Buffer.concat([
      cipher.update(plainText, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  /**
   * 解密 base64 密文，返回明文
   */
  decrypt(cipherText: string | null | undefined): string | null {
    if (cipherText == null || cipherText === '') return null;
    try {
      const buf = Buffer.from(cipherText, 'base64');
      if (buf.length < IV_LENGTH + AUTH_TAG_LENGTH) return null;
      const iv = buf.subarray(0, IV_LENGTH);
      const authTag = buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
      const encrypted = buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
      const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv, {
        authTagLength: AUTH_TAG_LENGTH,
      });
      decipher.setAuthTag(authTag);
      return decipher.update(encrypted) + decipher.final('utf8');
    } catch {
      return null;
    }
  }
}
