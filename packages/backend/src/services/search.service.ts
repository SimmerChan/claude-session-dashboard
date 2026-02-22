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

import { sessionService } from './session.service';
import { dataService } from './data.service';
import type { SearchResult, SessionIndexEntry, SessionMessage } from '../types';

export class SearchService {
  /**
   * 搜索会话内容
   */
  async searchSessions(query: string, options: {
    projectPath?: string;
    limit?: number;
  } = {}): Promise<SearchResult[]> {
    const { projectPath, limit = 20 } = options;

    // 获取会话列表
    let sessions: SessionIndexEntry[];
    if (projectPath) {
      sessions = await sessionService.getSessionsByProject(projectPath);
    } else {
      sessions = await sessionService.getAllSessions();
    }

    // 搜索匹配的会话
    const results: SearchResult[] = [];
    const searchTerms = query.toLowerCase().split(/\s+/);

    for (const session of sessions) {
      const messages = await dataService.readJsonl<SessionMessage>(session.fullPath);
      const matchedMessages: SearchResult['matchedMessages'] = [];
      let score = 0;

      messages.forEach((msg, index) => {
        const content = msg.content || '';
        const lowerContent = content.toLowerCase();

        // 计算匹配分数
        let matchScore = 0;
        let matched = false;

        for (const term of searchTerms) {
          if (lowerContent.includes(term)) {
            matched = true;
            // 消息类型权重: user > assistant > tool_use > tool_result
            const typeWeight = msg.type === 'user' ? 3 : msg.type === 'assistant' ? 2 : 1;
            matchScore += typeWeight;

            // 生成高亮文本
            const highlight = this.generateHighlight(content, term);
            if (highlight) {
              matchedMessages.push({ index, content: content.substring(0, 200), highlight });
            }
          }
        }

        if (matched) {
          score += matchScore;
        }
      });

      if (matchedMessages.length > 0) {
        results.push({
          sessionId: session.sessionId,
          projectPath: session.projectPath,
          firstPrompt: session.firstPrompt,
          matchedMessages: matchedMessages.slice(0, 5), // 最多返回5条匹配消息
          score,
        });
      }
    }

    // 按分数排序
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, limit);
  }

  /**
   * 生成搜索高亮文本
   */
  private generateHighlight(content: string, term: string): string {
    const index = content.toLowerCase().indexOf(term);
    if (index === -1) return '';

    const start = Math.max(0, index - 30);
    const end = Math.min(content.length, index + term.length + 30);
    let snippet = content.substring(start, end);

    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';

    return snippet;
  }
}

export const searchService = new SearchService();
