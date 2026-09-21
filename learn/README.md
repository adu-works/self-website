# 学习与协作

每次交付的真实过程都在 [logs/](logs/)，最新是 [026：书籍与 GitHub 编辑入口](logs/026-books-and-github-edit.md)。旧日志中的旧目录链接指向 Git 历史，仅用于理解当时的工作，不是当前要求。

## 以后怎样与 AI 一起维护

先说明目标，AI 读取 PRD 和 PLAN，在当前阶段完成具体成果，再由你评审需要确认的范围。需求、原型、方案、实现按顺序推进；已经授权的同阶段修改无需反复确认。当前事实写在产品文档，历史过程写在日志，别为每个小修改再造一份说明。

开发时一次做一个可用切片：纯逻辑先测试，接页面后走真实操作，再检查失败、取消和返回。截图或测试报告要确实存在；只测状态不等于动作自然，首页好看不等于详情完成。新增功能必须检查关联入口；用户改变目标时重审受影响范围，不因旧交互投入大而继续强迫用户经过它。

每轮日志按 [模板](logs/000-template.md) 写实际做过的事、真实语法、取舍和一个小练习。没有写产品代码就直接说明，不硬凑语言课堂。遇到返工，说明原因和以后如何避免。

## Git 账号小抄

从项目根目录操作。提交署名和 GitHub 推送身份是两件事：

```sh
git config user.name adu-works
git config user.email adu-works@users.noreply.github.com
gh auth status
gh auth switch --hostname github.com --user adu-works
gh auth setup-git
git remote -v
git status
git add <你要提交的文件>
git commit -m "说明本次改动"
git push origin main
```

上述账号切换适用于已经通过 GitHub CLI 登录两个账号，并由它提供 HTTPS 凭据的环境；它会影响之后使用 gh 的身份。没登录时先运行 `gh auth login --hostname github.com --git-protocol https`。操作结束若要切回，运行 `gh auth switch --hostname github.com --user Lingbo-Huang`。不要把 token 写进仓库、命令示例或远程地址。
