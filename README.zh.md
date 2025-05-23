# 表情名字大师 (emoji-master)

*[English](README.md) | [日本語](README.ja.md) | 中文*

## 项目简介

**表情名字大师**是一个将工作与娱乐相结合的创新游戏演示项目。在这个游戏中，玩家需要使用emoji表情来表达中国名字，挑战自己的创意思维。

这个项目旨在探索一个有趣的想法：**能否设计一种游戏，让人以为在开心娱乐，其实是在完成经过大模型包装、转化后的工作任务？**这样人们可以在享受游戏乐趣的同时还能赚到钱，实现工作与娱乐的完美融合。

## 核心功能

- **创意挑战**：使用emoji表情组合来表达中国名字
- **AI点评**：大模型评估你的表达的准确度与创意性
- **积分系统**：获得详细的评分反馈
- **社交分享**：挑战好友，分享你的创意表达
- **成就系统**：基于评分获得不同级别的称号

## 思想探索

这个项目探索了几个重要概念：

1. **工作游戏化**：将乏味的工作任务转变为有趣的游戏挑战
2. **大模型辅助转化**：使用AI对工作任务进行包装和转化，使其更具娱乐性
3. **双赢模式**：玩家获得游戏乐趣和奖励，同时完成有价值的工作
4. **社交激励**：通过社交分享和竞争提高参与度

## 技术栈

- Next.js 15.3.0
- React 19.0.0
- Tailwind CSS
- OpenAI API
- Supabase

## 安装与使用

```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev

# 构建项目
npm run build

# 启动生产服务器
npm start
```

## 项目结构

- `/app` - Next.js应用主目录
  - `/page.js` - 主页
  - `/game` - 游戏页面
  - `/result` - 结果和评分页面
  - `/api` - API路由
  - `/components` - 可复用组件
- `/data` - 游戏数据（名字和emoji对应关系）
- `/public` - 静态资源

## 未来展望

这个演示项目展示了一种新的工作方式的可能性。未来可以扩展为：

1. **多样化任务**：不同类型的游戏对应不同类型的工作任务
2. **奖励系统**：完善的虚拟奖励或实际经济奖励
3. **社区建设**：创建一个玩家/工作者社区
4. **企业应用**：与企业合作，将真实工作任务融入游戏

## 贡献指南

欢迎贡献新的想法、名字数据或功能改进！请创建Issue或提交Pull Request。

## 许可证

Apache License 2.0 