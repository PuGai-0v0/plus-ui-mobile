<template>
  <view class="page-root" :class="themeStore.rootClass">
    <wd-navbar title="首页" fixed placeholder safe-area-inset-top />

    <view class="page-body">
      <!-- 横幅 -->
      <wd-skeleton
        :loading="loading"
        animation="gradient"
        :row-col="[{ type: 'rect', height: '120px', borderRadius: '12px' }]"
      >
        <view class="banner">
          <view class="banner-title">RuoYi-Vue-Plus 移动端</view>
          <view class="banner-desc">深浅色主题 · 骨架屏 · 多端一致</view>
        </view>
      </wd-skeleton>

      <!-- 快捷入口 -->
      <view class="card">
        <wd-skeleton :loading="loading" animation="gradient" :row-col="gridSkeleton">
          <wd-grid :column="4">
            <wd-grid-item
              v-for="item in shortcuts"
              :key="item.icon"
              :icon="item.icon"
              :text="item.label"
              icon-color="var(--wot-primary-6)"
              @click="handleShortcut(item.label)"
            />
          </wd-grid>
        </wd-skeleton>
      </view>

      <!-- 通知公告 -->
      <view class="card">
        <view class="card-title">通知公告</view>
        <!-- 骨架与内容平级切换：经自定义组件转发 slot 会触发微信渲染层错误 -->
        <wd-skeleton v-if="loading" animation="gradient" :row-col="noticeSkeleton" />
        <wd-cell-group v-else border>
          <wd-cell
            v-for="notice in notices"
            :key="notice.id"
            :title="notice.title"
            :value="notice.date"
            is-link
            @click="handleNotice(notice.title)"
          />
        </wd-cell-group>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import { usePageTheme } from '@/composables/usePageTheme';
import type { SkeletonRowCol } from '@wot-ui/ui/components/wd-skeleton/types';

const { themeStore } = usePageTheme();

const loading = ref(true);

const shortcuts = [
  { icon: 'scan', label: '扫一扫' },
  { icon: 'notification', label: '通知公告' },
  { icon: 'folder', label: '文件中心' },
  { icon: 'settings', label: '系统设置' },
];

const notices = [
  { id: 1, title: '系统升级维护通知', date: '08-26' },
  { id: 2, title: 'v1.0.0 版本发布公告', date: '08-22' },
  { id: 3, title: '信息安全培训报名', date: '08-18' },
  { id: 4, title: '考勤规则调整说明', date: '08-12' },
];

const gridSkeleton: SkeletonRowCol[] = [
  [
    { type: 'circle', size: '32px' },
    { type: 'circle', size: '32px' },
    { type: 'circle', size: '32px' },
    { type: 'circle', size: '32px' },
  ],
  { type: 'text', height: '12px', marginTop: '12px' },
];

/** 通知公告骨架：4 行「头像 + 文本」（与 list-skeleton 的 avatar 模式一致） */
const noticeSkeleton: SkeletonRowCol[] = Array.from({ length: 4 }).map(() => [
  { type: 'circle' as const, size: '40px', marginRight: '12px' },
  { type: 'text' as const, height: '16px', width: '70%' },
]);

/** 模拟异步请求，接后端真实接口时替换为 request 调用 */
async function loadData() {
  loading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 800));
  loading.value = false;
}

function handleShortcut(label: string) {
  uni.showToast({ title: label, icon: 'none' });
}

function handleNotice(title: string) {
  uni.showToast({ title, icon: 'none' });
}

onLoad(() => loadData());

onPullDownRefresh(async () => {
  await loadData();
  uni.stopPullDownRefresh();
});
</script>

<style scoped>
.banner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 120px;
  padding: 0 20px;
  border-radius: 12px;
  color: var(--wot-text-white, #fff);
  background: linear-gradient(135deg, var(--wot-primary-6), var(--wot-primary-4));
}

.banner-title {
  font-size: 20px;
  font-weight: 600;
}

.banner-desc {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.85;
}
</style>
