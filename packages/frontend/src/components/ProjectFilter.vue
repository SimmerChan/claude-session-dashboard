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
  <div class="project-filter">
    <el-select
      v-model="selectedProject"
      placeholder="全部项目"
      clearable
      @change="handleChange"
    >
      <el-option label="全部项目" value="" />
      <el-option
        v-for="project in projects"
        :key="project"
        :label="project"
        :value="project"
      />
    </el-select>
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

import { ref, watch } from 'vue';

const props = defineProps<{
  projects: string[];
  modelValue?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
}>();

const selectedProject = ref(props.modelValue || '');

watch(() => props.modelValue, (newValue) => {
  selectedProject.value = newValue || '';
});

function handleChange(value: string) {
  emit('update:modelValue', value);
  emit('change', value);
}
</script>

<style scoped>
.project-filter {
  display: inline-block;
}
</style>
