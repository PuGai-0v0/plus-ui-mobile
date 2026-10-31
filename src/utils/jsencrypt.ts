// 垫片必须第一行引入，保证在 jsencrypt 模块求值前完成全局对象补齐（小程序端）
import '@/utils/mp-shim';
import { JSEncrypt } from 'jsencrypt';
import { RSA_PUBLIC_KEY, RSA_PRIVATE_KEY } from '@/config';

/** RSA 加密（请求侧：公钥包装 AES 密钥） */
export const rsaEncrypt = (txt: string): string => {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(RSA_PUBLIC_KEY);
  const result = encryptor.encrypt(txt);
  if (result === false) {
    throw new Error('RSA 加密失败');
  }
  return result;
};

/** RSA 解密（响应侧：仅 @ApiEncrypt(response=true) 的接口用到） */
export const rsaDecrypt = (txt: string): string | false => {
  const encryptor = new JSEncrypt();
  encryptor.setPrivateKey(RSA_PRIVATE_KEY);
  return encryptor.decrypt(txt);
};
