<template>
  <view class="page-root" :class="themeStore.rootClass">
    <wd-navbar title="工作台" fixed placeholder safe-area-inset-top />
    <view class="page-body">
      <view v-for="cat in workbenchCategories" :key="cat.key" class="card">
        <view class="card-title">{{ cat.title }}</view>
        <wd-grid :column="4" clickable>
          <wd-grid-item
            v-for="entry in cat.entries"
            :key="entry.key"
            :icon="entry.icon"
            :text="entry.label"
            icon-color="var(--wot-primary-6)"
            @click="go(entry.path)"
          />
        </wd-grid>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { workbenchCategories } from '@/config/workbench';
import { usePageTheme } from '@/composables/usePageTheme';

const { themeStore } = usePageTheme();

function go(path: string) {
  uni.navigateTo({ url: path });
}
</script>
