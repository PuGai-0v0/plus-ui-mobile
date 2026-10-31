<template>
  <wd-skeleton :loading="loading" :animation="animation" :row-col="rowCol">
    <slot />
  </wd-skeleton>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SkeletonRowCol } from '@wot-ui/ui/components/wd-skeleton/types';

const props = withDefaults(
  defineProps<{
    /** 是否加载中：true 显示骨架，false 显示插槽内容 */
    loading?: boolean;
    /** 列表条数 */
    rows?: number;
    /** 左侧是否带圆形头像占位 */
    avatar?: boolean;
    animation?: 'gradient' | 'flashed' | '';
  }>(),
  { loading: true, rows: 3, avatar: false, animation: 'gradient' }
);

const rowCol = computed<SkeletonRowCol[]>(() =>
  Array.from({ length: props.rows }).map(() =>
    props.avatar
      ? [
          { type: 'circle' as const, size: '40px', marginRight: '12px' },
          { type: 'text' as const, height: '16px', width: '70%' },
        ]
      : [{ type: 'text' as const, height: '16px' }]
  )
);
</script>
