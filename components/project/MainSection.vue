<script setup lang="ts">
import type { Project } from "~/types/Project";
import type { PropType, Ref } from "vue";

const props = defineProps({
  project: {
    type: Object as PropType<Project>,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const showEdit = ref(false);
const showDelete = ref(false);
const projectName = ref("");
const project = toRef(props, "project") as Ref<Project>;
const projectId = () => props.project!.id;

const { status: updateStatus, error: updateError, execute } = useFetch("/api/project", {
  method: "POST",
  body: project,
  watch: false,
  immediate: false,
})

const { status: deleteStatus, error: deleteError, execute: deleteExecute } = useFetch(`/api/project/${projectId}`, {
  method: "DELETE",
  body: project,
  watch: false,
  immediate: false,
})

async function updateCurrentProject() {
  await execute();
  if (updateError.value) toast.error("An error occurred");
  else toast.success("Your project has been updated");
  showEdit.value = false
}

async function deleteProject() {
  await deleteExecute();
  if (deleteError.value) toast.error("An error occurred");
  else toast.success("Your project has been deleted");
  showDelete.value = false
  navigateTo("/app/projects")
}

const items = [
  [
    {
      label: "Edit project",
      icon: "i-lucide-pen-line",
      click: () => showEdit.value = !showEdit.value
    },
    {
      label: "Delete project",
      icon: "i-lucide-trash",
      iconClass: "text-red-500 dark:text-red-500",
      click: () => showDelete.value = !showDelete.value
    }
  ]
];
</script>

<template>
  <div>
    <div v-if="!loading" class="flex items-start justify-between gap-4">
      <div class="flex items-start gap-4">
        <UAvatar :src="project.avatar" size="xl" :alt="project.name" />
        <div>
          <h2 class="text-base font-semibold leading-7">
            {{ project.name }}
          </h2>
          <p class="text-sm leading-6 text-gray-500">
            {{ project.description }}
          </p>
        </div>
        <UModal v-model="showEdit">
          <UCard class="p-2">
            <form class="flex flex-col gap-4" @submit.prevent="updateCurrentProject">
              <FormGroup v-model="project.name" label="Name" />
              <FormGroup v-model="project.description" label="Description" type="textarea" />
              <div class="flex items-center gap-4">
                <UAvatar :src="project.avatar" size="xl" :alt="project.name" />
                <FormGroup v-model="project.avatar" label="Avatar" class="w-full" />
              </div>
              <div class="flex justify-end gap-4">
                <UButton color="gray" variant="ghost" @click="showEdit = false">
                  Cancel
                </UButton>
                <UButton color="primary" type="submit" trailing :loading="updateStatus === 'pending'">
                  Save
                </UButton>
              </div>
            </form>
          </UCard>
        </UModal>
      </div>
      <UDropdown :items="items">
        <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
      </UDropdown>
    </div>
    <div v-else class="flex items-start justify-between gap-4">
      <div class="flex w-full items-start gap-4">
        <div>
          <USkeleton class="size-14 rounded-full" />
        </div>
        <div class="w-full space-y-2">
          <USkeleton class="h-4 w-[55%]" />
          <USkeleton class="h-4 w-[75%]" />
          <USkeleton class="h-4 w-[25%]" />
        </div>
      </div>
    </div>
    <UModal v-model="showDelete">
      <UCard class="p-2">
        <form class="flex flex-col gap-6" @submit.prevent="deleteProject">
          <div>
            <h2 class="text-lg font-semibold leading-7">
              Are you sure you want to delete this project?
            </h2>
            <p class="text-sm leading-6 text-gray-500">
              This action cannot be undone.
            </p>
          </div>
          <FormGroup v-model="projectName" label="Type the project name to confirm" />
          <div class="flex justify-end gap-4">
            <UButton color="gray" variant="ghost" @click="showDelete = false">
              Cancel
            </UButton>
            <UButton color="red" type="submit" trailing :loading="deleteStatus === 'pending'" :disabled="projectName !== project.name">
              Delete
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<style scoped>

</style>
