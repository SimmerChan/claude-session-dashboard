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

const router = express.Router();

/**
 * GET /api/sessions
 * 获取会话列表（支持分页和项目筛选）
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const projectPath = req.query.projectPath as string | undefined;

    let sessions = await sessionService.getAllSessions();

    // 按项目路径筛选
    if (projectPath) {
      sessions = sessions.filter(s => s.projectPath === projectPath);
    }

    const total = sessions.length;
    const start = (page - 1) * pageSize;
    const data = sessions.slice(start, start + pageSize);

    res.json({
      data,
      pagination: { page, pageSize, total }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

/**
 * GET /api/sessions/:id
 * 获取单个会话详情
 */
router.get('/:id', async (req, res) => {
  try {
    const session = await sessionService.getSessionById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

export default router;
