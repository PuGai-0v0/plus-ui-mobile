import AES from 'crypto-js/aes';
import EncBase64 from 'crypto-js/enc-base64';
import EncUtf8 from 'crypto-js/enc-utf8';
import ModeECB from 'crypto-js/mode-ecb';
import PadPkcs7 from 'crypto-js/pad-pkcs7';
import type * as CryptoJSType from 'crypto-js';

/** WordArray 类型路径：@types/crypto-js 为 export = 命名空间导出 */
type WordArray = CryptoJSType.lib.WordArray;

/**
 * 密码学安全随机字节，按能力降级：
 * 1) Web Crypto（H5、APP webview 等提供 crypto 全局的容器）——同步安全随机；
 * 2) 微信小程序 wx.getRandomValues（基础库 2.15.0+，异步安全随机）；
 * 3) 支付宝等容器若提供 my.getRandomValues 则使用（运行时探测，官方未公开时自动跳过）；
 * 4) 兜底 Math.random（非密码学安全，仅极端容器，开发期告警）。
 */
async function secureRandomBytes(length: number): Promise<Uint8Array> {
  const g = globalThis as any;
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
  }
  // #ifdef MP-WEIXIN
  if (g.wx && typeof g.wx.getRandomValues === 'function') {
    return await new Promise<Uint8Array>((resolve, reject) => {
      g.wx.getRandomValues({
        length,
        success: (res: any) => resolve(new Uint8Array(res.randomValues)),
        fail: reject,
      });
    });
  }
  // #endif
  // #ifdef MP-ALIPAY
  if (g.my && typeof g.my.getRandomValues === 'function') {
    return await new Promise<Uint8Array>((resolve, reject) => {
      g.my.getRandomValues({
        length,
        success: (res: any) => resolve(new Uint8Array(res.randomValues ?? res.random)),
        fail: reject,
      });
    });
  }
  // #endif
  if (import.meta.env.DEV) {
    console.warn('[crypto] 当前容器无密码学安全随机 API，降级 Math.random（AES 密钥强度降低）');
  }
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

/** 生成 AES-128 密钥：16 安全随机字节 → 32 位 hex → WordArray（异步：小程序安全随机 API 为回调式） */
export const generateAesKey = async (): Promise<WordArray> => {
  const bytes = await secureRandomBytes(16);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return EncUtf8.parse(hex);
};

export const encryptBase64 = (str: WordArray): string => EncBase64.stringify(str);

export const decryptBase64 = (str: string): WordArray => EncBase64.parse(str);

/** AES-ECB + Pkcs7 加密（与后端 CryptoFilter 解密方式一致；ECB 为后端契约，勿单端更改） */
export const encryptWithAes = (message: string, aesKey: WordArray): string =>
  AES.encrypt(message, aesKey, { mode: ModeECB, padding: PadPkcs7 }).toString();

export const decryptWithAes = (message: string, aesKey: WordArray): string =>
  AES.decrypt(message, aesKey, { mode: ModeECB, padding: PadPkcs7 }).toString(EncUtf8 as any);
