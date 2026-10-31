import { request } from '@/utils/request';

export interface PoiItem {
  name: string;
  address: string;
  longitude: string;
  latitude: string;
  distance: string;
}

export interface RegeoResult {
  formattedAddress: string;
  province: string;
  city: string;
  district: string;
}

/** 周边 POI 搜索（location 格式：经度,纬度）— 后端代理（H5/APP fallback） */
export function poiAround(keywords: string, location: string, radius = 1000) {
  return request<PoiItem[]>({
    url: '/app/demo/map/poi/around',
    method: 'GET',
    data: { keywords, location, radius },
  });
}

/** 逆地理编码 — 后端代理（H5/APP fallback） */
export function regeo(location: string) {
  return request<RegeoResult>({
    url: '/app/demo/map/regeo',
    method: 'GET',
    data: { location },
  });
}

// #ifdef MP-WEIXIN
// 腾讯位置服务 key：.env 统一管理（VITE_QQ_MAP_KEY），条件编译保证只打进微信包
const QQ_MAP_KEY = import.meta.env.VITE_QQ_MAP_KEY || '';

/** 腾讯位置服务 - 逆地理编码（微信小程序专用） */
export function qqRegeo(location: string): Promise<RegeoResult> {
  const [lng, lat] = location.split(',');
  return new Promise((resolve, reject) => {
    uni.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/',
      data: { location: `${lat},${lng}`, key: QQ_MAP_KEY },
      success: (res: any) => {
        if (res.data?.status === 0) {
          const r = res.data.result;
          resolve({
            formattedAddress: r.formatted_addresses?.recommend || r.address || '',
            province: r.address_component?.province || '',
            city: r.address_component?.city || '',
            district: r.address_component?.district || '',
          });
        } else {
          reject(new Error(res.data?.message || '腾讯逆地理编码失败'));
        }
      },
      fail: reject,
    });
  });
}

/** 腾讯位置服务 - 周边 POI 搜索（微信小程序专用） */
export function qqPoiAround(keyword: string, location: string, radius = 1000): Promise<PoiItem[]> {
  const [lng, lat] = location.split(',');
  return new Promise((resolve, reject) => {
    uni.request({
      url: 'https://apis.map.qq.com/ws/place/v1/search',
      data: {
        keyword,
        boundary: `nearby(${lat},${lng},${radius})`,
        page_size: 20,
        key: QQ_MAP_KEY,
      },
      success: (res: any) => {
        if (res.data?.status === 0) {
          resolve(
            (res.data.data || []).map((item: any) => ({
              name: item.title,
              address: item.address,
              longitude: String(item.location.lng),
              latitude: String(item.location.lat),
              distance: String(Math.round(item._distance || 0)),
            }))
          );
        } else {
          reject(new Error(res.data?.message || '腾讯POI搜索失败'));
        }
      },
      fail: reject,
    });
  });
}
// #endif

// #ifdef MP-ALIPAY
// 高德 WebService key：.env 统一管理（VITE_AMAP_MP_KEY），条件编译保证只打进支付宝包
const AMAP_KEY = import.meta.env.VITE_AMAP_MP_KEY || '';

/** 高德地图 - 逆地理编码（支付宝小程序专用） */
export function amapRegeo(location: string): Promise<RegeoResult> {
  const [lng, lat] = location.split(',');
  return new Promise((resolve, reject) => {
    uni.request({
      url: 'https://restapi.amap.com/v3/geocode/regeo',
      data: { location: `${lng},${lat}`, key: AMAP_KEY },
      success: (res: any) => {
        if (res.data?.status === '1') {
          const r = res.data.regeocode;
          resolve({
            formattedAddress: r.formatted_address || '',
            province: r.addressComponent?.province || '',
            city: r.addressComponent?.city || '',
            district: r.addressComponent?.district || '',
          });
        } else {
          reject(new Error(res.data?.info || '高德逆地理编码失败'));
        }
      },
      fail: reject,
    });
  });
}

/** 高德地图 - 周边 POI 搜索（支付宝小程序专用） */
export function amapPoiAround(
  keyword: string,
  location: string,
  radius = 1000
): Promise<PoiItem[]> {
  const [lng, lat] = location.split(',');
  return new Promise((resolve, reject) => {
    uni.request({
      url: 'https://restapi.amap.com/v3/place/around',
      data: {
        keywords: keyword,
        location: `${lng},${lat}`,
        radius,
        offset: 20,
        page: 1,
        key: AMAP_KEY,
      },
      success: (res: any) => {
        if (res.data?.status === '1') {
          resolve(
            (res.data.pois || []).map((item: any) => ({
              name: item.name,
              address: item.address || '',
              longitude: String(item.location?.split(',')[0] || ''),
              latitude: String(item.location?.split(',')[1] || ''),
              distance: String(Math.round(Number(item.distance) || 0)),
            }))
          );
        } else {
          reject(new Error(res.data?.info || '高德POI搜索失败'));
        }
      },
      fail: reject,
    });
  });
}
// #endif
