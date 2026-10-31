import { defineStore } from 'pinia';
import { request } from '@/utils/request';
import { TOKEN_KEY } from '@/config';
import { CLIENT_ID } from '@/config';

interface UserInfo {
  userId: number;
  username: string;
  nickname: string;
  clientKey?: string;
  deviceType?: string;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: uni.getStorageSync(TOKEN_KEY) as string,
    userInfo: null as UserInfo | null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    /** 账号密码登录（body 走加密链；验证码开启时带 code/uuid） */
    async login(username: string, password: string, code?: string, uuid?: string) {
      const data = await request<{ access_token: string; expire_in: number }>({
        url: '/auth/login',
        method: 'POST',
        silent: true,
        encrypt: true,
        data: {
          clientId: CLIENT_ID,
          grantType: 'password',
          username,
          password,
          ...(code ? { code, uuid } : {}),
        },
      });
      this.token = data.access_token;
      uni.setStorageSync(TOKEN_KEY, data.access_token);
    },
    /** 拉取用户信息（走 /app/**，app 客户端 access_path 限定） */
    async fetchUserInfo() {
      this.userInfo = await request<UserInfo>({ url: '/app/user/info' });
    },
    /** 退出登录：先服务端注销，再本地清除 */
    async logout() {
      try {
        await request({ url: '/app/user/logout', method: 'POST', silent: true });
      } finally {
        this.token = '';
        this.userInfo = null;
        uni.removeStorageSync(TOKEN_KEY);
        uni.reLaunch({ url: '/pages/login/index' });
      }
    },
  },
});
