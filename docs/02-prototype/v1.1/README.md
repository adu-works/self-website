# 远行手记 · 交互原型 v1.1

[打开私有 Sites 原型](https://mars-fieldnotes.hlb424559864.chatgpt.site)

本版针对 v1.0 的场景、动作、Chat 和主站视觉返工。完整体验设计在上级 experience-spec-v1.1.md；实际验证与限制见 VALIDATION.md。

- `dist/scene.js`：三维地形、模型、步行与物件动画。
- `dist/terrain.mjs`：共享地面高度与移动约束。
- `dist/app.js`：独立动作状态机、内容路由、模拟 Chat 与管理。
- `dist/redesign.css`：v1.1 的主站桌面、阅读、聊天与场景 UI。
- `terrain.test.mjs`：地形越坡、碰撞与范围检查。
- `ASSET-SOURCES.md`：资源来源；Three.js 及两个辅助模块使用 MIT 许可。

本目录是从 v1.0 Git 仓库创建的独立 worktree；v1.0 历史文件不覆盖。只发布本目录的静态内容，不上传上层项目资料。

本地运行：`python3 -m http.server 4788 --bind 127.0.0.1 --directory dist`。端口 4173 不使用。

原型没有真实 AI 请求、真实 Key 输入、真实鉴权或内容写入。刷新会清空会话内演示状态。

## v1.1.1 补丁

搬起后可 R 放下或 X 砸下，F 搬起，E 执行当前动作，G 辅助移动。保留按钮操作；按键提示随阶段显示。每次按下只执行一次，输入框/弹窗不触发场景快捷键。放下不清空锻造进度。

## v1.1.2 动作与归航

铲子使用手部骨骼插槽；搬炉可站立慢走并在前方放下；归航补齐火箭、入大气层、着陆、开舱、出舱、伸展与视线转场，最终进入完整 Chat。Chat 侧栏可以重看归航。

新增 `dist/character-rig.js`（握持/手臂）、`dist/flight.js`（演绎场景）、`dist/flight-sequence.mjs`（时间线）与 `rig-flight.test.mjs`（真实模型骨骼和阶段顺序检查）。

## v1.1.3 连续动作与页面关系

新增 `navigation.mjs` 统一来源返回与浏览器历史，保留视图快照；`motion.mjs` 定义分段挖土/伸展与出舱环绕镜头。全站返回关系与实测范围见上级 `navigation-audit-v1.1.3.md`。运行 `node --test *.test.mjs` 检查本版逻辑。

当前补丁 v1.1.4：伸展改为关节弧线旋转；肩后接主观视点采用切镜，取消穿头推进。落点保持完整 Chat。

当前补丁 v1.1.5：项目案例、三篇编辑式手记、关于信纸与联系页面重设计。独立 `detail-views.js` 负责展示，`editorial.css` 局部样式；既有路由与引用逻辑保留。

当前补丁 v1.1.6：首页姓名黄凌波 → 社媒主页。账号维护在 `dist/social-profile.js`；地址未确认时保留 null，不链接到平台首页冒充个人主页。
