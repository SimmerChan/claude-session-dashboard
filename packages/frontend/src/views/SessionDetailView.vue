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
  <div class="session-detail-view">
    <div class="view-header">
      <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
      <h2>会话详情</h2>
    </div>

    <el-loading :active="sessionStore.loading" />

    <div v-if="sessionStore.currentSession.length > 0" class="messages">
      <div
        v-for="(message, index) in sessionStore.currentSession"
        :key="index"
        :class="['message', `message-${message.type}`]"
      >
        <div class="message-header">
          <span class="message-type">
            <el-icon>
              <User v-if="message.type === 'user'" />
              <ChatDotRound v-else-if="message.type === 'assistant'" />
              <Tools v-else />
            </el-icon>
            {{ getMessageTypeLabel(message.type) }}
          </span>
          <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        </div>
        <div v-if="message.content" class="message-content">
          {{ message.content }}
        </div>
        <div v-if="message.tool_name" class="message-tool">
          <strong>工具:</strong> {{ message.tool_name }}
          <el-collapse v-if="message.tool_input">
            <el-collapse-item title="输入参数">
              <pre>{{ JSON.stringify(message.tool_input, null, 2) }}</pre>
            </el-collapse-item>
          </el-collapse>
          <el-collapse v-if="message.tool_output">
            <el-collapse-item title="输出结果">
              <pre>{{ JSON.stringify(message.tool_output, null, 2) }}</pre>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </div>

    <el-empty v-else-if="!sessionStore.loading" description="暂无消息" />
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

import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ArrowLeft, User, ChatDotRound, Tools } from '@element-plus/icons-vue';
import { useSessionStore } from '@/stores/session';

const router = useRouter();
const route = useRoute();
const sessionStore = useSessionStore();

function goBack() {
  router.push({ name: 'sessions' });
}

function getMessageTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    user: '用户',
    assistant: '助手',
    tool_use: '工具调用',
    tool_result: '工具结果',
  };
  return labels[type] || type;
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString('zh-CN');
}

onMounted(async () => {
  const sessionId = route.params.id as string;
  if (sessionId) {
    await sessionStore.fetchSessionById(sessionId);
  }
});
</script>

<style scoped>
.session-detail-view {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.view-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  padding: 16px;
  border-radius: 8px;
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
}

.message-user {
  background-color: #ecf5ff;
  border-color: #d9ecff;
}

.message-assistant {
  background-color: #f4f4f5;
  border-color: #e4e7ed;
}

.message-tool_use,
.message-tool_result {
  background-color: #fef0f0;
  border-color: #fde2e2;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #909399;
}

.message-type {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.message-content {
  white-space: pre-wrap;
  word-break: break-word;
  color: #303133;
  line-height: 1.6;
}

.message-tool {
  margin-top: 8px;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
}

.message-tool pre {
  margin: 8px 0 0 0;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}
</style>
