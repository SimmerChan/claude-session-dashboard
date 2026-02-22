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

import path from 'path';
import { dataService } from './data.service';
import type { SessionsIndex, SessionIndexEntry, SessionMessage } from '../types';

export class SessionService {
  private sessionsCache = new Map<string, SessionIndexEntry[]>();

  /**
   * 获取所有会话
   */
  async getAllSessions(): Promise<SessionIndexEntry[]> {
    const projects = await dataService.listProjects();
    const allSessions: SessionIndexEntry[] = [];

    for (const project of projects) {
      const indexPath = path.join(dataService.getClaudeDir(), 'projects', project, 'sessions-index.json');
      const index = await dataService.readJson<SessionsIndex>(indexPath);

      if (index?.entries) {
        allSessions.push(...index.entries);
      } else {
        // 没有 sessions-index.json，扫描 .jsonl 文件
        const projectSessions = await this.scanProjectSessions(project);
        allSessions.push(...projectSessions);
      }
    }

    // 按修改时间排序（最新的在前）
    return allSessions.sort((a, b) => b.fileMtime - a.fileMtime);
  }

  /**
   * 扫描项目的 .jsonl 文件来获取会话信息
   */
  private async scanProjectSessions(projectDir: string): Promise<SessionIndexEntry[]> {
    const fs = await import('fs/promises');
    const projectPath = await this.resolveProjectPath(projectDir);

    try {
      const entries = await fs.readdir(path.join(dataService.getClaudeDir(), 'projects', projectDir), { withFileTypes: true });
      const jsonlFiles = entries.filter(e => e.isFile() && e.name.endsWith('.jsonl') && e.name !== 'sessions-index.json');

      const sessions: SessionIndexEntry[] = [];
      for (const file of jsonlFiles) {
        const fullPath = path.join(dataService.getClaudeDir(), 'projects', projectDir, file.name);
        const stat = await fs.stat(fullPath);

        // 读取文件的第一行来获取基本信息
        const content = await fs.readFile(fullPath, 'utf-8');
        const lines = content.trim().split('\n');

        for (const line of lines) {
          try {
            const msg = JSON.parse(line);
            if (msg.type === 'user' && msg.message) {
              sessions.push({
                sessionId: file.name.replace('.jsonl', ''),
                fullPath: fullPath,
                fileMtime: stat.mtimeMs,
                firstPrompt: this.extractFirstPrompt(msg),
                messageCount: lines.length, // 估算
                created: new Date(stat.birthtimeMs).toISOString(),
                modified: new Date(stat.mtimeMs).toISOString(),
                gitBranch: '',
                projectPath: projectPath,
                isSidechain: false
              });
              break; // 只取第一条用户消息
            }
          } catch {
            // 忽略解析错误
          }
        }
      }

      return sessions;
    } catch {
      return [];
    }
  }

  /**
   * 从项目中提取项目路径
   */
  private async resolveProjectPath(projectDir: string): Promise<string> {
    // 尝试从任意 jsonl 文件中读取 projectPath
    const fs = await import('fs/promises');
    const projectDirFullPath = path.join(dataService.getClaudeDir(), 'projects', projectDir);

    try {
      const entries = await fs.readdir(projectDirFullPath, { withFileTypes: true });
      const jsonlFiles = entries.filter(e => e.isFile() && e.name.endsWith('.jsonl'));

      for (const file of jsonlFiles) {
        const content = await fs.readFile(path.join(projectDirFullPath, file.name), 'utf-8');
        const lines = content.trim().split('\n').slice(0, 100); // 只检查前100行

        for (const line of lines) {
          try {
            const msg = JSON.parse(line);
            // 检查是否有 cwd 字段可以用来推断项目路径
            if (msg.cwd) {
              // cwd 格式: /Users/username/Documents/pythonprojects/project-name
              return msg.cwd;
            }
          } catch {
            // 忽略
          }
        }
      }
    } catch {
      // 忽略错误
    }

    // 回退：从 projectDir 构建路径
    // -Users-username-Documents-pythonprojects-project-name
    // -> /Users/username/Documents/pythonprojects/project-name
    if (projectDir.startsWith('-')) {
      const parts = projectDir.slice(1).split('-');
      const idx = parts.findIndex(p => p === 'pythonprojects' || p === 'Documents');
      if (idx >= 0 && idx + 1 < parts.length) {
        return '/' + parts.slice(0, idx + 1).join('/');
      }
    }

    return projectDir;
  }

  /**
   * 提取第一条提示词
   */
  private extractFirstPrompt(userMsg: any): string {
    if (userMsg.message && Array.isArray(userMsg.message.content)) {
      const textItems = userMsg.message.content
        .filter((item: any) => item.type === 'text' && item.text)
        .map((item: any) => item.text)
        .join('');
      return textItems;
    }
    return JSON.stringify(userMsg);
  }

  /**
   * 根据 ID 获取会话详情
   */
  async getSessionById(sessionId: string): Promise<SessionMessage[] | null> {
    const sessions = await this.getAllSessions();
    const session = sessions.find(s => s.sessionId === sessionId);

    if (!session) {
      return null;
    }

    // 清空缓存确保读取最新数据
    this.clearCache();
    return dataService.readJsonl<SessionMessage>(session.fullPath);
  }

  /**
   * 根据项目路径获取会话列表
   * @param projectPath - Claude 项目目录名（如 -Users-username-Documents-pythonprojects-project-name）或完整路径
   */
  async getSessionsByProject(projectPath: string): Promise<SessionIndexEntry[]> {
    const allSessions = await this.getAllSessions();

    return allSessions.filter(s => {
      // 精确匹配完整路径
      if (s.projectPath === projectPath) return true;

      // 从 fullPath 中提取 Claude 项目目录名进行匹配
      // fullPath 格式: /Users/username/.claude/projects/-Users-username-Documents-pythonprojects-project-name/xxx.jsonl
      const claudeProjectDir = s.fullPath.split('/.claude/projects/')[1]?.split('/')[0];
      if (claudeProjectDir === projectPath) return true;

      return false;
    });
  }

  /**
   * 根据日期范围获取会话列表
   */
  async getSessionsByDateRange(startDate: Date, endDate: Date): Promise<SessionIndexEntry[]> {
    const allSessions = await this.getAllSessions();
    return allSessions.filter(s => {
      const modified = new Date(s.modified);
      return modified >= startDate && modified <= endDate;
    });
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.sessionsCache.clear();
  }
}

export const sessionService = new SessionService();
