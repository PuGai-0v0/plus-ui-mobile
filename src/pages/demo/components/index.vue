<template>
  <view class="page-root" :class="themeStore.rootClass">
    <wd-navbar title="常用组件" fixed placeholder safe-area-inset-top />
    <view class="page-body">
      <view class="card">
        <view class="card-title">标签页 Tabs</view>
        <wd-tabs v-model="tabIndex">
          <wd-tab v-for="t in ['标签一', '标签二', '标签三']" :key="t" :title="t">
            <view class="tab-content">{{ t }} 内容区</view>
          </wd-tab>
        </wd-tabs>
      </view>
      <view class="card">
        <view class="card-title">轮播 Swiper</view>
        <wd-swiper :list="swiperList" autoplay :height="'140'" indicator />
      </view>
      <view class="card">
        <view class="card-title">折叠面板 Collapse</view>
        <wd-collapse v-model="collapseActive">
          <wd-collapse-item v-for="n in 3" :key="n" :name="`c${n}`" :title="`面板 ${n}`">
            这是面板 {{ n }} 的展开内容，演示折叠面板在多端的一致表现。
          </wd-collapse-item>
        </wd-collapse>
      </view>
      <view class="card">
        <view class="card-title">标签 Tag</view>
        <view class="inline">
          <wd-tag type="primary">主要</wd-tag>
          <wd-tag type="success">成功</wd-tag>
          <wd-tag type="warning">警告</wd-tag>
          <wd-tag type="danger">危险</wd-tag>
          <wd-tag type="primary" mark>圆弧</wd-tag>
        </view>
      </view>
      <view class="card">
        <view class="card-title">徽标 Badge</view>
        <view class="inline">
          <wd-badge :value="8"><view class="badge-box" /></wd-badge>
          <wd-badge :value="120" :max="99"><view class="badge-box" /></wd-badge>
          <wd-badge is-dot><view class="badge-box" /></wd-badge>
        </view>
      </view>
      <view class="card">
        <view class="card-title">进度条 Progress</view>
        <wd-progress :percentage="progress" />
        <wd-button size="small" class="mt" @click="progress = Math.min(100, progress + 10)"
          >+10%</wd-button
        >
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePageTheme } from '@/composables/usePageTheme';

const { themeStore } = usePageTheme();

const tabIndex = ref(0);
const collapseActive = ref<string[]>(['c1']);
const progress = ref(30);

const swiperList = ['/static/logo/logo.png', '/static/logo/logo.png', '/static/logo/logo.png'];
</script>

<style scoped>
.tab-content {
  padding: 16px;
  font-size: 13px;
  color: var(--wot-text-secondary, #999);
}

.inline {
  display: flex;
  align-items: center;
  gap: 12px;
}

.badge-box {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--wot-filled-bottom, #f7f8fa);
}

.mt {
  margin-top: 12px;
}
</style>
