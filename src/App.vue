<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/user';
import { useThemeStore } from '@/store/theme';

onLaunch(() => {
  // 主题初始化先于路由守卫：探测系统深浅色、恢复用户偏好、应用原生部件配色
  useThemeStore().init();

  const userStore = useUserStore();
  if (!userStore.isLoggedIn) {
    uni.reLaunch({ url: '/pages/login/index' });
  }
});
</script>

<style>
/* 全局样式可写在这里 */
</style>
