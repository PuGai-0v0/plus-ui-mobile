# plus-ui-mobile

RuoYi-Vue-Plus 的移动端配套前端，基于 **uni-app（Vue 3 + TypeScript + Vite）** 与 **wot-ui v2** 组件库构建。当前完美适配 **H5、微信小程序、支付宝小程序** 三端，后续规划扩展 Android / iOS / 抖音 / 小红书 / 鸿蒙。

## 特性

- 三端一套代码，条件编译处理平台差异，深浅色双主题跟随系统 / 手动切换
- 登录与请求链路加密（RSA + AES），密钥统一由 `.env` 环境变量管理
- Pinia 状态管理，主题 / 用户 store 统一收口
- 内置演示页：数据列表、表单提交、文件上传、支付演示、订单列表、相机相册、扫一扫、定位地图、消息弹窗、选择器、常用组件
- 依赖版本全量精确固定，`patch-package` 补丁体系修复组件库平台差异，`npm ci` 一键复现环境

## 配套后端

| 平台 | 地址 |
| --- | --- |
| Gitee | https://gitee.com/Pugai_0v0/RuoYi-Vue-Plus |
| GitHub | https://github.com/PuGai-0v0/RuoYi-Vue-Plus |

后端为 RuoYi-Vue-Plus 6.x，演示功能所需表结构见后端仓库 `script/sql/ry_mobile.sql`。启动后端并导入该脚本后，本项目的演示页即可联调。

## 快速开始

环境要求：Node.js 18+（建议 LTS 版本）、npm 9+。

```bash
# 1. 安装依赖（严格按 package-lock.json 复现版本，postinstall 自动应用 patches/ 补丁）
npm ci

# 2. 按需修改环境变量（后端地址、客户端 ID、RSA 密钥、地图 Key 等）
#    .env.development / .env.production

# 3. 启动开发服务（三选一）
npm run dev:h5          # H5，浏览器访问终端输出的地址
npm run dev:mp-weixin   # 微信小程序，产物导入微信开发者工具
npm run dev:mp-alipay   # 支付宝小程序，产物导入支付宝小程序开发者工具
```

生产构建对应 `npm run build:h5` / `build:mp-weixin` / `build:mp-alipay`，其余平台脚本见 `package.json`。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm ci` | 干净安装依赖：只认 lock 文件、不改写 lock，与 package.json 不同步时直接报错；安装后自动重放 `patches/` 补丁 |
| `npm run clear` | 清理可再生产物（node_modules / dist / unpackage / logs），**保留 lock 与全部源码**，清理后 `npm ci` 可完整恢复 |
| `npm run format:check` | Prettier 格式检查，只报告不修改，适合提交前自检 |
| `npm run format` | Prettier 格式化全仓库代码 |
| `npm run type-check` | vue-tsc 全量类型检查，不产出文件 |

> 注意：`patches/` 目录与 `package-lock.json` 是环境复现的命门，请勿删除或忽略提交；升级 `@wot-ui/ui` 版本后需重新验证补丁是否仍适用。

## 支持项目

如果这个项目对你有帮助，欢迎请作者喝杯咖啡

|                支付宝                | 微信 |
|:---------------------------------:| :---: |
| ![支付宝收款码](docs/donate/alipay.jpg) | ![微信收款码](docs/donate/wechat.png) |

<!-- 将收款二维码图片放入 docs/donate/ 目录，分别命名为 alipay.png、wechat.png 即可显示 -->

## 许可证

本项目基于 [MIT 许可证](LICENSE) 开源，与配套后端 RuoYi-Vue-Plus 保持一致。

- **你可以**：免费使用、复制、修改、合并、出版、分发、再授权及销售本软件，包括用于商业项目和闭源产品，无需额外授权或付费；
- **唯一条件**：在软件的副本或主要部分中保留原始的版权声明与许可声明（即 `LICENSE` 文件内容）；
- **免责说明**：软件按"现状"提供，作者不承担任何明示或暗示的担保责任，使用风险由使用者自行承担。

简而言之：拿去用、随便改、可商用，保留 LICENSE 即可。
