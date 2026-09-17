# 可执行任务清单

> v1.0 · 全部未开始。估计每项 S/M（1–4 个主要文件）；若超出一个可验证工作单元，先继续拆分。

## T01 · 供应商流式可行性

- [ ] 完成
- 需求：R04/R13；依赖：G3 批准。
- 范围：src/server/providers/contract.ts；tests/integration/providers.test.ts。
- 验收：三厂商分别验证认证、模型、SSE、停止和规范错误；记录真实测试与模拟边界。
- 验证：协议 fixtures + 小额度真实请求；不记录 Key。
- 完成后记录：实际命令、结果、限制和学习日志；G3 未批准不得执行。

## T02 · 部署与任务运行可行性

- [ ] 完成
- 需求：R06；依赖：T01。
- 范围：docs/03-engineering/provider-spike.md；ops/preview-notes.md。
- 验收：确认 Node/SSE 时限、后台 worker、数据库地区及预算，不先购买未知套餐。
- 验证：预览最小请求与任务租约演练。
- 完成后记录：实际命令、结果、限制和学习日志；G3 未批准不得执行。

## T03 · BYOK 隐私和威胁模型

- [ ] 完成
- 需求：R13；依赖：T01。
- 范围：src/server/providers/endpoint-policy.ts；tests/unit/endpoint-policy.test.ts。
- 验收：固定白名单、拒绝私网/重定向绕过；确定日志脱敏与 Key 生命周期。
- 验证：单元测试覆盖恶意 URL 和 canary 假 Key。
- 完成后记录：实际命令、结果、限制和学习日志；G3 未批准不得执行。

## T04 · 工程与持续集成基础

- [ ] 完成
- 需求：R12；依赖：T02/T03。
- 范围：package.json；tsconfig.json；CI workflow；src/app/layout.tsx。
- 验收：建立 typecheck/unit/build/E2E 脚本和环境校验，首个空站可运行。
- 验证：CI 无秘密运行成功，缺配置可解释失败。
- 完成后记录：实际命令、结果、限制和学习日志；G3 未批准不得执行。

## T05 · 第一篇真实内容读取

- [ ] 完成
- 需求：R02/R03；依赖：T04。
- 范围：supabase/migrations/001_content.sql；src/server/content/read.ts；tests/integration/content.test.ts。
- 验收：块结构、不可变版本和 release 指针建模，匿名只能读公开版本。
- 验证：迁移测试、匿名/私有内容拒绝测试。
- 完成后记录：实际命令、结果、限制和学习日志；G3 未批准不得执行。

## T06 · 项目与文章编辑版式

- [ ] 完成
- 需求：R02/R03/R12；依赖：T05。
- 范围：src/features/content/Project.tsx；Article.tsx；content.css；tests/e2e/reading.spec.ts。
- 验收：移植两类设计，长内容/图片/代码可读，block ID 不随文字变化。
- 验证：390/768/1440px 视觉与长内容检查。
- 完成后记录：实际命令、结果、限制和学习日志；G3 未批准不得执行。

## T07 · 来源返回与引用路由

- [ ] 完成
- 需求：R05/R12；依赖：T06。
- 范围：src/features/content/navigation.ts；CitationTarget.tsx；tests/e2e/navigation.spec.ts。
- 验收：详情保留真实来源/滚动，直达安全回退，旧公开 revision 可定位。
- 验证：首页→详情→返回、Chat 引用、浏览器前进后退。
- 完成后记录：实际命令、结果、限制和学习日志；G3 未批准不得执行。

## T08 · 身份与主站桌面

- [ ] 完成
- 需求：R01/R12；依赖：T06。
- 范围：src/app/page.tsx；about/page.tsx；social/page.tsx；profile.ts。
- 验收：首页、关于、联系与七平台入口复用设计，真实/待补字段可分辨。
- 验证：键盘和手机路径；空 URL 不生成假链接。
- 完成后记录：实际命令、结果、限制和学习日志；G3 未批准不得执行。

## T09 · 公开检索快照

- [ ] 完成
- 需求：R04/R11；依赖：T05/T07。
- 范围：src/server/retrieval/index.ts；rank.ts；tests/eval/retrieval.test.ts。
- 验收：中文分词与排名可重复，限定 scope/release，私有与撤回内容被排除。
- 验证：标注语料 Recall@5 与权限测试。
- 完成后记录：实际命令、结果、限制和学习日志；G3 未批准不得执行。

## T10 · 模型配置与验证

- [ ] 完成
- 需求：R13；依赖：T03/T08。
- 范围：src/features/chat/ModelConfig.tsx；config.ts；src/app/api/model/validate/route.ts。
- 验收：明示 Key 数据流，内存保存，可清除；服务端 no-store 和限流。
- 验证：假 Key 日志检查、取消/失效/余额不足集成。
- 完成后记录：实际命令、结果、限制和学习日志；G3 未批准不得执行。

## T11 · 带引用的真实问答

- [ ] 完成
- 需求：R04/R05；依赖：T01/T09/T10。
- 范围：src/app/api/chat/route.ts；src/server/chat.ts；src/features/chat/Conversation.tsx。
- 验收：检索→受限上下文→SSE，引用必须属于 source 集合；空资料拒答。
- 验证：有依据/无资料/伪造 source ID/恶意文本测试。
- 完成后记录：实际命令、结果、限制和学习日志；G3 未批准不得执行。

## T12 · 对话恢复与取消

- [ ] 完成
- 需求：R04/R05；依赖：T11/T07。
- 范围：src/features/chat/session.ts；Composer.tsx；tests/e2e/chat.spec.ts。
- 验收：离开再返回保留本页会话，停止取消上下游，跨范围需选择。
- 验证：超时/中断/返回/清 Key；刷新无秘密残留。
- 完成后记录：实际命令、结果、限制和学习日志；G3 未批准不得执行。

