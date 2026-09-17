# GitHub 与本地账号

项目仓库：https://github.com/adu-works/self-website （公开）。根目录为唯一工作仓库；prototype 现在是普通目录，不再是嵌套 worktree。历史版本通过 Git 查询，无需在文件夹里留多个版本。

## 在本机切换到 adu-works 推送

本机已经登录 adu-works 和 Lingbo-Huang，项目 remote 使用 HTTPS。在终端执行：

```sh
cd /Users/huanglingbo3/self/self-website
gh auth switch --hostname github.com --user adu-works
gh auth setup-git --hostname github.com
gh auth status --hostname github.com
git remote -v
git push origin main
```

`switch` 切换 GitHub CLI 的活动账号；`setup-git` 使 HTTPS Git 使用 gh 的凭据。会影响使用同一 gh 凭据的其他仓库；需要切回时执行 `gh auth switch --hostname github.com --user Lingbo-Huang`。依据：[switch](https://cli.github.com/manual/gh_auth_switch)、[setup-git](https://cli.github.com/manual/gh_auth_setup-git)。

若 shell 设置了 GH_TOKEN/GITHUB_TOKEN，它们可能优先于已登录账号。不要打印 token；在确认是当前 shell 的临时覆盖时执行 `unset GH_TOKEN GITHUB_TOKEN` 后再切换。没有登录时用 `gh auth login --hostname github.com --git-protocol https --web`，在浏览器选择 adu-works。

## 提交新修改

```sh
git status
git add -A
git diff --cached --stat
git commit -m "描述本次改动"
git push origin main
```

`git add -A` 包含删除，提交前应检查暂存差异。若远端领先，用 `git pull --rebase origin main` 并解决冲突，不使用 force 覆盖别人提交。当前 remote 应为 https://github.com/adu-works/self-website.git；远程不同才执行 `git remote set-url origin https://github.com/adu-works/self-website.git`。

`git config user.name` / `user.email` 是提交署名，**不是登录账号**，不能靠改它们获得推送权限。如需调整，仅作用于此项目：

```sh
git config user.name adu-works
git config user.email adu-works@users.noreply.github.com
```

需要贡献准确关联时，邮箱以 GitHub Settings → Emails 给出的本人 noreply 地址为准。本轮代理推送继续使用进程级 adu 凭据，不擅自改变你的全局活动账号。

## Sites 与历史

GitHub 保存完整项目；Sites 保存部署的原型静态包。当前 Site 源提交 4d14d49033073ddea13cc9f0df5afe6f90c36b49，版本 8。本轮只清理位置与文档，没有改运行资源，不重新发布。

为解除旧目录依赖，本机 Sites Git 历史保存为仓库外的 `~/.local/share/self-website/sites-source.git`（bare 仓库，不含另一个可运行原型）。后续 Sites 修改应使用独立临时 checkout 发布，按发布工具要求推送对应源仓库；不能把 GitHub 的提交 SHA 冒充 Sites 源提交。原型现行 manifest 保留 Site ID。
