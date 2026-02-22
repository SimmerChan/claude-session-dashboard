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
      }
    }

    // 按修改时间排序（最新的在前）
    return allSessions.sort((a, b) => b.fileMtime - a.fileMtime);
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

    return dataService.readJsonl<SessionMessage>(session.fullPath);
  }

  /**
   * 根据项目路径获取会话列表
   */
  async getSessionsByProject(projectPath: string): Promise<SessionIndexEntry[]> {
    const allSessions = await this.getAllSessions();
    return allSessions.filter(s => s.projectPath === projectPath);
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
