# 黄凌波 · 远行手记

当前原型 v1.1.6 已认可；产品与实现方案 v2.0 待评审，正式开发未开始。

只需要从下面三个入口看文档：

- [PRD：网站做什么](docs/PRD.md)
- [模块设计：每个功能怎么用、怎么实现](docs/modules/)
- [进度规划：下一步与需要你决定的事](docs/PLAN.md)

[当前原型](prototype/README.md) · [Sites 预览](https://mars-fieldnotes.hlb424559864.chatgpt.site) · [学习文档](learn/README.md) · [GitHub 公开仓库](https://github.com/adu-works/self-website)

原型只有 `prototype/` 一份。AI、登录、模型配置与发布目前仍为模拟，请勿输入真实 Key。历史版本和旧方案在 Git 历史中，不保留重复目录。

## 本地预览

在项目根目录运行：

```sh
python3 -m http.server 4788 --bind 127.0.0.1 --directory prototype/dist
```

打开 http://localhost:4788/ ，用 Ctrl+C 停止。原型逻辑检查：

```sh
cd prototype
node --test *.test.mjs
```

项目根目录是唯一 Git 工作仓库。[账号切换与推送说明](learn/README.md)。
