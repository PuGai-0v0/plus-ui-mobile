#!/usr/bin/env node
/**
 * 清理项目可再生产物（依赖 / 构建缓存 / 日志），保留全部源码与配置。
 * 用法：npm run clear
 * 说明：执行后项目体积大幅缩小，便于整体复制；在新机器上 npm install 即可恢复开发环境。
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

// 可再生产物清单：npm install / 构建命令可重新生成，删除不影响源码
const targets = [
  'node_modules', // 依赖目录，体积最大，npm install 重新生成
  'dist', // H5 等构建产物，build 命令重新生成
  'unpackage', // uni-app 编译产物（HBuilderX / CLI 生成，当前未生成也无妨）
  'logs', // 运行日志目录
];

let removed = 0;

for (const item of targets) {
  const target = path.join(root, item);
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`[clean] 已删除 ${item}`);
    removed++;
  }
}

// 根目录散落的日志文件（*.log）与工具探针临时文件（.write_probe 前缀）
for (const file of fs.readdirSync(root)) {
  if (file.endsWith('.log') || file.startsWith('.write_probe')) {
    fs.rmSync(path.join(root, file), { force: true });
    console.log(`[clean] 已删除 ${file}`);
    removed++;
  }
}

if (removed > 0) {
  console.log(`[clean] 清理完成，共删除 ${removed} 项，项目可直接复制，npm install 恢复依赖`);
} else {
  console.log('[clean] 无可清理项，项目已处于干净状态');
}