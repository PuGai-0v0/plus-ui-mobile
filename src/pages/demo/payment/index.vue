<template>
  <view class="page-root" :class="themeStore.rootClass">
    <wd-navbar title="支付演示" fixed placeholder safe-area-inset-top />
    <view class="page-body">
      <view class="card">
        <view class="card-title">演示商品</view>
        <view class="goods">
          <view>
            <view class="goods-name">移动端演示商品</view>
            <view class="goods-desc">完整下单-支付链路演示（支付渠道为骨架配置）</view>
          </view>
          <view class="goods-price">¥0.01</view>
        </view>
        <wd-button type="primary" block :loading="creating" @click="onCreateOrder"
          >立即下单</wd-button
        >
      </view>
      <view v-if="order" class="card">
        <view class="card-title">订单信息</view>
        <view class="row"
          ><text>订单号</text><text>{{ order.orderNo }}</text></view
        >
        <view class="row"
          ><text>状态</text
          ><text>{{ order.status === 'pending' ? '待支付' : order.status }}</text></view
        >
        <view class="pay-btns">
          <wd-button
            size="small"
            type="success"
            :loading="paying === 'wechat'"
            @click="onPay('wechat')"
            >微信支付</wd-button
          >
          <wd-button
            size="small"
            type="primary"
            :loading="paying === 'alipay'"
            @click="onPay('alipay')"
            >支付宝</wd-button
          >
        </view>
      </view>
      <view class="card">
        <wd-button plain block @click="goOrder">查看订单列表</wd-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { createOrder, prepay, type DemoOrder } from '@/api/order';
import { usePageTheme } from '@/composables/usePageTheme';

const { themeStore } = usePageTheme();

const order = ref<DemoOrder>();
const creating = ref(false);
const paying = ref('');

async function onCreateOrder() {
  creating.value = true;
  try {
    order.value = await createOrder('移动端演示商品');
    uni.showToast({ title: '下单成功', icon: 'success' });
  } finally {
    creating.value = false;
  }
}

async function onPay(channel: string) {
  if (!order.value) return;
  paying.value = channel;
  try {
    const result = await prepay(order.value.orderNo, channel);
    uni.showModal({
      title: '支付参数已生成',
      content: `订单 ${result.orderNo} 金额 ¥${result.amount}，演示模式不调起真实收银台`,
      showCancel: false,
    });
  } catch {
    // request 封装已统一 toast 后端错误
  } finally {
    paying.value = '';
  }
}

function goOrder() {
  uni.navigateTo({ url: '/pages/demo/order/index' });
}
</script>

<style scoped>
.goods {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.goods-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--wot-text-main, #1d1f29);
}

.goods-desc {
  margin-top: 4px;
  font-size: 12px;
  color: var(--wot-text-secondary, #999);
}

.goods-price {
  font-size: 18px;
  font-weight: 600;
  color: var(--wot-red-5, #fa4350);
}

.row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  color: var(--wot-text-main, #1d1f29);
}

.pay-btns {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}
</style>
