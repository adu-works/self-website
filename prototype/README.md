# 当前交互原型 · v2.0.0

[Sites 私有预览](https://mars-fieldnotes.hlb424559864.chatgpt.site) · [PRD](../docs/PRD.md) · [验证记录](VALIDATION.md)

默认入口是个人主页：文字、作品、小店、关于与社媒。文章与商品使用不同详情版式；商品可打开微信咨询弹窗。公共 Chat 提供模拟回答与章节引用；站长工作台演示订单、客户和草稿提案。所有文章、价格、订单、AI 均明确标注示例，不开放真实购买或收集 Key。

火星作为可选作品保留在 `dist/explore.html`；其旧配置与旧主站属于历史交互演示，固定链接可回新版首页。后续如保留正式实验，应删除旧配置与旧站路由。没有新建版本目录。

本地启动：在根目录运行 `python3 -m http.server 4788 --bind 127.0.0.1 --directory prototype/dist`。检查：`node --test prototype/*.test.mjs`。

主站文件：`dist/index.html`、`personal.js`、`personal.css`；来源返回复用 `navigation.mjs`。场景资源、许可证与相关测试保留。新封面由 CSS 和文字构成，未新增外部图片。

部署状态见下方更新记录；访问范围仍为 Sites 所有者私有。正式后台、飞书权限和模型尚未实现。

2026-09-20：Sites 版本 9 部署成功，所有者私有访问未改变。
- Version：`appgprj_6aaaa09a0d448191800980bb93825787~appgver_62289cb56150819193836051d4e6d8f5`
- Deployment：`appgdep_6aafdedf06e081919fbef65b275d5fcb`
