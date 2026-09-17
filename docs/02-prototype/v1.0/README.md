# 远行手记 · 交互原型 v1.0

可操作的火星个人站设计原型。全部 AI 与管理员结果都是模拟；没有真实登录、写入或模型调用。Key 固定为不可编辑的假值，其他配置仅存在当前页面内存。

## 内容

- 火星角色移动、打造、挖宝、砸炉、船票与飞行。
- 主站、项目详情、文章与章节定位、内容查找、关于及联系待补状态。
- 模拟厂商配置、成功与失败、Chat 引用、停止、回收返回。
- 站长更新/草稿提案、前后差异、取消、结果、历史与恢复。

## 文件

- `dist/index.html`：入口与基本场景界面。
- `dist/app.js`：页面、路由、示例数据与模拟交互。
- `dist/scene.js`：Three.js 场景、角色与动作。
- `dist/style.css`：统一主题与响应式布局。
- `.openai/hosting.json`：此原型的 Sites 身份，不含凭据。

从该目录运行 `python3 -m http.server 4788 --bind 127.0.0.1 --directory dist` 后访问本机 4788。4173 留给用户其他服务；不要为了启动此原型终止任何未知进程。Sites 私有链接以部署记录为准。

## 素材与依赖

- `mars-panorama.png`、`earth-orbit.png`：本次通过 image_gen 生成并检查的原始气氛图，各一次生成。不是实际地点摄影，也不是站长真实作品成果。
- `three.module.js`：Three.js 0.160.1，取自该版本 npm 包的 jsDelivr 分发；MIT 许可证见 `THREE-LICENSE.txt`。
- 字体：Google Fonts 的 Space Grotesk / Noto Sans SC，加载失败使用系统字体。字体是外部请求，AI/凭据不是。
- 没有使用参考站的作者照片、项目截图、角色或源码。

[完整体验方案](../experience-spec-v1.0.md) · [验证记录](VALIDATION.md)
