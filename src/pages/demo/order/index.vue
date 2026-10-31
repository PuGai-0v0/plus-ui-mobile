<template>
  <view class="page-root" :class="themeStore.rootClass">
    <wd-navbar title="订单列表" fixed placeholder safe-area-inset-top />
    <view class="page-body">
      <view class="card">
        <list-skeleton v-if="firstLoading" :loading="true" :rows="5" />
        <wd-empty v-else-if="!orders.length" tip="暂无订单" />
        <template v-else>
          <view v-for="o in orders" :key="o.orderId" class="order-item">
            <view class="order-line">
              <text class="order-no">{{ o.orderNo }}</text>
              <wd-tag :type="o.status === 'pending' ? 'warning' : 'success'" size="small">
                {{ o.status === 'pending' ? '待支付' : o.status === 'paid' ? '已支付' : '已取消' }}
              </wd-tag>
            </view>
            <view class="order-line sub">
              <text>{{ o.subject }}</text>
              <text class="amount">¥{{ Number(o.amount).toFixed(2) }}</text>
            </view>
            <view class="order-line sub">
              <text>{{
                o.channel ? (o.channel === 'wechat' ? '微信支付' : '支付宝') : '未选渠道'
              }}</text>
              <text>{{ formatDateTime(o.createTime) }}</text>
            </view>
          </view>
          <view class="list-footer">
            {{ finished ? '已加载全部' : loadingMore ? '加载中…' : '上拉加载更多' }}
          </view>
        </template>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { listOrder, type DemoOrder } from '@/api/order';
import { formatDateTime } from '@/utils/date';
import { usePageTheme } from '@/composables/usePageTheme';

const { themeStore } = usePageTheme();

const orders = ref<DemoOrder[]>([]);
const pageNum = ref(1);
const pageSize = 10;
const total = ref(0);
const firstLoading = ref(true);
const loadingMore = ref(false);
const finished = ref(false);

async function loadData(reset = false) {
  if (reset) {
    pageNum.value = 1;
    finished.value = false;
    firstLoading.value = true;
  } else {
    loadingMore.value = true;
  }
  try {
    const res = await listOrder({ pageNum: pageNum.value, pageSize });
    orders.value = reset ? res.rows : [...orders.value, ...res.rows];
    total.value = res.total;
    finished.value = orders.value.length >= res.total;
  } finally {
    firstLoading.value = false;
    loadingMore.value = false;
  }
}

onLoad(() => loadData(true));

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
.order-item {
  padding: 10px 0;
  border-bottom: 1px solid var(--wot-divider-main, #f0f0f0);
}

.order-item:last-child {
  border-bottom: none;
}

.order-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: var(--wot-text-main, #1d1f29);
}

.order-line.sub {
  margin-top: 6px;
  font-size: 12px;
  color: var(--wot-text-secondary, #999);
}

.amount {
  font-weight: 600;
  color: var(--wot-red-5, #fa4350);
}

.list-footer {
  padding: 12px 0 4px;
  text-align: center;
  font-size: 12px;
  color: var(--wot-text-secondary, #999);
}
</style>
