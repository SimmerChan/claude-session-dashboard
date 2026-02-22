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
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// 启动后端服务
const backendPath = path.join(__dirname, '..', 'backend', 'dist', 'index.js');
const backend = spawn('node', [backendPath], {
  env: { ...process.env, PORT: String(PORT) },
  stdio: 'inherit',
});

backend.on('error', (err) => {
  console.error('Failed to start backend:', err);
  process.exit(1);
});

console.log(`Claude Session Dashboard 启动成功!`);
console.log(`后端服务运行在: http://localhost:${PORT}`);
console.log(`按 Ctrl+C 停止服务`);

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭服务...');
  backend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  backend.kill();
  process.exit(0);
});
