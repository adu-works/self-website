# 当前交互原型 · v2.6.0

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
- `dist/assembly.mjs` / `assembly.css`：单件作品详情滚动叙事；`project-scene.mjs` 按需创建真实三维界面模型；手机与减少动效静态呈现。
- `books/independent-site/`：公开示例书稿；`build-books.mjs` 生成供 `dist/books.mjs` 使用的数据。

原型只有这一份，旧部署与旧设计查 Git 历史。当前修改仍待用户审美和阶段评审。Sites 保持所有者私有，部署记录在本次交付结果中。

## 本轮交互修订

v2.6.0：个人空间详情用原创环形机械模型展示六段拆装镜头，提供实体与结构线稿切换、发光、旋转部件、暂停、跳过和窄窗口构图。模型是功能关系的概念表达，非实际硬件或真实 AI 成果。首页和列表不加载三维。

`project-scene.mjs` 管理几何、材质和后处理；`assembly.mjs` 管理镜头、滚动与生命周期。减少动效与小屏显示静态结构图。当前视觉待用户评审。

2026-09-21：Sites 版本 18 发布成功，保持所有者私有。
- Version：`appgprj_6aaaa09a0d448191800980bb93825787~appgver_2b88232de3d48191a780460f47a1bba0`
- Deployment：`appgdep_6ab0f32eb3f88191be9b7c9372fa8b7e`
