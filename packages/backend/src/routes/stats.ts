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

import express from 'express';
import { sessionService } from '../services/session.service';
import { dataService } from '../services/data.service';

const router = express.Router();

/**
 * GET /api/stats
 * 获取统计信息
 */
router.get('/', async (req, res) => {
  try {
    const projects = await dataService.listProjects();
    const sessions = await sessionService.getAllSessions();
    const path = await import('path');

    // 只为有 sessions-index.json 的项目获取统计信息
    const projectStatsPromises = projects.map(async (projectDir) => {
      const indexPath = path.join(dataService.getClaudeDir(), 'projects', projectDir, 'sessions-index.json');
      const index = await dataService.readJson<{ entries: { projectPath: string }[] }>(indexPath);

      // 如果没有索引文件，跳过该项目
      if (!index) {
        return null;
      }

      // 从索引文件中获取完整路径
      const fullPath = index?.entries?.[0]?.projectPath;
      if (!fullPath) {
        return null;
      }

      const projectSessions = sessions.filter(s => s.projectPath === fullPath);
      return {
        projectPath: fullPath,
        sessionCount: projectSessions.length,
        messageCount: projectSessions.reduce((sum, s) => sum + s.messageCount, 0),
      };
    });

    const results = await Promise.all(projectStatsPromises);
    // 过滤掉 null 值（没有索引文件的项目）
    const validProjectStats = results.filter(r => r !== null);

    const stats = {
      totalProjects: validProjectStats.length,
      totalSessions: sessions.length,
      totalMessages: sessions.reduce((sum, s) => sum + s.messageCount, 0),
      projectStats: validProjectStats,
    };

    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router;
