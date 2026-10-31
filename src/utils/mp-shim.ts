/**
 * 浏览器环境垫片：为 jsencrypt 提供最小 window/self/navigator/crypto 全局对象。
 * H5 端这些对象本来就存在，下面的赋值不会触发；
 * App/小程序端缺失时补上，让 jsencrypt 能初始化（随机数走它自带的 Math.random 回退路径）。
 * 必须在 jsencrypt 模块求值之前执行（见 jsencrypt.ts 的首行 import）。
 */
declare const global: any;

// 支付宝小程序逻辑层没有 globalThis，
// 故逐级回退：globalThis -> self -> window -> global；typeof 探测不会抛 ReferenceError
const g: any =
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
        ? window
        : typeof global !== 'undefined'
          ? global
          : {};

if (typeof g.window === 'undefined') {
  g.window = g;
}
// jsencrypt 的 rng.js 只守卫了 typeof window，却直接读 self.crypto，
// App 端必须补齐 self，否则抛 Cannot read property 'crypto' of undefined
if (typeof g.self === 'undefined') {
  g.self = g;
}
if (typeof g.navigator === 'undefined') {
  g.navigator = { appName: 'Netscape' };
}
if (typeof g.crypto === 'undefined') {
  // 给空对象即可：jsencrypt 内部按 "crypto && crypto.getRandomValues" 判断，
  // 缺失时自动回退自带 PRNG；这里只是防止裸标识符 ReferenceError
  g.crypto = {};
}

export {};