## T13 · 站长身份与访问隔离

- [ ] 完成
- 需求：R06；依赖：T05。
- 范围：src/server/auth.ts；src/app/admin/layout.tsx；migrations/002_rls.sql。
- 验收：固定站长 ID，逐端点鉴权，访客和普通 OAuth 登录不能写。
- 验证：401/403/RLS 实测与 CSRF/Origin 检查。
- 完成后记录：实际命令、结果、限制和学习日志；G3 未批准不得执行。

## T14 · 可预览的修改提案

- [ ] 完成
- 需求：R06；依赖：T13。
- 范围：src/server/admin/propose.ts；schemas.ts；src/features/admin/Diff.tsx。
- 验收：只读材料生成 patch，展示依据/完整差异/hash/版本/有效期。
- 验证：越界要求拒绝、格式错误与不支持块校验。
- 完成后记录：实际命令、结果、限制和学习日志；G3 未批准不得执行。

## T15 · 一次性确认执行

- [ ] 完成
- 需求：R06；依赖：T14。
- 范围：src/server/admin/confirm.ts；migrations/003_operations.sql；tests/integration/confirm.test.ts。
- 验收：事务验证 baseVersion/hash，幂等确认、取消过期拒绝。
- 验证：并发重复请求只产生一次 revision；冲突409。
- 完成后记录：实际命令、结果、限制和学习日志；G3 未批准不得执行。

## T16 · 原子发布任务

- [ ] 完成
- 需求：R06；依赖：T15/T09。
- 范围：src/server/jobs/publish.ts；outbox.ts；migrations/004_release.sql。
- 验收：索引准备后切换 active release，任务租约与去重，旧版保底。
- 验证：每个步骤注入失败，页面/索引不得混版。
- 完成后记录：实际命令、结果、限制和学习日志；G3 未批准不得执行。

## T17 · 执行结果与未知状态核实

- [ ] 完成
- 需求：R06；依赖：T16。
- 范围：src/app/api/admin/operations/[id]/route.ts；src/features/admin/Operation.tsx。
- 验收：保存/发布/索引/缓存分别报告，断网恢复查询同一 operation。
- 验证：模拟断连与多次轮询，无重复执行。
- 完成后记录：实际命令、结果、限制和学习日志；G3 未批准不得执行。

## T18 · 恢复内容与受控素材

- [ ] 完成
- 需求：R06；依赖：T17。
- 范围：src/server/admin/restore.ts；assets.ts；src/features/admin/Restore.tsx；tests/integration/restore.test.ts。
- 验收：恢复先提案再确认；素材校验大小类型许可；缺素材可解释。
- 验证：旧版本恢复、恶意文件拒绝、取消不写入。
- 完成后记录：实际命令、结果、限制和学习日志；G3 未批准不得执行。

## T19 · 火星移动与握持

- [ ] 完成
- 需求：R12；依赖：T08。
- 范围：src/features/scene/world.ts；terrain.ts；rig.ts；scene.test.ts。
- 验收：移植地形、碰撞、手握铲与搬炉放下，动作可逆。
- 验证：原型纯逻辑回归 + 实际移动和负重观察。
- 完成后记录：实际命令、结果、限制和学习日志；G3 未批准不得执行。

## T20 · 探索至真实 Chat

- [ ] 完成
- 需求：R12/R13；依赖：T19/T12。
- 范围：src/features/scene/journey.ts；flight.ts；controls.ts；tests/e2e/journey.spec.ts。
- 验收：锻打/铲土/开门、配置船票、完整归航接真实 Chat，保留快捷键。
- 验证：完整路线与跳过/砸炉/配置失败/回收飞船。
- 完成后记录：实际命令、结果、限制和学习日志；G3 未批准不得执行。

## T21 · 场景性能和无障碍

- [ ] 完成
- 需求：R12；依赖：T20。
- 范围：src/features/scene/loader.ts；quality.ts；tests/e2e/fallback.spec.ts。
- 验收：离场卸载、延迟资源、失败降级、减少动效与触控。
- 验证：目标设备测帧率/资源，键盘/缩放/弱网检查。
- 完成后记录：实际命令、结果、限制和学习日志；G3 未批准不得执行。

## T22 · 全站评估与安全回归

- [ ] 完成
- 需求：全部；依赖：T12/T18/T21。
- 范围：tests/eval/cases.json；tests/e2e/acceptance.spec.ts；docs/04-delivery/evaluation.md。
- 验收：40题评估、引用支持、无泄漏、详情视觉和核心路径达标。
- 验证：记录实际结果和失败样本，缺项不标完成。
- 完成后记录：实际命令、结果、限制和学习日志；G3 未批准不得执行。

## T23 · 恢复演练与运维就绪

- [ ] 完成
- 需求：R06/上线；依赖：T22。
- 范围：ops/runbook.md；ops/backup.md；docs/04-delivery/recovery.md。
- 验收：隔离环境恢复数据库/素材，演练代码回滚和任务卡住处理。
- 验证：记录实际 RPO/RTO、监控与预算告警。
- 完成后记录：实际命令、结果、限制和学习日志；G3 未批准不得执行。

## T24 · 预览评审与正式发布

- [ ] 完成
- 需求：全部；依赖：T23 + 用户具体发布批准。
- 范围：docs/04-delivery/release.md；deployment config。
- 验收：展示具体版本与域名，明确受众、费用、回滚；批准后上线。
- 验证：生产烟测并记录版本、权限和已知限制。
- 完成后记录：实际命令、结果、限制和学习日志；G3 未批准不得执行。
