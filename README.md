# 黄凌波 · 远行手记

当前原型已确定为技术设计基线；技术实现方案与开发规划 v1.0 待评审，正式功能实现未开始。

- [当前原型](prototype/README.md) · [Sites 在线预览](https://mars-fieldnotes.hlb424559864.chatgpt.site)
- [PRD](docs/01-product/PRD-personal-site.md) · [功能设计](docs/01-product/functional-design.md) · [内容待办](docs/01-product/content-inventory.md)
- [技术实现方案](docs/03-engineering/architecture.md) · [接口约定](docs/03-engineering/interfaces.md)
- [开发规划](tasks/plan.md) · [24 项任务](tasks/todo.md) · [测试与运维](docs/03-engineering/quality-and-operations.md)
- [阶段与授权](docs/00-project/status.md) · [GitHub 账号及推送说明](docs/00-project/github.md)
- [协作 SOP](docs/05-collaboration/ai-development-sop.md) · [学习日志](learn/logs/018-cleanup-engineering-plan.md)

仓库：[adu-works/self-website](https://github.com/adu-works/self-website)（公开）。当前只有 `prototype/` 一份原型源码；老版本从工作目录删除，Git 历史仍可查询。原型 AI、模型配置、登录和发布均为模拟，不输入真实 Key。

## 本地预览与验证

在项目根目录运行：

```sh
python3 -m http.server 4788 --bind 127.0.0.1 --directory prototype/dist
```

打开 http://localhost:4788/ 。停止服务用 Ctrl+C。逻辑检查：

```sh
cd prototype
node --test *.test.mjs
```

`docs/` 保存当前产品与技术文档，`tasks/` 保存唯一开发任务清单，`learn/` 保存真实学习记录。不要在原型目录中初始化另一套 Git；从项目根目录正常 `git add`、`git commit`、`git push` 即可。
