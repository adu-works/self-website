# 当前交互原型 · v2.7.0

[Sites 私有预览](https://mars-fieldnotes.hlb424559864.chatgpt.site/#/home) · [PRD](../docs/PRD.md) · [验证记录](VALIDATION.md)

六个栏目：首页、文字、书籍、作品、小店、关于。首页顺序为个人主张与最新动态、最近文字、作品、书籍、小店、生活视频。自述入口固定；视频和书稿占位明确标注，未收到的真实经历不编造。

文章、商品、书籍有各自详情版式。公共 Chat、管理工作台、订单与 Agent 为演示，没有真实登录、模型、购买或飞书写入，也不收集访客 Key。火星不再出现在主站，历史文件 `dist/explore.html` 保留。

## 本地运行与检查

在根目录执行：

```sh
python3 -m http.server 4788 --bind 127.0.0.1 --directory prototype/dist
node --test prototype/*.test.mjs
```

打开 http://127.0.0.1:4788/ 。修改示例书稿后运行 `node prototype/build-books.mjs`。

## 文件在哪里

- `dist/personal.js` / `personal.css`：页面与主视觉；`navigation.mjs`：来源返回。
- `dist/home-content.mjs` / `home-content.css`：公开最新动态示例、作品卡和滑动书架。
- `dist/gallery.mjs` / `gallery.css`：首页视频画廊，负责滚动、全屏和播放清理。
- `dist/media/`：原创程序动态样片与封面，非个人实拍，来源见 [素材说明](ASSET-SOURCES.md)。
- `dist/assembly.mjs` / `assembly.css`：单件作品详情滚动叙事；`case-content.mjs` 定义十二段内容，`project-scene.mjs` 按需编排实际原型页面；手机与减少动效静态呈现。
- `books/independent-site/`：公开示例书稿；`build-books.mjs` 生成供 `dist/books.mjs` 使用的数据。

原型只有这一份，旧部署与旧设计查 Git 历史。当前修改仍待用户审美和阶段评审。Sites 保持所有者私有，部署记录在本次交付结果中。

## 本轮交互修订

v2.7.0：用十二段实际原型页面展示这个个人网站的功能与特色。正文/目录分层、书封展开、协作按钮突出、会话引用与提案差异分别呈现。可滚动、选择章节、上一段/下一段、跳过或直接打开对应功能。

最多挂载两个相邻章节；展示框不参与交互，模拟问答和提案不会保存或发布。小屏、短窗口、减少动效保留完整文字与入口。正式产品采用共享组件与公开演示数据，不嵌入真实后台。

2026-09-21：Sites 版本 19 发布成功，保持所有者私有。
- Version：`appgprj_6aaaa09a0d448191800980bb93825787~appgver_7a5cc3205dcc81919abe6c85418f38e8`
- Deployment：`appgdep_6ab0fbc75fb48191962e19b1edac51cf`
