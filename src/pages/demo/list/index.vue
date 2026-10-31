<template>
  <view class="page-root" :class="themeStore.rootClass">
    <wd-navbar title="数据列表" fixed placeholder safe-area-inset-top />
    <view class="page-body">
      <view class="card">
        <wd-search
          v-model="keyword"
          placeholder="搜索标题"
          @search="onSearch"
          @clear="onSearch"
          @cancel="onCancel"
        />
      </view>
      <view class="card">
        <list-skeleton v-if="firstLoading" :loading="true" :rows="6" />
        <wd-empty v-else-if="!items.length" tip="暂无数据" />
        <template v-else>
          <wd-cell-group border>
            <wd-cell
              v-for="item in items"
              :key="item.id"
              :title="item.title"
              :value="`¥${Number(item.amount).toFixed(2)}`"
              is-link
              @click="goEdit(item.id!)"
            >
              <template #icon>
                <wd-tag :type="item.status === '0' ? 'primary' : 'danger'" size="small">
                  {{ item.category }}
                </wd-tag>
              </template>
            </wd-cell>
          </wd-cell-group>
          <view class="pagination">
            <view class="pagination-info">
              共 {{ total }} 条，第 {{ pageNum }}/{{ totalPages }} 页
            </view>
            <view class="pagination-btns">
              <wd-button size="small" plain :disabled="pageNum <= 1" @click="goPage(pageNum - 1)"
                >上一页</wd-button
              >
              <wd-button
                size="small"
                plain
                :disabled="pageNum >= totalPages"
                @click="goPage(pageNum + 1)"
                >下一页</wd-button
              >
            </view>
          </view>
        </template>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { listItem, type DemoItem } from '@/api/demo';
import { usePageTheme } from '@/composables/usePageTheme';

const { themeStore } = usePageTheme();

const keyword = ref('');
const items = ref<DemoItem[]>([]);
const pageNum = ref(1);
const pageSize = 10;
const total = ref(0);
const firstLoading = ref(true);
const loadingMore = ref(false);
const finished = ref(false);

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));

function goPage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  pageNum.value = page;
  loadData(true);
}

async function loadData(reset = false) {
  if (reset) {
    finished.value = false;
    firstLoading.value = true;
  } else {
    loadingMore.value = true;
  }
  try {
    const res = await listItem({ pageNum: pageNum.value, pageSize, title: keyword.value });
    items.value = reset ? res.rows : [...items.value, ...res.rows];
    total.value = res.total;
    finished.value = items.value.length >= res.total;
  } finally {
    firstLoading.value = false;
    loadingMore.value = false;
  }
}

function onSearch() {
  pageNum.value = 1;
  loadData(true);
}

function onCancel() {
  keyword.value = '';
  pageNum.value = 1;
  loadData(true);
}

function goEdit(id: number | string) {
  uni.navigateTo({ url: `/pages/demo/form/index?id=${id}` });
}

// onShow 而非 onLoad：从编辑页返回时重新拉取，避免列表停留旧数据
onShow(() => loadData(true));

onPullDownRefresh(async () => {
  await loadData(true);
  uni.stopPullDownRefresh();
});

onReachBottom(() => {
  if (finished.value || loadingMore.value || firstLoading.value) return;
  pageNum.value += 1;
  loadData(false);
});
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 4px 4px;
}

.pagination-info {
  font-size: 12px;
  color: var(--wot-text-secondary, #999);
}

.pagination-btns {
  display: flex;
  gap: 8px;
}
</style>
