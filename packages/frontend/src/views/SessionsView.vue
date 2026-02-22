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
    <div class="view-header">
      <div class="header-left">
        <h2>会话列表</h2>
        <ProjectFilter
          v-model="selectedProject"
          :projects="sessionStore.projects"
          @change="handleProjectChange"
        />
      </div>
      <el-button type="primary" :icon="Refresh" @click="refresh">刷新</el-button>
    </div>

    <SearchBar @search="handleSearch" />

    <el-empty v-if="filteredSessionsList.length === 0 && !sessionStore.loading" description="暂无会话" />

    <el-loading :active="sessionStore.loading" />

    <div v-if="filteredSessionsList.length > 0" class="sessions-grid">
      <SessionCard
        v-for="session in filteredSessionsList"
        :key="session.sessionId"
        :session="session"
      />
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

import { ref, computed, onMounted } from 'vue';
import { Refresh } from '@element-plus/icons-vue';
import { useSessionStore } from '@/stores/session';
import SessionCard from '@/components/SessionCard.vue';
import SearchBar from '@/components/SearchBar.vue';
import ProjectFilter from '@/components/ProjectFilter.vue';
import { ElMessage } from 'element-plus';

const sessionStore = useSessionStore();
const selectedProject = ref('');

const filteredSessionsList = computed(() => {
  return sessionStore.filteredSessions(selectedProject.value);
});

async function refresh() {
  await Promise.all([
    sessionStore.fetchSessions(),
    sessionStore.fetchProjects(),
  ]);
  ElMessage.success('刷新成功');
}

function handleProjectChange(projectPath: string) {
  selectedProject.value = projectPath;
}

function handleSearch(query: string) {
  sessionStore.search(query, {
    projectPath: selectedProject.value || undefined,
  });
  // TODO: 显示搜索结果视图
  ElMessage.success(`搜索: ${query}`);
}

onMounted(async () => {
  await refresh();
});
</script>

<style scoped>
.sessions-view {
  padding: 20px;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.sessions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}
</style>
