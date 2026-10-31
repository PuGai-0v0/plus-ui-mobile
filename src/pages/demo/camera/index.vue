<template>
  <view class="page-root" :class="themeStore.rootClass">
    <wd-navbar title="相机相册" fixed placeholder safe-area-inset-top />
    <view class="page-body">
      <view class="card">
        <view class="card-title">拍照 / 选择图片</view>
        <view class="btns">
          <wd-button size="small" type="primary" icon="camera" @click="choose('camera')"
            >拍照</wd-button
          >
          <wd-button size="small" plain icon="photo" @click="choose('album')">从相册选择</wd-button>
        </view>
      </view>
      <view class="card">
        <view class="card-title">已选图片（{{ images.length }}）</view>
        <wd-empty v-if="!images.length" tip="点击上方按钮添加图片" />
        <view v-else class="img-grid">
          <view v-for="(img, idx) in images" :key="img" class="img-wrap">
            <image :src="img" mode="aspectFill" class="thumb" @click="preview(idx)" />
            <view class="del" @click="remove(idx)">×</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePageTheme } from '@/composables/usePageTheme';

const { themeStore } = usePageTheme();

const images = ref<string[]>([]);

function choose(sourceType: 'camera' | 'album') {
  uni.chooseImage({
    count: 9,
    sourceType: [sourceType],
    success: (res) => {
      images.value = [...images.value, ...res.tempFilePaths];
    },
    fail: () => {
      uni.showToast({ title: '已取消或当前设备不支持', icon: 'none' });
    },
  });
}

function preview(idx: number) {
  uni.previewImage({ urls: images.value, current: images.value[idx] });
}

function remove(idx: number) {
  images.value.splice(idx, 1);
}
</script>

<style scoped>
.btns {
  display: flex;
  gap: 12px;
}

.img-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.img-wrap {
  position: relative;
  width: 96px;
  height: 96px;
}

.thumb {
  width: 96px;
  height: 96px;
  border-radius: 8px;
}

.del {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  line-height: 18px;
  text-align: center;
  border-radius: 50%;
  background: var(--wot-red-5, #fa4350);
  color: #fff;
  font-size: 14px;
}
</style>
