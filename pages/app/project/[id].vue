<script setup lang="ts">
const route = useRoute()
const projectId = route.params.id

const { data: project, status } = useFetch(`/api/project/${projectId}`, {
  method: "GET",
  watch: false,
})

const tabs = [
  {
    slot: "variables",
    label: "Environment Variables",
  },
  {
    slot: "Users",
    label: "Users",
  },
];
</script>

<template>
  <div class="flex flex-col">
    <ProjectMainSection :project="project" :loading="status === 'pending'" />
    <UDivider class="my-6" />
    <UTabs :items="tabs">
      <template #variables>
        <ProjectVariables v-if="project" :project-id />
      </template>
    </UTabs>
  </div>
</template>

<style scoped>

</style>
