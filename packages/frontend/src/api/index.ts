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

import axios from 'axios';
import type {
  SessionIndexEntry,
  SessionMessage,
  SearchResult,
  Stats,
} from '@/types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 会话相关 API
export const sessionsApi = {
  // 获取所有会话
  getAll: async (): Promise<SessionIndexEntry[]> => {
    const { data } = await api.get<{ sessions: SessionIndexEntry[] }>('/sessions');
    return data.sessions;
  },

  // 获取会话详情
  getById: async (id: string): Promise<SessionMessage[]> => {
    const { data } = await api.get<{ messages: SessionMessage[] }>(`/sessions/${id}`);
    return data.messages;
  },

  // 根据项目获取会话
  getByProject: async (projectPath: string): Promise<SessionIndexEntry[]> => {
    const { data } = await api.get<{ sessions: SessionIndexEntry[] }>('/sessions', {
      params: { project: projectPath },
    });
    return data.sessions;
  },
};

// 搜索 API
export const searchApi = {
  search: async (query: string, options?: {
    projectPath?: string;
    limit?: number;
  }): Promise<SearchResult[]> => {
    const { data } = await api.get<{ results: SearchResult[]; count: number }>('/search', {
      params: {
        q: query,
        project: options?.projectPath,
        limit: options?.limit,
      },
    });
    return data.results;
  },
};

// 项目 API
export const projectsApi = {
  // 获取所有项目
  getAll: async (): Promise<string[]> => {
    const { data } = await api.get<{ projects: string[] }>('/projects');
    return data.projects;
  },
};

// 统计 API
export const statsApi = {
  // 获取统计信息
  get: async (): Promise<Stats> => {
    const { data } = await api.get<Stats>('/stats');
    return data;
  },
};

export default api;
