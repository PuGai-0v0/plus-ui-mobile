<template>
  <view class="page-root" :class="themeStore.rootClass">
    <wd-navbar title="扫一扫" fixed placeholder safe-area-inset-top />
    <view class="page-body">
      <!-- #ifdef H5 -->
      <view class="card">
        <wd-empty
          icon="warning"
          tip="H5 端暂不支持扫码，请在微信小程序 / 支付宝小程序 / APP 中使用"
        />
      </view>
      <!-- #endif -->
      <!-- #ifndef H5 -->
      <view class="card">
        <wd-button type="primary" block icon="scan" @click="onScan">开始扫码</wd-button>
      </view>
      <!-- #endif -->
      <view v-if="result" class="card">
        <view class="card-title">扫码结果</view>
        <view class="result-type">类型：{{ result.scanType }}</view>
        <view class="result-text">{{ result.result }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePageTheme } from '@/composables/usePageTheme';

const { themeStore } = usePageTheme();

const result = ref<{ scanType: string; result: string }>();

function onScan() {
  uni.scanCode({
    success: (res) => {
      result.value = { scanType: res.scanType, result: res.result };
    },
    fail: () => {
      uni.showToast({ title: '已取消或当前平台不支持扫码', icon: 'none' });
    },
  });
}
</script>

<style scoped>
.result-type {
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--wot-text-secondary, #999);
}

.result-text {
  padding: 10px;
  border-radius: 8px;
  background: var(--wot-filled-bottom, #f7f8fa);
  font-size: 14px;
  word-break: break-all;
  color: var(--wot-text-main, #1d1f29);
}
</style>
