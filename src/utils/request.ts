import { BASE_URL, CLIENT_ID, ENCRYPT_HEADER, TOKEN_KEY } from '@/config';
import {
  decryptBase64,
  decryptWithAes,
  encryptBase64,
  encryptWithAes,
  generateAesKey,
} from '@/utils/crypto';
import { rsaDecrypt, rsaEncrypt } from '@/utils/jsencrypt';

/** RuoYi 统一响应结构 */
interface R<T = any> {
  code: number;
  msg: string;
  data: T;
}

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: Record<string, string>;
  /** 为 true 时 401 不自动跳登录页（登录接口自己用） */
  silent?: boolean;
  /** 为 true 时请求体走 AES+RSA 加密链（对应后端 @ApiEncrypt 接口，如 /auth/login） */
  encrypt?: boolean;
}

/** 大小写不敏感地取响应头（各端响应头大小写可能不同） */
function pickHeader(header: Record<string, any> | undefined, name: string): string | undefined {
  if (!header) return undefined;
  const lower = name.toLowerCase();
  for (const key of Object.keys(header)) {
    if (key.toLowerCase() === lower) return header[key];
  }
  return undefined;
}

export async function request<T = any>(options: RequestOptions): Promise<T> {
  const token = uni.getStorageSync(TOKEN_KEY);
  const method = options.method || 'GET';
  const header: Record<string, string> = {
    'Content-Type': 'application/json;charset=UTF-8',
    Authorization: token ? `Bearer ${token}` : '',
    clientid: CLIENT_ID,
    ...options.header,
  };
  let data: any = options.data;

  // 加密链：AES 加密请求体，RSA 公钥包装 AES 密钥放入 encrypt-key 头
  if (options.encrypt && (method === 'POST' || method === 'PUT')) {
    const aesKey = await generateAesKey();
    header[ENCRYPT_HEADER] = rsaEncrypt(encryptBase64(aesKey));
    data =
      typeof data === 'object'
        ? encryptWithAes(JSON.stringify(data), aesKey)
        : encryptWithAes(String(data ?? ''), aesKey);
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method,
      data,
      header,
      success: (res) => {
        // HTTP 层 401（token 失效）
        if (res.statusCode === 401) {
          handleUnauthorized(options.silent);
          return reject(new Error('登录状态已过期'));
        }
        // 响应解密：响应带 encrypt-key 头时（接口开了 response=true）
        let payload: any = res.data;
        const keyStr = pickHeader(res.header, ENCRYPT_HEADER);
        if (keyStr) {
          const base64Key = rsaDecrypt(keyStr);
          if (base64Key === false) {
            return reject(new Error('响应密钥解密失败'));
          }
          payload = JSON.parse(decryptWithAes(String(payload), decryptBase64(base64Key)));
        }
        const r = payload as R<T>;
        if (r.code === 200) {
          return resolve(r.data);
        }
        if (r.code === 401) {
          handleUnauthorized(options.silent);
          return reject(new Error('登录状态已过期'));
        }
        uni.showToast({ title: r.msg || '请求失败', icon: 'none' });
        reject(new Error(r.msg || '请求失败'));
      },
      fail: (err) => {
        uni.showToast({ title: '网络异常，请检查后端服务', icon: 'none' });
        reject(err);
      },
    });
  });
}

function handleUnauthorized(silent?: boolean) {
  uni.removeStorageSync(TOKEN_KEY);
  if (silent) return;
  uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
  setTimeout(() => {
    uni.reLaunch({ url: '/pages/login/index' });
  }, 800);
}
