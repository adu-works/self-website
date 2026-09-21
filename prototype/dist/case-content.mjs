/** One source for the case study's copy, real destinations and presentation crops.
 * These are prototype capabilities, never claims of deployed backend functionality. */
export const caseChapters=[
 {label:'个人空间',en:'A PLACE OF YOUR OWN',title:'一个人。\n一个生长的空间。',text:'让文字、书籍与亲手做出的作品，成为认识一个人的不同入口。',route:'home',focus:'.hero',tone:'sage',mode:'overview'},
 {label:'认识作者',en:'A CLEAR FIRST IMPRESSION',title:'先认识我，\n再看看最近。',text:'固定的自述留下来时的路。右侧同一张卡片，承接文章、作品、书籍与商品的最新更新。',route:'home',focus:'.hero',detail:'.feature',tone:'cream',mode:'split'},
 {label:'长文阅读',en:'ROOM FOR THOUGHT',title:'把注意力，\n还给文字。',text:'正文、引言和目录各有位置。读到哪里、还想看什么，始终有清楚的方向。',route:'article/small',focus:'.detail-grid',detail:'.toc',tone:'paper',mode:'reading'},
 {label:'专题路径',en:'ONE IDEA LEADS TO ANOTHER',title:'读完一篇，\n还有一条路。',text:'把有关联的文章组织成专题，从一个具体问题，走向一次完整实践。',route:'series/independent',focus:'.page-head',tone:'clay',mode:'path'},
 {label:'独立书籍',en:'IDEAS WITH A SPINE',title:'有些想法，\n值得写成一本书。',text:'独立书架、完整目录与连续阅读。一本书有自己的空间，也与网站里的实践相连。',route:'books',focus:'.book-shelf',detail:'.book-title-panel',tone:'sage',mode:'book'},
 {label:'开放协作',en:'READ. TRACE. CONTRIBUTE.',title:'看见文字，\n也看见它的来处。',text:'章节标题旁直接查看源文件，或前往 GitHub 提议修改。阅读与协作之间，只隔一个入口。',route:'book/independent-site/chapter1',focus:'.book-reader',detail:'.chapter-actions',tone:'paper',mode:'source'},
 {label:'作品呈现',en:'SHOW THE WORK',title:'作品自己说话。',text:'每一个项目都值得讲清：解决什么问题，如何使用，哪些细节经过了取舍。你正在看的，就是其中一件。',route:'projects',focus:'.project-collection',tone:'ink',mode:'work'},
 {label:'生活影像',en:'BEYOND THE SCREEN',title:'屏幕之外，\n生活还在发生。',text:'横向错落的影像画廊，点开后进入全屏。这里展示的是程序样片，未来换成自己的生活记录。',route:'home/overview/section-life',focus:'.visual-archive',tone:'ink',mode:'film'},
 {label:'小店咨询',en:'FROM INTEREST TO CONVERSATION',title:'先知道价值。\n再聊是否适合。',text:'内容、示例价格、交付方式先说明白。感兴趣再加微信，每晚集中处理，不把咨询误当成付款。',route:'product/website',focus:'.product-detail',detail:'.product-summary',tone:'clay',mode:'shop'},
 {label:'引用问答',en:'ANSWERS WITH A WAY BACK',title:'回答不是终点。\n原文才是依据。',text:'在完整会话里提问，从回答的引用回到具体文章。只讨论公开内容；此处为固定回答演示。',route:'chat',focus:'.chat-layout',preset:'chat',detail:'.messages',tone:'sage',mode:'chat'},
 {label:'订单交付',en:'KNOW WHAT HAPPENS NEXT',title:'卖给了谁。\n还要做什么。',text:'订单、交付和到期状态放在同一张工作台。微信成交与飞书授权由本人处理，这里记录进度。',route:'admin/orders',focus:'.admin-layout',detail:'.admin-stats',tone:'cream',mode:'orders'},
 {label:'站长 Agent',en:'YOUR JUDGEMENT STAYS IN CONTROL',title:'让 AI 提案。\n让自己决定。',text:'先检查修改差异，再确认是否保存。展示仅生成模拟提案，没有发布、付款或飞书写入。',route:'admin/content',focus:'.admin-panel',preset:'agent',detail:'.proposal',tone:'ink',mode:'agent'}
];
