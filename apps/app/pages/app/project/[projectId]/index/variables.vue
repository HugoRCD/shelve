<script setup lang="ts">
import type { Variable } from '@shelve/types'

const { projectId } = useRoute().params

const { data: variables, status, refresh } = useFetch<Variable[]>(`/api/variable/project/${projectId}`, {
  method: 'GET',
  watch: false,
})
</script>

<template>
  <div class="mt-6 flex flex-col gap-4">
    <ProjectCreateVariables :variables :project-id :refresh />
    <div v-if="status !== 'pending'" class="flex flex-col gap-4">
      <div v-for="variable in variables" :key="variable.id">
        <ProjectVariableItem :variables :project-id :variable :refresh />
      </div>
    </div>
    <div v-else class="flex flex-col gap-4">
      <div v-for="variable in 5" :key="variable">
        <UCard class="h-16">
          <div class="space-y-2">
            <USkeleton class="h-4 w-2/4" />
            <USkeleton class="h-4 w-1/4" />
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
