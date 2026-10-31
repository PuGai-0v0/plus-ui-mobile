<template>
  <view class="page-root" :class="themeStore.rootClass">
    <wd-navbar title="消息弹窗" fixed placeholder safe-area-inset-top />
    <view class="page-body">
      <view class="card">
        <view class="card-title">轻提示 Toast</view>
        <view class="btns">
          <wd-button size="small" @click="toast.success('操作成功')">成功</wd-button>
          <wd-button size="small" @click="toast.error('操作失败')">失败</wd-button>
          <wd-button size="small" @click="toast.warning('请注意')">警告</wd-button>
          <wd-button size="small" @click="showLoading">加载</wd-button>
        </view>
      </view>
      <view class="card">
        <view class="card-title">对话框 Dialog</view>
        <wd-button size="small" @click="openDialog">打开确认框</wd-button>
      </view>
      <view class="card">
        <view class="card-title">动作面板 ActionSheet</view>
        <wd-button size="small" @click="sheetVisible = true">打开动作面板</wd-button>
      </view>
      <view class="card">
        <view class="card-title">通知栏 Notify</view>
        <wd-button size="small" @click="showNotify({ type: 'success', message: '这是一条成功通知' })">显示通知</wd-button>
      </view>
    </view>
    <wd-toast />
    <wd-dialog />
    <wd-notify />
    <wd-action-sheet v-model="sheetVisible" :actions="sheetActions" @select="onSheetSelect" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useToast, useDialog, useNotify } from '@wot-ui/ui';
import { usePageTheme } from '@/composables/usePageTheme';

const { themeStore } = usePageTheme();

const toast = useToast();
const dialog = useDialog();
const { showNotify } = useNotify();

const sheetVisible = ref(false);
const sheetActions = [{ name: '选项一' }, { name: '选项二' }, { name: '选项三' }];

function openDialog() {
  dialog
    .confirm({ title: '提示', msg: '确定执行该操作吗？' })
    .then(() => toast.success('已确认'))
    .catch(() => toast.info('已取消'));
}

function showLoading() {
  toast.loading('加载中…');
  setTimeout(() => toast.close(), 2000);
}

function onSheetSelect({ item }: { item: { name: string } }) {
  sheetVisible.value = false;
  toast.show(`选择了：${item.name}`);
}
</script>

<style scoped>
.btns {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
