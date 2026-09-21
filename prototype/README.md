# 当前交互原型 · v2.2.0

[Sites 私有预览](https://mars-fieldnotes.hlb424559864.chatgpt.site) · [PRD](../docs/PRD.md) · [验证记录](VALIDATION.md)

默认入口是个人主页：文字、作品、小店、关于与社媒。文章与商品使用不同详情版式；商品可打开微信咨询弹窗。公共 Chat 提供模拟回答与章节引用；站长工作台演示订单、客户和草稿提案。所有文章、价格、订单、AI 均明确标注示例，不开放真实购买或收集 Key。

火星作为可选作品保留在 `dist/explore.html`；其旧配置与旧主站属于历史交互演示，固定链接可回新版首页。后续如保留正式实验，应删除旧配置与旧站路由。没有新建版本目录。

本地启动：在根目录运行 `python3 -m http.server 4788 --bind 127.0.0.1 --directory prototype/dist`。检查：`node --test prototype/*.test.mjs`。

主站文件：`dist/index.html`、`personal.js`、`personal.css`；来源返回复用 `navigation.mjs`。场景资源、许可证与相关测试保留。新封面由 CSS 和文字构成，未新增外部图片。

部署状态见下方更新记录；访问范围仍为 Sites 所有者私有。正式后台、飞书权限和模型尚未实现。

2026-09-20：Sites 版本 9 部署成功，所有者私有访问未改变。
- Version：`appgprj_6aaaa09a0d448191800980bb93825787~appgver_62289cb56150819193836051d4e6d8f5`
- Deployment：`appgdep_6aafdedf06e081919fbef65b275d5fcb`

2026-09-20：v2.1.0 已更新至 Sites 版本 10，精选阅读、专题目录、篇末作者与相关商品已加入；访问范围不变。
- Version：`appgprj_6aaaa09a0d448191800980bb93825787~appgver_27e199a33b508191a6af20d91e16550e`
- Deployment：`appgdep_6aafee56df308191ad8fae1ed91390aa`

书籍原型：`dist/books.mjs` 渲染、`dist/books.css` 排版；`books/independent-site/*.md` 是 GitHub 查看/编辑入口对应的公开示例源文件。改稿后运行 `node prototype/build-books.mjs`，再预览和发布。当前无自动 PR 或自动发布。

2026-09-21：书籍原型已发布至 Sites 版本 11，所有者私有访问未改变。
- Version：`appgprj_6aaaa09a0d448191800980bb93825787~appgver_2b3fc66c298881919c1cc3305b9797d5`
- Deployment：`appgdep_6ab096ff960c81919716911e8d1efcb3`
正式书籍建议独立仓库；本目录只是公开演示书稿，未创建真实出版物仓库或替用户决定许可。

v2.2.0：新增 gallery.mjs/gallery.css，首页与作品页共享横向画廊和全屏图片浏览。两张 SVG 为原创排版示例，其他复用既有概念素材；不代表个人真实照片。当前新版本发布状态见最终交付。

2026-09-21：v2.2.0 已发布至 Sites 版本 12，仍为所有者私有。
- Version：`appgprj_6aaaa09a0d448191800980bb93825787~appgver_e0c4d1c0fba08191947bee0aef0c0efc`
- Deployment：`appgdep_6ab0c30090248191a4ffc672fc9e6ce0`
