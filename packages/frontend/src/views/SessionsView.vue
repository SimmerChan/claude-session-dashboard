<!--
Copyright 2026 SimmerChan

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
// limitations under the License.
-->

<template>
  <div class="sessions-view">
    <!-- 顶部搜索栏 -->
    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索会话内容..."
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 三栏布局 -->
    <div class="three-column-layout" :class="{ 'search-mode': isSearching }">
      <!-- 左栏：项目列表（搜索时隐藏） -->
      <div v-if="!isSearching" class="column project-list">
        <div class="column-header">
          <h3>项目 ({{ groupedSessions.length }})</h3>
        </div>
        <div class="column-content">
          <div
            v-for="group in groupedSessions"
            :key="group.projectPath"
            :class="['project-item', { active: selectedProjectPath === group.projectPath }]"
            @click="selectProject(group.projectPath)"
          >
            <div class="project-name">
              <el-icon><Folder /></el-icon>
              <span>{{ getProjectName(group.projectPath) }}</span>
            </div>
            <div class="project-stats">
              <el-tag size="small">{{ group.sessions.length }} 会话</el-tag>
              <el-tag size="small" type="info">{{ group.totalMessages }} 消息</el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 中栏：会话列表 / 搜索结果 -->
      <div class="column session-list">
        <div class="column-header">
          <h3>
            {{ isSearching ? `搜索结果 (${searchResults.length})` : (selectedProjectPath ? getProjectName(selectedProjectPath) : '选择项目') }}
            <span v-if="!isSearching && currentSessions.length > 0" class="count">({{ currentSessions.length }})</span>
          </h3>
        </div>
        <div class="column-content">
          <!-- 搜索结果 -->
          <template v-if="isSearching">
            <el-empty v-if="searchResults.length === 0" description="未找到匹配的会话" :image-size="80" />
            <div
              v-for="session in searchResults"
              :key="session.sessionId"
              :class="['session-item', { active: selectedSessionId === session.sessionId }]"
              @click="selectSession(session.sessionId)"
            >
              <div class="session-header">
                <span class="session-project">{{ getProjectName(session.projectPath) }}</span>
                <el-tag size="small">{{ session.messageCount }} 匹配</el-tag>
              </div>
              <div class="session-preview">{{ truncate(session.firstPrompt, 100) }}</div>
            </div>
          </template>
          <!-- 正常会话列表 -->
          <template v-else>
            <el-empty v-if="currentSessions.length === 0" description="请选择项目查看会话" :image-size="80" />
            <div
              v-for="session in currentSessions"
              :key="session.sessionId"
              :class="['session-item', { active: selectedSessionId === session.sessionId }]"
              @click="selectSession(session.sessionId)"
            >
              <div class="session-header">
                <span class="session-time">{{ formatTime(session.modified) }}</span>
                <el-tag size="small">{{ session.messageCount }} 条消息</el-tag>
              </div>
              <div class="session-preview">{{ truncate(session.firstPrompt, 100) }}</div>
            </div>
          </template>
        </div>
      </div>

      <!-- 右栏：对话内容 -->
      <div class="column conversation-view">
        <div class="column-header">
          <h3>对话内容</h3>
        </div>
        <div class="column-content">
          <el-empty v-if="!selectedSessionId || currentMessages.length === 0" description="选择会话查看对话" :image-size="80" />
          <div v-else class="messages">
            <div
              v-for="(msg, index) in currentMessages"
              :key="index"
              :class="['message', `message-${msg.type}`]"
            >
              <div class="message-header">
                <el-tag :type="getMessageType(msg.type)" size="small">
                  {{ getMessageLabel(msg.type) }}
                </el-tag>
                <span class="timestamp">{{ formatFullTime(msg.timestamp) }}</span>
              </div>
              <div v-if="msg.content" class="message-content">
                {{ msg.content }}
              </div>
              <div v-if="msg.tool_name" class="tool-call">
                <el-tag type="warning" size="small">工具调用: {{ msg.tool_name }}</el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

import { ref, computed, onMounted, watch } from 'vue';
import { Search, Folder } from '@element-plus/icons-vue';
import { useSessionStore } from '@/stores/session';
import { searchApi } from '@/api';
import type { SessionIndexEntry, SessionMessage, SearchResult } from '@/types';

const sessionStore = useSessionStore();
const searchQuery = ref('');
const selectedProjectPath = ref('');
const selectedSessionId = ref('');
const isSearching = ref(false);
const searchResults = ref<SessionIndexEntry[]>([]);

// 按项目分组的会话（显示所有项目，包括没有会话的）
const groupedSessions = computed(() => {
  const groups = new Map<string, { projectPath: string; sessions: SessionIndexEntry[]; totalMessages: number }>();

  // 先从会话中提取有会话的项目
  sessionStore.sessions.forEach(session => {
    if (!groups.has(session.projectPath)) {
      groups.set(session.projectPath, {
        projectPath: session.projectPath,
        sessions: [],
        totalMessages: 0,
      });
    }
    const group = groups.get(session.projectPath)!;
    group.sessions.push(session);
    group.totalMessages += session.messageCount;
  });

  // 添加没有会话的项目（从 stats 中获取）
  if (sessionStore.stats?.projectStats) {
    sessionStore.stats.projectStats.forEach((stat: any) => {
      if (!groups.has(stat.projectPath)) {
        groups.set(stat.projectPath, {
          projectPath: stat.projectPath,
          sessions: [],
          totalMessages: 0,
        });
      }
    });
  }

  // 按会话数量排序
  return Array.from(groups.values()).sort((a, b) => b.sessions.length - a.sessions.length);
});

