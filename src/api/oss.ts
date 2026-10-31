import { request } from '@/utils/request';
import type { PageParams, PageResult } from '@/api/demo';

export interface OssFile {
  ossId: number;
  fileName: string;
  originalName: string;
  fileSuffix: string;
  url: string;
  createTime: string | number;
}

/** 文件列表 */
export function listOss(params: PageParams) {
  return request<PageResult<OssFile>>({
    url: '/app/oss/list',
    method: 'GET',
    data: params,
  });
}

/** 删除文件 */
export function removeOss(ossIds: number) {
  return request<void>({
    url: `/app/oss/${ossIds}`,
    method: 'DELETE',
  });
}
