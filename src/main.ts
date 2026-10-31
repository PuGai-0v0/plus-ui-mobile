import { createSSRApp } from 'vue';
import App from './App.vue';
import pinia from './store';
// Wot Design Uni 主题变量（base 色板 + light/dark 语义层），深浅色切换依赖此文件
import '@wot-ui/ui/styles/theme/index.scss';
import './styles/theme.scss';
import './styles/common.scss';

export function createApp() {
  const app = createSSRApp(App);
  app.use(pinia);
  return {
    app,
  };
}
