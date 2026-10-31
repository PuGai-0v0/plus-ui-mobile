import { request } from '@/utils/request';

/** 后端 CaptchaVo：{captchaEnabled, uuid, img} */
export interface CaptchaVo {
  captchaEnabled: boolean;
  uuid?: string;
  img?: string;
}

/** 获取图片验证码（GET，不加密；开关关闭时返回 captchaEnabled=false） */
export function getCode() {
  return request<CaptchaVo>({
    url: '/auth/code',
    method: 'GET',
    silent: true,
  });
}
