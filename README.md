# Claude Session Dashboard

一个用于查看和搜索 Claude Code 会话历史的本地 Web 应用。

## 功能特性

- 查看所有 Claude Code 会话历史
- 按项目筛选会话
- 搜索会话内容（支持关键词匹配和高亮）
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

# 全局安装 CLI
pnpm install -g
```

## 使用方法

### CLI 命令（推荐）

全局安装后，可以使用以下命令管理服务：

```bash
# 启动服务（后台运行）
claude-session-dashboard start

# 停止服务
claude-session-dashboard stop

# 查看服务状态
claude-session-dashboard status

# 重启服务
claude-session-dashboard restart
```

服务启动后，访问 http://localhost:3000 查看应用。

### 开发模式

```bash
# 同时启动前端和后端（推荐）
pnpm dev

# 或分别启动
pnpm dev:backend  # 后端服务，端口 3000
pnpm dev:frontend # 前端服务，端口 5173
```

访问 http://localhost:5173 查看应用。

### 生产模式

```bash
# 构建项目
pnpm build

# 使用 CLI 启动
node packages/cli/dist/index.js start

# 或直接启动后端
node packages/backend/dist/index.js
```

## 配置

### 环境变量

创建 `.env` 文件（可选）：

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
- CORS 支持

### 前端
- Vue 3 (Composition API)
- TypeScript
- Element Plus UI 组件库
- Pinia 状态管理
- Vite 构建工具

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
│   │   │   ├── api/      # API 客户端
│   │   │   └── stores/   # 状态管理
│   │   └── dist/         # 构建输出
│   └── cli/              # CLI 工具
│       └── src/          # CLI 源码
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
pnpm --filter cli build
```

## License

Apache License 2.0

## 作者

SimmerChan
