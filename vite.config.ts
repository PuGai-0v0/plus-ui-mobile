import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

export default defineConfig({
  plugins: [uni()],
  server: {
    // 绑定所有网卡：localhost/127.0.0.1/局域网 IP（手机真机测试）均可访问；默认只绑 localhost
    host: 'localhost',
    port: 5173,
    proxy: {
      // H5 开发时 /dev-api 开头的请求转发到后端，去掉 /dev-api 前缀
      '/dev-api': {
        // 改成你的后端地址：本机后端用 localhost:8080
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dev-api/, ''),
      },
    },
  },
});
