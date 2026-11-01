import { request } from '@/utils/request';

export interface DemoItem {
  /** 雪花 ID 超 JS 安全整数时后端序列化为字符串，全程禁止 Number() 转换 */
  id?: number | string;
  title: string;
  category: string;
  status: string;
  amount: number | string | null;
  /** 计划日期 YYYY-MM-DD */
  planDate?: string | null;
  /** 是否加急（0否 1是） */
  urgent?: string;
  /** 标签（逗号分隔） */
  tags?: string;
  remark?: string;
  createTime?: string | number;
}

export interface PageResult<T> {
  rows: T[];
  total: number;
}

export interface PageParams {
  pageNum: number;
  pageSize: number;
  [key: string]: any;
}

/** 分页查询演示条目 */
export function listItem(params: PageParams) {
  return request<PageResult<DemoItem>>({
    url: '/app/demo/item/list',
    method: 'GET',
    data: params,
  });
}

/** 条目详情 */
export function getItem(id: number | string) {
  return request<DemoItem>({
    url: `/app/demo/item/${id}`,
    method: 'GET',
  });
}

/** 新增条目 */
export function addItem(data: Partial<DemoItem>) {
  return request<void>({
    url: '/app/demo/item',
    method: 'POST',
    data,
  });
}

/** 修改条目 */
export function updateItem(data: Partial<DemoItem>) {
  return request<void>({
    url: '/app/demo/item',
    method: 'PUT',
    data,
  });
}

/** 删除条目 */
export function removeItem(ids: number | string) {
  return request<void>({
    url: `/app/demo/item/${ids}`,
    method: 'DELETE',
  });
}
