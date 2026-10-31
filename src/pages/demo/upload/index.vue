<template>
  <view class="page-root" :class="themeStore.rootClass">
    <wd-navbar title="文件上传" fixed placeholder safe-area-inset-top />
    <view class="page-body">
      <view class="card">
        <view class="card-title">选择文件</view>
        <view class="btns">
          <wd-button size="small" type="primary" icon="camera" @click="choose('camera')"
            >拍照上传</wd-button
          >
          <wd-button size="small" plain icon="photo" @click="choose('album')">相册上传</wd-button>
        </view>
      </view>

      <view class="card">
        <view class="card-title">上传队列（{{ queue.length }}）</view>
        <wd-empty v-if="!queue.length" tip="点击上方按钮选择图片上传" />
        <view v-else class="upload-list">
          <view v-for="(item, idx) in queue" :key="idx" class="upload-item">
            <image :src="item.localPath" mode="aspectFill" class="thumb" @click="preview(idx)" />
            <view class="info">
              <view class="name">{{ item.fileName }}</view>
              <view v-if="item.status === 'uploading'" class="status uploading">
                上传中 {{ item.progress }}%
              </view>
              <view v-else-if="item.status === 'success'" class="status success">上传成功</view>
              <view v-else-if="item.status === 'fail'" class="status fail">
                上传失败
                <text class="retry" @click="retryUpload(idx)">重试</text>
              </view>
            </view>
            <view class="del" @click="remove(idx)">×</view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-title">已上传文件</view>
        <wd-empty v-if="!ossFiles.length" tip="暂无已上传文件" />
        <view v-else class="oss-grid">
          <view
            v-for="file in ossFiles"
            :key="file.ossId"
            class="oss-item"
            @click="previewOss(file.url)"
          >
            <image :src="file.url" mode="aspectFill" class="oss-thumb" />
            <view class="oss-name">{{ file.originalName }}</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { usePageTheme } from '@/composables/usePageTheme';
import { uploadFile } from '@/utils/upload';
import { toTimeValue } from '@/utils/date';
import { listOss, type OssFile } from '@/api/oss';

const { themeStore } = usePageTheme();

interface UploadItem {
  localPath: string;
  fileName: string;
  status: 'uploading' | 'success' | 'fail';
  progress: number;
  url?: string;
}

const queue = ref<UploadItem[]>([]);
const ossFiles = ref<OssFile[]>([]);

async function loadOssFiles() {
  try {
    const res = await listOss({ pageNum: 1, pageSize: 20 });
    ossFiles.value = res.rows
      .filter((f) => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(f.fileSuffix))
      .sort((a, b) => toTimeValue(b.createTime) - toTimeValue(a.createTime));
  } catch {
    /* ignore */
  }
}

onShow(() => loadOssFiles());

function choose(sourceType: 'camera' | 'album') {
  uni.chooseImage({
    count: 9,
    sourceType: [sourceType],
    success: (res) => {
      // tempFilePaths 类型定义为 string | string[]，归一化为数组后再 map
      const paths = Array.isArray(res.tempFilePaths) ? res.tempFilePaths : [res.tempFilePaths];
      const items: UploadItem[] = paths.map((path: string) => ({
        localPath: path,
        fileName: path.split('/').pop() || 'image.jpg',
        status: 'uploading' as const,
        progress: 0,
      }));
      queue.value.push(...items);
      const startIdx = queue.value.length - items.length;
      items.forEach((_, i) => doUpload(startIdx + i));
    },
    fail: () => {
      uni.showToast({ title: '已取消或当前设备不支持', icon: 'none' });
    },
  });
}

async function doUpload(idx: number) {
  const item = queue.value[idx];
  if (!item) return;
  item.status = 'uploading';
  item.progress = 0;
  try {
    const data = await uploadFile(item.localPath, item.fileName);
    item.status = 'success';
    item.progress = 100;
    item.url = data?.url;
  } catch {
    item.status = 'fail';
  }
}

function retryUpload(idx: number) {
  doUpload(idx);
}

function preview(idx: number) {
  const urls = queue.value.map((q) => q.localPath);
  uni.previewImage({ urls, current: urls[idx] });
}

function remove(idx: number) {
  queue.value.splice(idx, 1);
}

function previewOss(url: string) {
  uni.previewImage({ urls: [url], current: url });
}
</script>

<style scoped>
.btns {
  display: flex;
  gap: 12px;
}

.upload-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  background: var(--wot-filled-bottom, #f7f8fa);
}

.thumb {
  width: 64px;
  height: 64px;
  border-radius: 6px;
  flex-shrink: 0;
}

.info {
  flex: 1;
  min-width: 0;
}

.name {
  font-size: 13px;
  color: var(--wot-text-main, #1d1f29);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status {
  margin-top: 4px;
  font-size: 12px;
}

.status.uploading {
  color: var(--wot-primary-6, #4d80f0);
}

.status.success {
  color: var(--wot-green-5, #34c759);
}

.status.fail {
  color: var(--wot-red-5, #fa4350);
}

.retry {
  margin-left: 8px;
  color: var(--wot-primary-6, #4d80f0);
  text-decoration: underline;
}

.del {
  width: 24px;
  height: 24px;
  line-height: 22px;
  text-align: center;
  border-radius: 50%;
  background: var(--wot-red-5, #fa4350);
  color: #fff;
  font-size: 14px;
  flex-shrink: 0;
}

.oss-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.oss-item {
  width: 80px;
  text-align: center;
}

.oss-thumb {
  width: 80px;
  height: 80px;
  border-radius: 6px;
}

.oss-name {
  margin-top: 4px;
  font-size: 11px;
  color: var(--wot-text-secondary, #999);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
