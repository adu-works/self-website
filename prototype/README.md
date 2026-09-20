# 当前交互原型 · v1.1.6

[Sites 私有预览](https://mars-fieldnotes.hlb424559864.chatgpt.site) · [场景与工程设计](../docs/modules/06-runtime.md) · [验证记录](VALIDATION.md)

本目录是当前唯一设计基线。火星探索、手部握持、搬炉/放下、完整归航、全屏 Chat、编辑式详情和姓名社媒入口均保留；AI、配置、管理写入仍模拟。

从项目根目录运行 `python3 -m http.server 4788 --bind 127.0.0.1 --directory prototype/dist`；在本目录运行 `node --test *.test.mjs`。端口占用时先确认原服务，不结束不属于本项目的进程。

主要文件：dist/app.js（原型控制器）、detail-views.js（内容排版）、social-profile.js（待补社媒）、scene.js（场景）、terrain.mjs（地形）、character-rig.js（握持）、flight.js（归航）、navigation.mjs（来源返回）。素材来源见 ASSET-SOURCES.md，第三方许可不可删除。

2026-09-17：从 docs/02-prototype/v1.1 移到本目录，运行资源逐文件哈希保持一致。已移除嵌套 Git 工作区，根目录 Git 统一跟踪；不再依赖已删除的旧版目录。清理不修改已发布 Sites，也不重复发布相同构建。

当前部署记录：Sites 版本 8，2026-09-17 成功部署，沿用所有者私有访问。本次文档整理未重新部署。

- Site：`appgprj_6aaaa09a0d448191800980bb93825787`
- Version：`appgprj_6aaaa09a0d448191800980bb93825787~appgver_79b52e934130819181fef001323c645b`
- Deployment：`appgdep_6aab58b5339c81918571f64d615cfe39`

当前文章管理、公众号解锁与真实 Agent 方案见 [PRD](../docs/PRD.md)，不是现有静态原型已经具备的能力。
