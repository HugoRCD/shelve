<script setup lang="ts">
const { data: projects, status, error, refresh } = useFetch("/api/project", {
  method: "GET",
  watch: false,
})
</script>

<template>
  <div class="flex h-full flex-col justify-center gap-3 p-5">
    <div class="flex h-full flex-col">
      <h2 class="font-newsreader text-3xl font-light italic">
        Your projects
      </h2>
      <div v-for="project in projects" :key="project.id" class="mt-4">
        <NuxtLink class="flex flex-col gap-2 rounded-md bg-white p-4 shadow-lg dark:bg-neutral-800 dark:text-white" :to="`/app/project/${project.id}`">
          <h3 class="font-newsreader text-xl font-light italic">
            {{ project.name }}
          </h3>
          <p class="font-newsreader text-lg font-light italic">
            {{ project.description }}
          </p>
        </NuxtLink>
      </div>
    </div>
    <LayoutFooter />
  </div>
</template>

<style scoped>

</style>
