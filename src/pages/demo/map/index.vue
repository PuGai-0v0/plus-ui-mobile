<template>
  <view class="page-root" :class="themeStore.rootClass">
    <wd-navbar title="定位地图" fixed placeholder safe-area-inset-top />
    <view class="page-body">
      <view class="card">
        <wd-button type="primary" block :loading="locating" icon="location" @click="locate"
          >获取当前位置</wd-button
        >
      </view>
      <view v-if="location" class="card">
        <view class="card-title">位置信息</view>
        <view class="row"
          ><text>经度</text><text>{{ location.longitude }}</text></view
        >
        <view class="row"
          ><text>纬度</text><text>{{ location.latitude }}</text></view
        >
        <view v-if="address" class="row"
          ><text>地址</text><text>{{ address }}</text></view
        >
        <view v-if="poiError" class="hint">{{ poiError }}</view>
      </view>
      <!-- #ifdef MP-WEIXIN || MP-ALIPAY -->
      <view v-if="location" class="card map-card">
        <map
          :longitude="Number(location.longitude)"
          :latitude="Number(location.latitude)"
          :markers="markers"
          :scale="15"
          show-location
          enable-poi
          class="map"
          @tap="onMapTap"
        />
      </view>
      <!-- #endif -->
      <!-- #ifndef MP-WEIXIN || MP-ALIPAY -->
      <view v-if="location" class="card">
        <wd-empty
          icon="location"
          tip="H5/APP 端地图渲染需配置高德 JS-Key，当前仅展示坐标信息。小程序端使用原生地图组件。"
        />
      </view>
      <!-- #endif -->
      <view v-if="location" class="card">
        <view class="card-title">周边搜索</view>
        <view class="search-bar">
          <wd-input
            v-model="searchKeyword"
            placeholder="输入关键词（如：餐饮、酒店、停车场）"
            clearable
          />
          <!-- scoped 类挂 wd- 组件标签在小程序端不命中，flex-shrink 包到原生 view 上生效 -->
          <view class="search-btn">
            <wd-button type="primary" size="small" @click="searchPoi">搜索</wd-button>
          </view>
        </view>
      </view>
      <view v-if="pois.length" class="card">
        <view class="card-title">周边 POI（{{ pois.length }}条）</view>
        <wd-cell-group border>
          <view v-for="(poi, idx) in pois" :key="idx" class="poi-item">
            <view class="poi-info" @click="onPoiTap(poi)">
              <text class="poi-name">{{ poi.name }}</text>
              <text class="poi-distance">{{ poi.distance ? `${poi.distance}m` : '' }}</text>
            </view>
            <view class="poi-nav-btn" @click="openNavigation(poi)">
              <text>导航</text>
            </view>
          </view>
        </wd-cell-group>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
// type 导入放条件编译外：vue-tsc 不识别条件编译，分支内重复导入 type 会报 Duplicate identifier
import type { PoiItem } from '@/api/map';
// #ifdef MP-WEIXIN
import { qqRegeo, qqPoiAround } from '@/api/map';
// #endif
// #ifdef MP-ALIPAY
import { amapRegeo, amapPoiAround } from '@/api/map';
// #endif
// #if !defined(MP-WEIXIN) && !defined(MP-ALIPAY)
import { poiAround, regeo } from '@/api/map';
// #endif
import { usePageTheme } from '@/composables/usePageTheme';

const { themeStore } = usePageTheme();

const locating = ref(false);
const location = ref<{ longitude: string; latitude: string }>();
const address = ref('');
const poiError = ref('');
const pois = ref<PoiItem[]>([]);
const searchKeyword = ref('餐饮');

const markers = computed(() =>
  location.value
    ? [
        {
          id: 1,
          longitude: Number(location.value.longitude),
          latitude: Number(location.value.latitude),
          width: 28,
          height: 28,
        },
      ]
    : []
);

async function locate() {
  locating.value = true;
  try {
    // #ifdef MP-ALIPAY
    await ensureAlipayLocationPermission();
    // #endif
    const res = await new Promise<UniApp.GetLocationSuccess>((resolve, reject) => {
      uni.getLocation({ type: 'gcj02', success: resolve, fail: reject });
    });
    // 支付宝端 my.getLocation 返回的经纬度是字符串，微信端是数字，统一转数字后再格式化
    location.value = {
      longitude: Number(res.longitude).toFixed(6),
      latitude: Number(res.latitude).toFixed(6),
    };
    await doRegeoAndPoi();
  } catch (err) {
    console.error('[map] getLocation fail:', err);
    uni.showToast({ title: locateFailTitle(err), icon: 'none' });
  } finally {
    locating.value = false;
  }
}

