# 黄凌波 · 文字、作品与独立实践

原型 v2.2.0 已按“个人影响力 + 售卖入口”重新设计，待评审；文档 v3.3 同步调整，正式开发未开始。

只需要从下面四个入口看文档：

- [PRD：网站做什么](docs/PRD.md)
- [模块设计：每个功能怎么用、怎么实现](docs/modules/)
- [功能实现方案：语言、架构与开发方法](docs/IMPLEMENTATION.md)
- [进度规划：下一步与需要你决定的事](docs/PLAN.md)

[当前原型](prototype/README.md) · [Sites 预览](https://mars-fieldnotes.hlb424559864.chatgpt.site) · [学习文档](learn/README.md) · [GitHub 公开仓库](https://github.com/adu-works/self-website)

原型只有 `prototype/` 一份。默认直接进入主站；火星是可选作品。文章、商品、AI 和订单为示例，不收集真实 Key 或付款资料。历史版本和旧方案在 Git 历史中，不保留重复目录。

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
