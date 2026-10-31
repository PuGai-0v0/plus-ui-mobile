import { request } from '@/utils/request';
import type { PageParams, PageResult } from '@/api/demo';

export interface DemoOrder {
  orderId: number;
  orderNo: string;
  subject: string;
  amount: number;
  channel: string;
  status: string;
  payTime?: string | number;
  createTime: string | number;
}

export interface DemoPayResult {
  orderNo: string;
  channel: string;
  amount: number;
  payParam: string;
}

/** 创建演示订单 */
export function createOrder(subject: string) {
  return request<DemoOrder>({
    url: '/app/demo/order/create',
    method: 'POST',
    data: { subject },
  });
}

/** 当前用户订单分页列表 */
export function listOrder(params: PageParams) {
  return request<PageResult<DemoOrder>>({
    url: '/app/demo/order/list',
    method: 'GET',
    data: params,
  });
}

/** 发起预支付（渠道未配置时后端返回明确错误，由 request 统一提示） */
export function prepay(orderNo: string, channel: string) {
  return request<DemoPayResult>({
    url: `/app/demo/pay/prepay?orderNo=${orderNo}&channel=${channel}`,
    method: 'POST',
  });
}
