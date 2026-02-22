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
import { searchService } from '../services/search.service';

const router = express.Router();

/**
 * GET /api/search
 * 搜索会话内容
 */
router.get('/', async (req, res) => {
  try {
    const { q, project, limit } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const results = await searchService.searchSessions(q, {
      projectPath: project as string,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({ results, count: results.length });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
