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

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { sessionsApi, projectsApi, searchApi, statsApi } from '@/api';
import type {
  SessionIndexEntry,
  SessionMessage,
  SearchResult,
  Stats,
} from '@/types';

export const useSessionStore = defineStore('session', () => {
  // 状态
  const sessions = ref<SessionIndexEntry[]>([]);
  const currentSession = ref<SessionMessage[]>([]);
  const currentSessionId = ref<string | null>(null);
  const projects = ref<string[]>([]);
  const stats = ref<Stats | null>(null);
  const searchResults = ref<SearchResult[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 计算属性
  const filteredSessions = computed(() => {
    return (projectPath?: string) => {
      if (!projectPath) return sessions.value;
      return sessions.value.filter(s => s.projectPath === projectPath);
    };
  });

  // 操作
  async function fetchSessions() {
    loading.value = true;
    error.value = null;
    try {
      sessions.value = await sessionsApi.getAll();
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch sessions';
    } finally {
      loading.value = false;
    }
  }

  async function fetchSessionById(id: string) {
    loading.value = true;
    error.value = null;
    currentSessionId.value = id;
    try {
      currentSession.value = await sessionsApi.getById(id);
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch session';
    } finally {
      loading.value = false;
    }
  }

  async function fetchProjects() {
    loading.value = true;
    error.value = null;
    try {
      projects.value = await projectsApi.getAll();
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch projects';
    } finally {
      loading.value = false;
    }
  }

  async function fetchStats() {
    loading.value = true;
    error.value = null;
    try {
      stats.value = await statsApi.get();
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch stats';
    } finally {
      loading.value = false;
    }
  }

  async function search(query: string, options?: {
    projectPath?: string;
    limit?: number;
  }) {
    loading.value = true;
    error.value = null;
    try {
      searchResults.value = await searchApi.search(query, options);
    } catch (e: any) {
      error.value = e.message || 'Search failed';
    } finally {
      loading.value = false;
    }
  }

  function clearError() {
    error.value = null;
  }

  return {
    // 状态
    sessions,
    currentSession,
    currentSessionId,
    projects,
    stats,
    searchResults,
    loading,
    error,
    // 计算属性
    filteredSessions,
    // 操作
    fetchSessions,
    fetchSessionById,
    fetchProjects,
    fetchStats,
    search,
    clearError,
  };
});
