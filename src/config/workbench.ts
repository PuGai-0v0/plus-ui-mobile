export interface WorkbenchEntry {
  key: string;
  label: string;
  icon: string;
  path: string;
}

export interface WorkbenchCategory {
  key: string;
  title: string;
  entries: WorkbenchEntry[];
}

export const workbenchCategories: WorkbenchCategory[] = [
  {
    key: 'office',
    title: '办公数据',
    entries: [
      { key: 'list', label: '数据列表', icon: 'list', path: '/pages/demo/list/index' },
      { key: 'form', label: '表单提交', icon: 'edit', path: '/pages/demo/form/index' },
      { key: 'upload', label: '文件上传', icon: 'folder', path: '/pages/demo/upload/index' },
    ],
  },
  {
    key: 'pay',
    title: '支付交易',
    entries: [
      { key: 'payment', label: '支付演示', icon: 'notification', path: '/pages/demo/payment/index' },
      { key: 'order', label: '订单列表', icon: 'file', path: '/pages/demo/order/index' },
    ],
  },
  {
    key: 'media',
    title: '媒体设备',
    entries: [
      { key: 'camera', label: '相机相册', icon: 'camera', path: '/pages/demo/camera/index' },
      { key: 'scan', label: '扫一扫', icon: 'scan', path: '/pages/demo/scan/index' },
      { key: 'map', label: '定位地图', icon: 'location', path: '/pages/demo/map/index' },
    ],
  },
  {
    key: 'interaction',
    title: '常用交互',
    entries: [
      { key: 'dialog', label: '消息弹窗', icon: 'message', path: '/pages/demo/dialog/index' },
      { key: 'picker', label: '选择器', icon: 'filter', path: '/pages/demo/picker/index' },
      { key: 'components', label: '常用组件', icon: 'apps', path: '/pages/demo/components/index' },
    ],
  },
];
