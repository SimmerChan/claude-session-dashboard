// Copyright 2026 SimmerChan
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { spawn } from 'child_process';
import { writeFile, unlink, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const PID_FILE = path.join(homedir(), '.claude-dashboard.pid');

async function start() {
  // 检查是否已经在运行
  if (existsSync(PID_FILE)) {
    try {
      const pid = parseInt(await readFile(PID_FILE, 'utf-8'));
      process.kill(pid, 0); // 检查进程是否存在
      console.log(`服务已在运行中 (PID: ${pid})`);
      console.log(`访问地址: http://localhost:${PORT}`);
      console.log(`使用 'claude-session-dashboard stop' 停止服务`);
      return;
    } catch {
      // 进程不存在，删除旧的 PID 文件
      await unlink(PID_FILE);
    }
  }

  const backendPath = path.join(__dirname, '..', '..', 'backend', 'dist', 'index.js');

  // 使用 detached 模式创建守护进程
  const backend = spawn('node', [backendPath], {
    env: { ...process.env, PORT: String(PORT) },
    detached: true,
    stdio: 'ignore',
  });

  // 保存 PID
  await writeFile(PID_FILE, String(backend.pid));

  // 分离子进程
  backend.unref();

  console.log(`Claude Session Dashboard 启动成功!`);
  console.log(`后端服务运行在: http://localhost:${PORT}`);
  console.log(`进程 PID: ${backend.pid}`);
  console.log(`使用 'claude-session-dashboard stop' 停止服务`);
}

async function stop() {
  if (!existsSync(PID_FILE)) {
    console.log('服务未运行');
    return;
  }

  try {
    const pid = parseInt(await readFile(PID_FILE, 'utf-8'));
    process.kill(pid, 'SIGTERM');
    await unlink(PID_FILE);
    console.log(`服务已停止 (PID: ${pid})`);
  } catch (err: any) {
    if (err.code === 'ESRCH') {
      console.log('服务进程不存在，清理 PID 文件');
      await unlink(PID_FILE);
    } else {
      console.error('停止服务失败:', err.message);
      process.exit(1);
    }
  }
}

async function status() {
  if (!existsSync(PID_FILE)) {
    console.log('服务未运行');
    return;
  }

  try {
    const pid = parseInt(await readFile(PID_FILE, 'utf-8'));
    process.kill(pid, 0); // 检查进程是否存在
    console.log(`服务运行中 (PID: ${pid})`);
    console.log(`访问地址: http://localhost:${PORT}`);
  } catch (err: any) {
    if (err.code === 'ESRCH') {
      console.log('服务进程不存在，清理 PID 文件');
      await unlink(PID_FILE);
    } else {
      console.error('检查状态失败:', err.message);
    }
  }
}

async function main() {
  const command = process.argv[2] || 'start';

  switch (command) {
    case 'start':
      await start();
      break;
    case 'stop':
      await stop();
      break;
    case 'status':
      await status();
      break;
    case 'restart':
      await stop();
      // 等待进程完全退出
      await new Promise(resolve => setTimeout(resolve, 1000));
      await start();
      break;
    default:
      console.log('用法:');
      console.log('  claude-session-dashboard [command]');
      console.log('');
      console.log('命令:');
      console.log('  start     启动服务 (默认)');
      console.log('  stop      停止服务');
      console.log('  status    查看服务状态');
      console.log('  restart   重启服务');
      break;
  }
}

main().catch(err => {
  console.error('错误:', err);
  process.exit(1);
});
