<script setup lang="ts">
import type { Project } from "@shelve/types";
import type { Ref } from "vue";

const { projectId } = useRoute().params;

const project = inject("project") as Ref<Project>;
const status = inject("status") as Ref<string>;

const { status: updateStatus, error: updateError, execute } = useFetch(`/api/project/${projectId}`, {
  method: "PUT",
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
              Project Settings
            </h2>
            <p class="text-pretty text-sm text-neutral-500 dark:text-neutral-400">
              Configure your project settings, quick links, environment variables prefix, etc...
            </p>
          </div>
        </div>
      </template>
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-4">
          <div>
            <h3 class="font-semibold">
              Quick Links
            </h3>
            <p class="text-pretty text-xs text-neutral-500 dark:text-neutral-400">
              Add quick links to your project repository, homepage, etc...
            </p>
          </div>
          <div class="my-2 flex flex-col gap-4">
            <div>
              <USkeleton v-if="status === 'pending'" class="h-8" />
              <FormGroup v-else v-model="project.repository" label="Repository" class="w-2/3" />
            </div>
            <div>
              <USkeleton v-if="status === 'pending'" class="h-8" />
              <FormGroup v-else v-model="project.projectManager" label="Project Manager" class="w-2/3" />
            </div>
            <div>
              <USkeleton v-if="status === 'pending'" class="h-8" />
              <FormGroup v-else v-model="project.homepage" label="Homepage" class="w-2/3" />
            </div>
          </div>
        </div>
        <UDivider class="my-2" />
        <div class="flex flex-col gap-4">
          <div>
            <h3 class="font-semibold">
              Environment Variables Prefix
            </h3>
            <p class="text-pretty text-xs text-neutral-500 dark:text-neutral-400">
              Add a prefix to your environment variables
            </p>
          </div>
          <div class="my-2 flex flex-col gap-4">
            <div>
              <USkeleton v-if="status === 'pending'" class="h-8" />
              <FormGroup v-else v-model="project.variablePrefix" type="textarea" label="Prefix" class="w-2/3" />
              <UTooltip text="Yes this will be improved in the future 😅">
                <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Write your prefix separated by a comma, for example: <code>NUXT_PUBLIC_, REACT_APP_</code>
                </p>
              </UTooltip>
            </div>
          </div>
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
