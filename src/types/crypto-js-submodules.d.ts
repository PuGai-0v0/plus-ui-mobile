/**
 * crypto-js 子模块（按需导入）的类型声明。
 * @types/crypto-js 仅覆盖根入口，子模块路径无类型，此处在项目内补齐最小结构声明。
 */
declare module 'crypto-js/aes' {
  import type * as CryptoJSType from 'crypto-js';
  const AES: {
    encrypt(
      message: string,
      key: CryptoJSType.lib.WordArray,
      cfg?: { mode?: any; padding?: any }
    ): { toString(): string };
    decrypt(
      ciphertext: string,
      key: CryptoJSType.lib.WordArray,
      cfg?: { mode?: any; padding?: any }
    ): { toString(enc?: any): string };
  };
  export default AES;
}

declare module 'crypto-js/enc-utf8' {
  import type * as CryptoJSType from 'crypto-js';
  const Utf8: { parse(s: string): CryptoJSType.lib.WordArray };
  export default Utf8;
}

declare module 'crypto-js/enc-base64' {
  import type * as CryptoJSType from 'crypto-js';
  const Base64: {
    stringify(w: CryptoJSType.lib.WordArray): string;
    parse(s: string): CryptoJSType.lib.WordArray;
  };
  export default Base64;
}

declare module 'crypto-js/mode-ecb' {
  const ECB: any;
  export default ECB;
}

declare module 'crypto-js/pad-pkcs7' {
  const Pkcs7: any;
  export default Pkcs7;
}
