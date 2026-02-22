# Claude Skills

此目录包含 Claude Code 技能包。

## 安装 Skill

### 方法 1: 通过 skills.sh 安装（推荐）

```bash
# 安装单个 skill
npx https://skills.sh#SimmerChan/claude-session-dashboard/dashboard-toggle

# 安装所有 skills
npx https://skills.sh#SimmerChan/claude-session-dashboard
```

### 方法 2: 手动安装

```bash
# 复制 skill 目录到本地 skills 目录
cp -r .claude/skills/dashboard-toggle ~/.claude/skills/
```

## 可用 Skills

### dashboard-toggle

管理 Claude Session Dashboard 服务的启停。

**触发词：**
- "打开会话面板"
- "关闭 dashboard"
- "启动 claude-session-dashboard"
- "切换服务状态"

**功能：**
- 自动检测并安装项目
- 切换服务启停状态
- 后台运行服务
