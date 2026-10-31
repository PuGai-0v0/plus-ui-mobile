import { BASE_URL, CLIENT_ID } from '@/config';
import { TOKEN_KEY } from '@/config';

/** uni.uploadFile 上传（request 封装不支持文件流，此处手工带鉴权头） */
export function uploadFile(filePath: string, fileName: string): Promise<any> {
  const token = uni.getStorageSync(TOKEN_KEY);
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: BASE_URL + '/app/oss/upload',
      filePath,
      name: 'file',
      fileName,
      header: {
        Authorization: token ? `Bearer ${token}` : '',
        clientid: CLIENT_ID,
      },
      success: (res) => {
        if (res.statusCode === 401) {
          uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
          setTimeout(() => uni.reLaunch({ url: '/pages/login/index' }), 800);
          return reject(new Error('登录状态已过期'));
        }
        try {
          const r = JSON.parse(res.data);
          if (r.code === 200) return resolve(r.data);
          uni.showToast({ title: r.msg || '上传失败', icon: 'none' });
          reject(new Error(r.msg || '上传失败'));
        } catch {
          reject(new Error('上传响应解析失败'));
        }
      },
      fail: () => {
        uni.showToast({ title: '网络异常，请检查后端服务', icon: 'none' });
        reject(new Error('网络异常'));
      },
    });
  });
}
