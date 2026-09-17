# GitHub 项目归档

仓库：https://github.com/adu-works/self-website （公开）

用户要求放到 GitHub 的 adu；本机已登录 adu-works，采用该账号。仓库包括 PRD、设计与协作文档、学习日志、历史原型、当前原型源码及素材许可。未上传凭据、Git 内部元数据和运行缓存。

项目根目录现在有独立 Git 仓库。Sites 的 v1.0 仓库与 v1.1 worktree 保留独立历史，GitHub 把其文件作为普通文件快照保存，不使用无法访问的子模块。现有已跟踪文件可在根目录正常提交；若向嵌套原型目录新加文件，请在根目录使用 `git update-index --add` 显式纳入，避免误提交 gitlink。从 GitHub 新克隆的目录没有嵌套 Git 元数据，可直接使用普通 git add。

GitHub 推送使用 adu-works 的现有 gh 登录凭据，仅在进程内提供，不写入远程 URL 或文件；不切换用户全局默认账号。Sites 仍使用独立发布通路。

社媒展示的 GitHub 主页尚待用户指定；备份仓库所属账号不自动作为唯一公开社媒身份。

2026-09-17：用户明确要求“仓库改为公开”，已修改并通过 GitHub 查询确认 PUBLIC。该授权仅涉及仓库，Sites 访问权限保持不变。
