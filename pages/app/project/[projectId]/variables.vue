<script setup lang="ts">
const { projectId } = useRoute().params

const { data: variables, status } = useFetch(`/api/variable/project/${projectId}`, {
  method: "GET",
  watch: false,
})
</script>

<template>
  <div class="mt-6">
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
