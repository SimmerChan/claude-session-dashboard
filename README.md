# Claude Session Dashboard

一个用于查看和搜索 Claude Code 会话历史的本地 Web 应用。

## 功能特性

- 查看所有 Claude Code 会话历史
- 按项目筛选会话
- 搜索会话内容
- 查看会话详情（包括所有消息）
- 查看统计信息（项目数、会话数、消息数）
- 完全本地运行，无需联网

## 安装

### 从源码安装

```bash
# 克隆仓库
git clone https://github.com/SimmerChan/claude-session-dashboard.git
cd claude-session-dashboard

# 安装依赖
pnpm install

# 构建项目
pnpm build

# 全局安装
pnpm install -g
```

### 使用 pkg 打包

```bash
# 打包为可执行文件
pnpm run pkg

# 生成的可执行文件位于 packages/cli/dist/
```

## 使用方法

### 开发模式

```bash
# 启动后端服务
cd packages/backend
pnpm dev

# 启动前端服务（新终端）
cd packages/frontend
pnpm dev
```

访问 http://localhost:5173 查看应用。

### 生产模式

```bash
# 构建前端
cd packages/frontend
pnpm build

# 构建后端
cd ../backend
pnpm build

# 启动服务
node dist/index.js
```

访问 http://localhost:3000 查看应用。

### 使用 CLI

```bash
# 全局安装后
claude-session-dashboard
```

## 配置

### 环境变量

创建 `.env` 文件（参考 `.env.example`）：

```bash
PORT=3000
CLAUDE_DIR=$HOME/.claude
```

### Claude 目录

应用会自动读取 Claude Code 的会话数据：
- macOS: `~/.claude/`
- Linux: `~/.claude/`
- Windows: `%USERPROFILE%\.claude\`

## 技术栈

### 后端
- Node.js + Express
- TypeScript
- pkg (打包为可执行文件)

### 前端
- Vue 3
- TypeScript
- Element Plus
- Pinia (状态管理)
- Vite (构建工具)

## 项目结构

```
claude-session-dashboard/
├── packages/
│   ├── backend/          # 后端服务
│   │   ├── src/
│   │   │   ├── routes/   # API 路由
│   │   │   ├── services/ # 业务逻辑
│   │   │   └── types/    # 类型定义
│   │   └── dist/         # 编译输出
│   ├── frontend/         # 前端应用
│   │   ├── src/
│   │   │   ├── views/    # 页面组件
│   │   │   ├── components/ # 通用组件
│   │   │   ├── api/      # API 客户端
│   │   │   └── stores/   # 状态管理
│   │   └── dist/         # 构建输出
│   └── cli/              # CLI 入口
│       ├── src/          # CLI 源码
│       └── dist/         # 可执行文件
├── package.json          # 根 package.json
└── pnpm-workspace.yaml   # pnpm 工作区配置
```

## API 文档

### 会话相关

- `GET /api/sessions` - 获取所有会话列表
- `GET /api/sessions/:id` - 获取会话详情

### 搜索

- `GET /api/search?q=关键词` - 搜索会话内容
- `GET /api/search?q=关键词&project=项目路径` - 在指定项目中搜索

### 项目

- `GET /api/projects` - 获取所有项目列表

### 统计

- `GET /api/stats` - 获取统计信息

## 开发

### 添加新功能

1. 后端：在 `packages/backend/src/` 中添加路由和服务
2. 前端：在 `packages/frontend/src/` 中添加组件和页面
3. 更新类型定义：`packages/backend/src/types/index.ts` 和 `packages/frontend/src/types/index.ts`

### 构建

```bash
# 构建所有包
pnpm build

# 构建特定包
pnpm --filter backend build
pnpm --filter frontend build
```

## License

Apache License 2.0

## 作者

SimmerChan
