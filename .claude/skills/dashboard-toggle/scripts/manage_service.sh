#!/bin/bash
# Copyright 2026 SimmerChan
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -e

PROJECT_DIR="$HOME/Documents/pythonprojects/claude_session_dashboard"
PID_FILE="$HOME/.claude-dashboard.pid"
CLI_PATH="$PROJECT_DIR/packages/cli/dist/index.js"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if project exists
check_project_exists() {
    if [ ! -d "$PROJECT_DIR" ]; then
        return 1
    fi
    return 0
}

# Check if CLI is built
check_cli_built() {
    if [ ! -f "$CLI_PATH" ]; then
        return 1
    fi
    return 0
}

# Check if service is running
is_service_running() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            return 0
        fi
    fi
    return 1
}

# Install and build project
install_project() {
    log_info "项目不存在，开始安装..."

    if ! check_project_exists; then
        log_error "项目目录不存在: $PROJECT_DIR"
        log_info "请先克隆项目："
        echo "  git clone https://github.com/SimmerChan/claude-session-dashboard.git $PROJECT_DIR"
        exit 1
    fi

    cd "$PROJECT_DIR"

    # Check if pnpm is installed
    if ! command -v pnpm &> /dev/null; then
        log_info "安装 pnpm..."
        npm install -g pnpm
    fi

    log_info "安装依赖..."
    pnpm install

    log_info "构建项目..."
    pnpm build

    log_info "安装完成！"
}

# Start service
start_service() {
    if is_service_running; then
        local pid=$(cat "$PID_FILE")
        log_info "服务已在运行中 (PID: $pid)"
        return 0
    fi

    if ! check_cli_built; then
        log_warn "CLI 未构建，开始构建..."
        cd "$PROJECT_DIR"
        pnpm build
    fi

    log_info "启动服务..."
    node "$CLI_PATH" start
}

# Stop service
stop_service() {
    if ! is_service_running; then
        log_info "服务未运行"
        # Clean up stale PID file
        [ -f "$PID_FILE" ] && rm -f "$PID_FILE"
        return 0
    fi

    local pid=$(cat "$PID_FILE")
    log_info "停止服务 (PID: $pid)..."
    node "$CLI_PATH" stop
}

# Toggle service
toggle_service() {
    if is_service_running; then
        stop_service
    else
        # Check if project needs installation
        if ! check_cli_built; then
            install_project
        fi
        start_service
    fi
}

# Main
case "${1:-toggle}" in
    install)
        install_project
        ;;
    start)
        if ! check_cli_built; then
            install_project
        fi
        start_service
        ;;
    stop)
        stop_service
        ;;
    status)
        if is_service_running; then
            local pid=$(cat "$PID_FILE")
            log_info "服务运行中 (PID: $pid)"
            echo "访问地址: http://localhost:3000"
        else
            log_info "服务未运行"
        fi
        ;;
    toggle)
        toggle_service
        ;;
    *)
        echo "用法: $0 {install|start|stop|status|toggle}"
        exit 1
        ;;
esac
