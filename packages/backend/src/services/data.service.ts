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

import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const CLAUDE_DIR = path.join(os.homedir(), '.claude');

export class DataService {
  private cache = new Map<string, unknown>();

  /**
   * 读取 JSON 文件，支持缓存
   */
  async readJson<T>(filePath: string): Promise<T | null> {
    try {
      if (this.cache.has(filePath)) {
        return this.cache.get(filePath) as T;
      }
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content) as T;
      this.cache.set(filePath, data);
      return data;
    } catch (error) {
      return null;
    }
  }

  /**
   * 读取 JSONL 文件（每行一个 JSON 对象）
   */
  async readJsonl<T>(filePath: string): Promise<T[]> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.trim().split('\n');
      const messages = lines.map(line => {
        const parsed = JSON.parse(line);
        // 如果消息有 message.content 数组，提取文本内容
        if (parsed.message && Array.isArray(parsed.message.content)) {
          const textParts: string[] = [];

          for (const item of parsed.message.content) {
            if (typeof item !== 'object' || item === null) continue;

            if (item.type === 'text' && item.text) {
              textParts.push(item.text);
            } else if (item.type === 'thinking' && item.thinking) {
              // 标记思考内容
              textParts.push(`[思考] ${item.thinking.substring(0, 200)}...`);
            } else if (item.type === 'tool_use' && item.name) {
              // 显示工具调用
              const input = item.input ? JSON.stringify(item.input).substring(0, 100) : '';
              textParts.push(`[工具调用] ${item.name}${input ? ': ' + input + '...' : ''}`);
            }
          }

          parsed.content = textParts.join('\n');

          // 如果完全没内容，保存原始数据用于调试
          if (textParts.length === 0) {
            parsed._hasContent = false;
          } else {
            parsed._hasContent = true;
          }
        }
        return parsed as T;
      });
      return messages;
    } catch (error) {
      return [];
    }
  }

  /**
   * 获取 Claude 目录路径
   */
  getClaudeDir(): string {
    return CLAUDE_DIR;
  }

  /**
   * 列出所有项目
   */
  async listProjects(): Promise<string[]> {
    try {
      const projectsDir = path.join(CLAUDE_DIR, 'projects');
      const entries = await fs.readdir(projectsDir, { withFileTypes: true });
      return entries
        .filter(e => e.isDirectory() && !e.name.startsWith('.'))
        .map(e => e.name);
    } catch (error) {
      return [];
    }
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const dataService = new DataService();
