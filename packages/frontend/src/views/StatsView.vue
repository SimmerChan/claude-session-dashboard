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
  <div class="stats-view">
    <div class="view-header">
      <h2>统计信息</h2>
      <el-button type="primary" :icon="Refresh" @click="refresh">刷新</el-button>
    </div>

    <el-loading :active="sessionStore.loading" />

    <div v-if="sessionStore.stats" class="stats-content">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-value">{{ sessionStore.stats.totalProjects }}</div>
            <div class="stat-label">项目总数</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-value">{{ sessionStore.stats.totalSessions }}</div>
            <div class="stat-label">会话总数</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-value">{{ sessionStore.stats.totalMessages }}</div>
            <div class="stat-label">消息总数</div>
          </el-card>
        </el-col>
      </el-row>

      <el-divider />

      <h3>项目详情</h3>
      <el-table :data="sessionStore.stats.projectStats" stripe>
        <el-table-column prop="projectPath" label="项目" />
        <el-table-column prop="sessionCount" label="会话数" width="120" />
        <el-table-column prop="messageCount" label="消息数" width="120" />
      </el-table>
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

import { onMounted } from 'vue';
import { Refresh } from '@element-plus/icons-vue';
import { useSessionStore } from '@/stores/session';
import { ElMessage } from 'element-plus';

const sessionStore = useSessionStore();

async function refresh() {
  await sessionStore.fetchStats();
  ElMessage.success('刷新成功');
}

onMounted(async () => {
  await refresh();
});
</script>

<style scoped>
.stats-view {
  padding: 20px;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.view-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.stats-content {
  max-width: 1200px;
}

.stat-card {
  text-align: center;
  padding: 20px;
}

.stat-value {
  font-size: 36px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 20px 0 16px 0;
}
</style>
