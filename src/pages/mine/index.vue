<template>
  <view class="page-root" :class="themeStore.rootClass">
    <wd-navbar title="我的" fixed placeholder safe-area-inset-top />
    <view v-if="infoLoading" class="info-skeleton">
      <list-skeleton :rows="3" />
    </view>
    <wd-cell-group v-else border>
      <wd-cell title="账号" :value="userStore.userInfo?.username || '-'" />
      <wd-cell title="昵称" :value="userStore.userInfo?.nickname || '-'" />
      <wd-cell title="客户端" :value="userStore.userInfo?.clientKey || '-'" />
    </wd-cell-group>
    <wd-cell-group border title="偏好设置">
      <wd-cell
        title="外观模式"
        :value="themeStore.modeText"
        is-link
        @click="showThemeSheet = true"
      />
    </wd-cell-group>
    <view style="padding: 24px">
      <wd-button type="danger" plain block @click="userStore.logout()">退出登录</wd-button>
    </view>
    <wd-action-sheet
      v-model="showThemeSheet"
      title="选择外观模式"
      cancel-text="取消"
      :actions="themeActions"
      @select="onThemeSelect"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/user';
import { MODE_TEXT, type ThemeMode } from '@/store/theme';
import { usePageTheme } from '@/composables/usePageTheme';

const userStore = useUserStore();
const { themeStore } = usePageTheme();

const showThemeSheet = ref(false);
const infoLoading = ref(false);
const themeActions = computed(() =>
  (['auto', 'light', 'dark'] as ThemeMode[]).map((m) => ({
    name: MODE_TEXT[m],
    description: themeStore.mode === m ? '当前使用' : '',
    mode: m,
  }))
);

function onThemeSelect({ item }: { item: { mode?: ThemeMode } }) {
  if (item.mode) {
    themeStore.setMode(item.mode);
  }
}

onShow(() => {
  if (userStore.isLoggedIn && !userStore.userInfo) {
    infoLoading.value = true;
    userStore
      .fetchUserInfo()
      .catch(() => {})
      .finally(() => {
        infoLoading.value = false;
      });
  }
});
</script>

<style scoped>
.info-skeleton {
  padding: 16px;
  background: var(--wot-filled-oppo, #fff);
}
</style>
