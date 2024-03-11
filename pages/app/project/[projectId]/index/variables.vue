<script setup lang="ts">
import type { VariablesCreateInput } from "~/types/Variables";

const { projectId } = useRoute().params
const variablesToCreate = ref(0)
const variablesInput = ref<VariablesCreateInput>({
  projectId: parseInt(projectId as string),
  variables: [],
})

const { data: variables, status } = useFetch(`/api/variable/project/${projectId}`, {
  method: "GET",
  watch: false,
})

const { data, status: createStatus, error } = useFetch(`/api/variable/`, {
  method: "POST",
  body: {
    projectId,
    variables: variablesInput.value,
  },
  watch: false,
  immediate: false,
})
</script>

<template>
  <div class="mt-6">
    <div />
    <div v-if="status !== 'pending'" class="flex flex-col gap-4">
      <div v-for="variable in variables" :key="variable.id">
        <ProjectVariableItem :variable />
      </div>
    </div>
    <div v-else class="flex flex-col gap-4">
      <div v-for="variable in 5" :key="variable">
        <USkeleton class="h-16 w-full" />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
