# 数据与接口约定

> v1.0 · G3 提案。实现时生成 schema 与接口测试，本文件不是已运行 API。

## 通用规则

JSON UTF-8；Zod 校验长度、枚举、URL、块结构。所有响应带 requestId；错误结构 `{code, message, retryable, requestId}`，不回传上游原始请求、Key 或 stack。公开 GET 可按 releaseId 缓存；问答、凭据与管理员响应 `Cache-Control: no-store`。写接口验证 Origin、CSRF 与站长会话；认证与上游模型认证不能混用。

| 接口 | 输入 / 输出 | 授权与重要失败 |
|---|---|---|
| GET /api/content/:slug | releaseId 可选；公开 revision、blocks、canonical URL | 只读公开；404/410 区分不存在/已撤回 |
| GET /api/search?q= | query、可选 projectId；排序结果与 blockId | 只查公开 release；限制 query 长度与频率 |
| POST /api/model/validate | providerId、model、批准的 endpointId；Key 在专用请求头 | 限流、no-store，绝不进入访问日志 |
| POST /api/chat | requestId、scope、messages、modelConfig；Key 专用请求头 | SSE sources/token/done/error；400/401/429/502/504 |
| GET /api/admin/content/:id | 草稿、已发布版本 | 站长；401/403 |
| POST /api/admin/proposals | contentId、baseVersion、instruction、材料引用 | 站长；返回 proposalId、完整差异、hash、expiresAt |
| POST /api/admin/proposals/:id/confirm | patchHash、baseVersion、idempotencyKey | 站长；202 operationId；409 冲突/失效；重复同 Key 返回原操作 |
| POST /api/admin/proposals/:id/cancel | proposalId | 站长；未执行可取消，执行后不能伪装撤销 |
| GET /api/admin/operations/:id | operationId | 站长；逐步骤状态，恢复未知结果 |
| POST /api/admin/restore-proposals | contentId、targetRevision、currentVersion | 只生成恢复提案，再走 confirm |
| POST /api/admin/assets | mime、size、alt 等；受限上传凭证 | 站长；扩展名与魔数校验，禁止任意可执行 SVG/HTML |

## 问答契约

scope 为 `{kind:'site'}` 或 `{kind:'project',id}`。请求不能直接指定私有 revision。服务端选定 active release，再检索、组装上下文并冻结 source 集合。供应商配置只决定文本生成，不决定可访问材料。

```json
{"type":"sources","releaseId":"uuid","items":[{"sourceId":"s1","contentId":"uuid","revisionId":"uuid","blockId":"uuid","title":"示例文章","url":"/notes/example?rev=uuid#block-uuid"}]}
```

随后 token 事件含文本增量；done 含 answerId、实际引用 sourceId、finishReason；error 含规范错误码，正文已有增量时标注“不完整回答”。工具调用、HTML 与模型返回 URL 不直接执行。对于不存在的 s99 引用，过滤并标注证据缺失；不自动把另一段资料配上去。

## 状态机与事务边界

提案：draft → ready → confirmed → executing → succeeded/partial_failed/failed；ready 还可 canceled/expired/stale。confirmed 之后同一 proposal 只能绑定一个 operation。

发布步骤：save_revision → prepare_release → build_index → activate_release → invalidate_cache。save_revision 成功但后续失败时，公开站仍指向旧 release，UI 提示“草稿已保存，发布失败”。activate_release 原子提交，index 必须已准备好。invalidate_cache 失败为“已发布，缓存同步待重试”，查询页可绕过缓存核实版本。

安全撤回单独更新撤回表/denylist，并在每次引用解析与检索出结果时检查，避免旧快照或缓存泄露已撤回资料。首次真实后端验收必须覆盖撤回后旧回答引用。

## 数据维护

每次 schema 修改提交 migration 和回滚策略；生产禁止手工改表后补写文档。旧 revision 只读；清理任务不能删除被 release/proposal 引用的对象。日常草稿版本保留策略、管理员日志保留期、备份频率在上线前按实际预算配置并记录。访客正文与 Key 默认不入数据库；操作审计只存站长 ID、对象 ID、hash、步骤状态，不存秘密。
