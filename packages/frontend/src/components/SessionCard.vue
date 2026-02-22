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
limitations under the License.
-->

<template>
  <el-card class="session-card" shadow="hover" @click="handleClick">
    <div class="session-header">
      <el-tag size="small" type="info">{{ session.projectPath }}</el-tag>
      <el-tag v-if="session.isSidechain" size="small" type="warning">Sidechain</el-tag>
    </div>
    <div class="session-title">
      {{ truncatedPrompt }}
    </div>
    <div class="session-meta">
      <div class="meta-item">
        <el-icon><ChatDotRound /></el-icon>
        <span>{{ session.messageCount }} 消息</span>
      </div>
      <div class="meta-item">
        <el-icon><Clock /></el-icon>
        <span>{{ formatDate(session.modified) }}</span>
      </div>
      <div v-if="session.gitBranch" class="meta-item">
        <el-icon><FolderOpened /></el-icon>
        <span>{{ session.gitBranch }}</span>
      </div>
    </div>
  </el-card>
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

import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { SessionIndexEntry } from '@/types';

const props = defineProps<{
  session: SessionIndexEntry;
}>();

const router = useRouter();

const truncatedPrompt = computed(() => {
  const maxLength = 100;
  if (props.session.firstPrompt.length <= maxLength) {
    return props.session.firstPrompt;
  }
  return props.session.firstPrompt.substring(0, maxLength) + '...';
});

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 7) return `${diffDays} 天前`;
  return date.toLocaleDateString('zh-CN');
}

function handleClick() {
  router.push({ name: 'session-detail', params: { id: props.session.sessionId } });
}
</script>

<style scoped>
.session-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.session-card:hover {
  transform: translateY(-2px);
}

.session-header {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.session-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.session-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.meta-item .el-icon {
  font-size: 14px;
}
</style>
