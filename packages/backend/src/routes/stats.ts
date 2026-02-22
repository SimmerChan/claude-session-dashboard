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

    // 计算统计信息
    const stats = {
      totalProjects: projects.length,
      totalSessions: sessions.length,
      totalMessages: sessions.reduce((sum, s) => sum + s.messageCount, 0),
      projectStats: await Promise.all(
        projects.map(async (projectPath) => {
          const projectSessions = await sessionService.getSessionsByProject(projectPath);
          return {
            projectPath,
            sessionCount: projectSessions.length,
            messageCount: projectSessions.reduce((sum, s) => sum + s.messageCount, 0),
          };
        })
      ),
    };

    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router;
