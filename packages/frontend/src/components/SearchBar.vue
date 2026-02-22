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
  <div class="search-bar">
    <el-input
      v-model="searchQuery"
      placeholder="搜索会话内容..."
      :prefix-icon="Search"
      clearable
      @keyup.enter="handleSearch"
    >
      <template #append>
        <el-button :icon="Search" @click="handleSearch">搜索</el-button>
      </template>
    </el-input>
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

import { ref } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { useSessionStore } from '@/stores/session';

const emit = defineEmits<{
  (e: 'search', query: string): void;
}>();

const sessionStore = useSessionStore();
const searchQuery = ref('');

function handleSearch() {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value.trim());
  }
}
</script>

<style scoped>
.search-bar {
  max-width: 600px;
  margin: 0 auto 20px;
}
</style>
