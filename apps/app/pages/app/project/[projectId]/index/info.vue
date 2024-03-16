<script setup lang="ts">
import type { Project } from "@shelve/types";
import type { Ref } from "vue";

const project = inject("project") as Ref<Project>;
const status = inject("status") as Ref<string>;

const { status: updateStatus, error: updateError, execute } = useFetch("/api/project", {
  method: "POST",
  body: project,
  watch: false,
  immediate: false,
})

async function updateCurrentProject() {
  await execute();
  if (updateError.value) toast.error("An error occurred");
  else toast.success("Your project has been updated");
}
</script>

<template>
  <form class="mt-6 flex flex-col gap-4" @submit.prevent="updateCurrentProject">
    <UCard :ui="{ background: 'bg-white dark:bg-neutral-950' }">
      <template #header>
        <div class="flex items-center">
          <div class="flex flex-col">
            <h2 class="text-lg font-semibold">
              Project Info
            </h2>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              General information about the project
            </p>
          </div>
        </div>
      </template>
      <div class="grid grid-cols-6 gap-x-4 gap-y-6">
        <div class="sm:col-span-3">
          <USkeleton v-if="status === 'pending'" class="h-8" />
          <FormGroup v-else v-model="project.repository" label="Repository" />
        </div>
        <div class="sm:col-span-3">
          <USkeleton v-if="status === 'pending'" class="h-8" />
          <FormGroup v-else v-model="project.projectManager" label="Project Manager" />
        </div>
        <div class="sm:col-span-3">
          <USkeleton v-if="status === 'pending'" class="h-8" />
          <FormGroup v-else v-model="project.homepage" label="Homepage" />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-4">
          <UButton color="primary" type="submit" :loading="updateStatus === 'pending'">
            Save
          </UButton>
        </div>
      </template>
    </UCard>
  </form>
</template>

<style scoped>

</style>