// 当前选中项目的会话列表（按时间排序）
const currentSessions = computed(() => {
  if (!selectedProjectPath.value) return [];
  const group = groupedSessions.value.find(g => g.projectPath === selectedProjectPath.value);
  if (!group) return [];
  // 按修改时间排序
  return [...group.sessions].sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
});

// 当前选中会话的消息（只显示有内容的消息）
const currentMessages = computed(() => {
  return sessionStore.currentSession.filter(msg => {
    const content = msg.content?.trim();
    return content && content.length > 0;
  });
});

// 获取项目名称
function getProjectName(path: string): string {
  if (path.startsWith('/')) {
    const parts = path.split('/');
    return parts[parts.length - 1];
  }
  // 对于其他格式，直接返回
  return path;
}

// 截断文本
function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// 格式化时间
function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days} 天前`;
  return date.toLocaleDateString('zh-CN');
}

function formatFullTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('zh-CN');
}

function getMessageType(type: string): string {
  const map: Record<string, string> = {
    user: 'primary',
    assistant: 'success',
    tool_use: 'warning',
    tool_result: 'info',
  };
  return map[type] || 'info';
}

function getMessageLabel(type: string): string {
  const map: Record<string, string> = {
    user: '用户',
    assistant: '助手',
    tool_use: '工具调用',
    tool_result: '工具结果',
  };
  return map[type] || type;
}

// 选择项目
async function selectProject(projectPath: string) {
  selectedProjectPath.value = projectPath;
  selectedSessionId.value = '';
  sessionStore.currentSession = [];
}

// 选择会话
async function selectSession(sessionId: string) {
  selectedSessionId.value = sessionId;
  await sessionStore.fetchSessionById(sessionId);
}

// 搜索处理
async function handleSearch() {
  if (!searchQuery.value.trim()) {
    isSearching.value = false;
    searchResults.value = [];
    return;
  }

  isSearching.value = true;
  try {
    const results = await searchApi.search(searchQuery.value);
    // 将搜索结果转换为 SessionIndexEntry 格式以复用现有 UI
    searchResults.value = results.map(r => ({
      sessionId: r.sessionId,
      fullPath: '', // 搜索结果没有 fullPath
      fileMtime: Date.now(),
      firstPrompt: r.firstPrompt,
      messageCount: r.matchedMessages.length,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      gitBranch: '',
      projectPath: r.projectPath,
      isSidechain: false,
    }));
  } catch (error) {
    console.error('搜索失败:', error);
  }
}

// 监听选中项目变化，清空选中会话
watch(selectedProjectPath, () => {
  selectedSessionId.value = '';
  sessionStore.currentSession = [];
});

onMounted(async () => {
  // 同时加载会话和统计数据
  await Promise.all([
    sessionStore.fetchSessions(),
    sessionStore.fetchStats(),
  ]);
});
</script>

<style scoped>
.sessions-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 搜索区域 */
.search-section {
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #fff;
}

.search-section :deep(.el-input__wrapper) {
  border-radius: 20px;
}

/* 三栏布局 */
.three-column-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 280px 320px 1fr;
  gap: 1px;
  background: #e4e7ed;
  overflow: hidden;
}

/* 搜索模式：只显示两栏 */
.three-column-layout.search-mode {
  grid-template-columns: 320px 1fr;
}

.column {
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.column-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #f5f7fa;
}

.column-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.column-header .count {
  color: #909399;
  font-weight: 400;
}

.column-content {
  flex: 1;
  overflow-y: auto;
}

/* 项目列表 */
.project-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s;
}

.project-item:hover {
  background: #f5f7fa;
}

.project-item.active {
  background: #e6f4ff;
  border-left: 3px solid #409eff;
}

.project-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 500;
  color: #303133;
}

.project-stats {
  display: flex;
  gap: 6px;
}

/* 会话列表 */
.session-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s;
}

.session-item:hover {
  background: #f5f7fa;
}

.session-item.active {
  background: #e6f4ff;
  border-left: 3px solid #409eff;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.session-time {
  font-size: 12px;
  color: #909399;
}

.session-project {
  font-size: 12px;
  color: #409eff;
  font-weight: 500;
}

.session-preview {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 对话内容 */
.messages {
  padding: 16px;
}

.message {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #f5f7fa;
}

.message-user {
  background: #e3f2fd;
  margin-left: 20px;
}

.message-assistant {
  background: #f1f8e9;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.timestamp {
  font-size: 11px;
  color: #909399;
}

.message-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  font-size: 14px;
}

.tool-call {
  margin-top: 8px;
}

/* 滚动条样式 */
.column-content::-webkit-scrollbar {
  width: 6px;
}

.column-content::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.column-content::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}
</style>