// 支付宝拒绝授权后不再弹授权框，系统定位开关关闭时 my.getLocation 也会直接失败，需提前检查并引导
// #ifdef MP-ALIPAY
async function ensureAlipayLocationPermission() {
  if (uni.getSystemSetting().locationEnabled === false) {
    throw new Error('系统定位开关未开启（IDE 模拟器请勾选模拟定位）');
  }
  if (uni.getAppAuthorizeSetting().locationAuthorized !== 'denied') return;
  const confirmed = await new Promise<boolean>((resolve) => {
    uni.showModal({
      title: '需要定位权限',
      content: '定位权限已被拒绝，是否前往设置开启？',
      success: (r) => resolve(r.confirm),
      fail: () => resolve(false),
    });
  });
  if (!confirmed) throw new Error('定位权限被拒绝');
  await new Promise<void>((resolve) => {
    const my = (globalThis as any).my;
    if (!my?.openSetting) {
      resolve();
      return;
    }
    my.openSetting({ complete: () => resolve() });
  });
}
// #endif

function locateFailTitle(err: any): string {
  if (err instanceof Error) return `定位失败：${err.message}`;
  const code = err?.errCode ?? err?.error;
  const msg = (err?.errMsg || err?.errorMessage || '').replace(/^getLocation:fail\s*/i, '');
  if (code === undefined && !msg) return '定位失败：权限被拒绝或当前环境不支持';
  const detail = [msg, code === undefined ? '' : `错误码 ${code}`].filter(Boolean).join('，');
  return `定位失败：${detail}`;
}

async function doRegeoAndPoi() {
  if (!location.value) return;
  const locStr = `${location.value.longitude},${location.value.latitude}`;

  // #ifdef MP-WEIXIN
  try {
    const r = await qqRegeo(locStr);
    address.value = r.formattedAddress;
    poiError.value = '';
  } catch {
    address.value = '';
    poiError.value = '逆地理编码失败（请检查腾讯位置服务 Key 配置）';
  }
  try {
    pois.value = await qqPoiAround(searchKeyword.value || '餐饮', locStr, 1000);
  } catch {
    pois.value = [];
  }
  // #endif

  // #ifdef MP-ALIPAY
  try {
    const r = await amapRegeo(locStr);
    address.value = r.formattedAddress;
    poiError.value = '';
  } catch {
    address.value = '';
    poiError.value = '逆地理编码失败（请检查高德 WebService Key 配置）';
  }
  try {
    pois.value = await amapPoiAround(searchKeyword.value || '餐饮', locStr, 1000);
  } catch {
    pois.value = [];
  }
  // #endif

  // #if !defined(MP-WEIXIN) && !defined(MP-ALIPAY)
  try {
    const r = await regeo(locStr);
    address.value = r.formattedAddress;
    poiError.value = '';
  } catch {
    address.value = '';
    poiError.value = '逆地理编码不可用（后端代理未配置）';
  }
  try {
    pois.value = await poiAround(searchKeyword.value || '餐饮', locStr, 1000);
  } catch {
    pois.value = [];
  }
  // #endif
}

function searchPoi() {
  if (!location.value) {
    uni.showToast({ title: '请先获取当前位置', icon: 'none' });
    return;
  }
  doRegeoAndPoi();
}

function onPoiTap(poi: PoiItem) {
  if (!location.value) return;
  location.value = { longitude: poi.longitude, latitude: poi.latitude };
}

function onMapTap(e: any) {
  if (e.detail?.latitude && e.detail?.longitude) {
    location.value = {
      longitude: Number(e.detail.longitude).toFixed(6),
      latitude: Number(e.detail.latitude).toFixed(6),
    };
    doRegeoAndPoi();
  }
}

function openNavigation(poi: PoiItem) {
  // #ifdef MP-WEIXIN || MP-ALIPAY
  uni.openLocation({
    latitude: Number(poi.latitude),
    longitude: Number(poi.longitude),
    name: poi.name,
    address: poi.address || '',
    scale: 18,
    fail: () => {
      uni.showToast({ title: '打开导航失败', icon: 'none' });
    },
  });
  // #endif
  // #if !defined(MP-WEIXIN) && !defined(MP-ALIPAY)
  uni.showToast({ title: '导航功能仅在小程序中可用', icon: 'none' });
  // #endif
}
</script>

<style scoped>
.row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  color: var(--wot-text-main, #1d1f29);
}

.hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--wot-red-5, #fa4350);
}

.map-card {
  padding: 0;
  overflow: hidden;
}

.map {
  width: 100%;
  height: 300px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-bar .wd-input {
  flex: 1;
}

.search-btn {
  flex-shrink: 0;
}

.poi-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--wot-divider-main, #f0f0f0);
}

.poi-item:last-child {
  border-bottom: none;
}

.poi-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.poi-name {
  font-size: 14px;
  color: var(--wot-text-main, #1d1f29);
  flex: 1;
}

.poi-distance {
  font-size: 12px;
  color: var(--wot-text-secondary, #999);
  margin-left: 8px;
  flex-shrink: 0;
}

.poi-nav-btn {
  margin-left: 12px;
  padding: 4px 12px;
  background: var(--wot-primary-6, #4d80f0);
  border-radius: 14px;
  flex-shrink: 0;
}

.poi-nav-btn text {
  font-size: 12px;
  color: #fff;
}
</style>
