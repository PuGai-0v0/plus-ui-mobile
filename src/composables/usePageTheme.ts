import { computed, provide } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useThemeStore } from '@/store/theme';

/**
 * 页面主题统一接入：根节点挂主题 class + onShow 重放原生部件配色
 * 用法：模板根元素写 :class="themeStore.rootClass"
 * onShow 重放原因：onLaunch 时 tabBar 尚未挂载，冷启动进入 tab 页需重放一次原生部件配色；
 * 每次 show 重放同时覆盖「在别的页切换主题后返回」的场景
 */
export function usePageTheme() {
  const themeStore = useThemeStore();
  onShow(() => themeStore.apply());
  // 支付宝端原生 picker-view-column 的 slot 节点在部分创建路径下丢失 CSS 变量继承，
  // 列文字色改以具体色值经 provide 下发，由 wot picker-view 补丁 inject 后内联使用
  provide(
    'wot-picker-column-item-color',
    computed(() => (themeStore.effectiveTheme === 'dark' ? '#f7f8fa' : '#1d1f29'))
  );
  return { themeStore };
}
