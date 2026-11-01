<template>
  <view class="page-root" :class="themeStore.rootClass">
    <wd-navbar title="选择器" fixed placeholder safe-area-inset-top />
    <view class="page-body">
      <view class="card">
        <view class="card-title">普通多列选择器</view>
        <view class="row" @click="basicVisible = true">
          <text>已选：{{ basicValue.join(' / ') || '请选择' }}</text>
          <text>›</text>
        </view>
      </view>
      <view class="card">
        <view class="card-title">级联选择器</view>
        <view class="row" @click="cascadeVisible = true">
          <text>已选：{{ cascadeLabel || '请选择' }}</text>
          <text>›</text>
        </view>
      </view>
      <view class="card">
        <view class="card-title">日期时间选择器</view>
        <view class="row" @click="dateVisible = true">
          <text>已选：{{ dateLabel || '请选择' }}</text>
          <text>›</text>
        </view>
      </view>
    </view>
    <wd-picker
      v-model="basicValue"
      :columns="basicColumns"
      :visible="basicVisible"
      @confirm="onBasicConfirm"
      @cancel="basicVisible = false"
    />
    <wd-picker
      v-model="cascadeValue"
      :columns="cascadeColumns"
      cascade
      :visible="cascadeVisible"
      @confirm="onCascadeConfirm"
      @cancel="cascadeVisible = false"
    />
    <wd-datetime-picker
      v-model="dateValue"
      type="datetime"
      use-second
      :visible="dateVisible"
      @confirm="onDateConfirm"
      @cancel="dateVisible = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePageTheme } from '@/composables/usePageTheme';
import { formatDateTime } from '@/utils/date';

const { themeStore } = usePageTheme();

const basicVisible = ref(false);
const basicValue = ref<(string | number)[]>([]);
const basicColumns = [
  ['办公', '财务', '人事', '行政'],
  ['待办', '进行中', '已完成'],
];

function onBasicConfirm({ value }: { value: (string | number)[] }) {
  basicValue.value = value;
  basicVisible.value = false;
}

const cascadeVisible = ref(false);
const cascadeValue = ref<(string | number)[]>([]);
const cascadeLabel = ref('');
const cascadeColumns = [
  {
    value: 'zj',
    label: '浙江省',
    children: [
      { value: 'hz', label: '杭州市', children: [{ value: 'xh', label: '西湖区' }, { value: 'yh', label: '余杭区' }] },
      { value: 'nb', label: '宁波市', children: [{ value: 'hs', label: '海曙区' }] },
    ],
  },
  {
    value: 'js',
    label: '江苏省',
    children: [{ value: 'nj', label: '南京市', children: [{ value: 'xw', label: '玄武区' }] }],
  },
];

function onCascadeConfirm({ value, selectedItems }: { value: (string | number)[]; selectedItems: any[] }) {
  cascadeValue.value = value;
  cascadeLabel.value = selectedItems.map((i: any) => i.label).join(' / ');
  cascadeVisible.value = false;
}

const dateVisible = ref(false);
const dateValue = ref(Date.now());
// 初值与选择器默认值（当前时间）一致，避免首渲染有值却显示"请选择"；use-second 开启秒列，展示带秒
const dateLabel = ref(formatDateTime(Date.now()));

function onDateConfirm({ value }: { value: number }) {
  dateValue.value = value;
  dateLabel.value = formatDateTime(value);
  dateVisible.value = false;
}
</script>

<style scoped>
.row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 14px;
  color: var(--wot-text-main, #1d1f29);
}
</style>
