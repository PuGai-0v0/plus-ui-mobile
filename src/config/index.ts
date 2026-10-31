// 后端基础地址配置（环境分离版：开发/生产由 .env.development / .env.production 提供）
let baseUrl = '';
// #ifdef H5
// H5：开发环境走 vite 代理，避免跨域；生产环境用 .env.production 的域名
baseUrl = import.meta.env.DEV ? '/dev-api' : import.meta.env.VITE_APP_H5_PROD_URL;
// #endif

// #ifndef H5
// 小程序/App：直连后端。开发用 .env.development 的地址，上线自动切 .env.production
baseUrl = import.meta.env.VITE_APP_BASE_URL;
// #endif

// 移动端专用客户端 ID（对应 sys_client 表
export const CLIENT_ID = import.meta.env.VITE_CLIENT_ID || '';

export const BASE_URL = baseUrl;

/** AES 密钥传输头（后端 api-decrypt.headerFlag） */
export const ENCRYPT_HEADER = 'encrypt-key';
/** 请求加密公钥（对应后端"请求解密私钥"） */
export const RSA_PUBLIC_KEY = import.meta.env.VITE_RSA_PUBLIC_KEY || '';
/** 响应解密私钥（仅 @ApiEncrypt(response=true) 的接口用到） */
export const RSA_PRIVATE_KEY = import.meta.env.VITE_RSA_PRIVATE_KEY || '';

/** 高德地图 H5 JS API key 与安全码（为空时地图页降级为坐标卡片） */
export const AMAP_WEB_KEY = import.meta.env.VITE_AMAP_WEB_KEY || '';
export const AMAP_SECURITY_CODE = import.meta.env.VITE_AMAP_SECURITY_CODE || '';

/** 规范化前缀：非空时保证以 '-' 结尾 */
function withDash(p: string): string {
  const t = (p || '').trim();
  return t ? (t.endsWith('-') ? t : `${t}-`) : '';
}

/**
 * 存储 key 前缀（同域多实例部署隔离），解析顺序：
 * 1) 构建期 VITE_STORAGE_PREFIX 优先 —— 适用"每套独立构建、各自 .env"模型；
 * 2) 未设置时 H5 运行时按访问路径一级目录推导 —— 适用"同一产物部署多路径"模型（根目录部署为空前缀，向后兼容）；
 * 3) 小程序/APP 不加前缀：存储按 appid / 应用包天然隔离。
 */
function resolveStoragePrefix(): string {
  const fromEnv = withDash(import.meta.env.VITE_STORAGE_PREFIX);
  if (fromEnv) return fromEnv;
  // #ifdef H5
  const first =
    typeof location !== 'undefined' ? location.pathname.split('/').filter(Boolean)[0] || '' : '';
  return withDash(first);
  // #endif
  return '';
}

/** 当前实例的存储 key 前缀（空串表示无前缀） */
export const STORAGE_PREFIX = resolveStoragePrefix();
/** token 存储 key（带实例前缀，避免同 origin 多实例互相覆盖登录态） */
export const TOKEN_KEY = `${STORAGE_PREFIX}App-Token`;
/** 主题模式存储 key（带实例前缀，避免同 origin 多实例主题互相跟随） */
export const THEME_MODE_KEY = `${STORAGE_PREFIX}App-Theme-Mode`;
