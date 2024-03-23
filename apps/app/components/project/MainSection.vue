<script setup lang="ts">
import type { Project } from "@shelve/types";
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
const { projectId } = useRoute().params;
const user = useCurrentUser();

const { status: updateStatus, error: updateError, execute } = useFetch(`/api/project/${projectId}`, {
  method: "PUT",
  body: project,
  watch: false,
  immediate: false,
})

const { status: deleteStatus, error: deleteError, execute: deleteExecute } = useFetch(`/api/project/${projectId}`, {
  method: "DELETE",
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
  if (project.value.ownerId !== user.value?.id) {
    toast.error("You are not the owner of this project");
    return;
  }
  await deleteExecute();
  if (deleteError.value) toast.error("An error occurred");
  else toast.success("Your project has been deleted");
  showDelete.value = false
  navigateTo("/app/projects");
}

const items = [
  [
    {
      label: "Edit project",
      icon: "i-lucide-pen-line",
      click: () => showEdit.value = !showEdit.value
    },
    {
      label: "Export project data",
      icon: "i-lucide-download",
      click: () => {
        const data = JSON.stringify(project.value, null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${project.value.name}.json`;
        a.click();
      }
    },
    {
      label: "Delete project",
      icon: "i-lucide-trash",
      iconClass: "text-red-500 dark:text-red-500",
      click: () => showDelete.value = !showDelete.value
    }
  ]
];

const projectManager = [
  {
    label: "Linear",
    value: "linear",
    icon: "i-custom-linear",
  },
  {
    label: "Volta",
    value: "volta",
    icon: "i-custom-volta",
  },
]

function getProjectManager(manager: string) {
  if (!manager) return;
  return projectManager.find((item) => manager.includes(item.value))
}
</script>

<template>
  <div>
    <div v-if="!loading">
      <div class="flex items-start justify-between gap-4">
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
        <UDropdown v-if="project.ownerId === user?.id" :items="items">
          <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
        </UDropdown>
      </div>
      <div v-if="project.projectManager || project.repository || project.homepage" class="mt-6 flex flex-wrap gap-4 sm:flex-row sm:items-center">
        <NuxtLink v-if="project.projectManager" target="_blank" :to="project.projectManager">
          <UButton
            color="gray"
            :icon="getProjectManager(project.projectManager)?.icon"
            :label="`Open ${getProjectManager(project.projectManager)?.label}`"
          />
        </NuxtLink>
        <NuxtLink v-if="project.repository" target="_blank" :to="project.repository">
          <UButton
            color="gray"
            icon="i-custom-github"
            label="Open repository"
          />
        </NuxtLink>
        <NuxtLink v-if="project.homepage" target="_blank" :to="project.homepage">
          <UButton
            color="gray"
            icon="i-heroicons-home"
            label="Open homepage"
          />
        </NuxtLink>
      </div>
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
          <FormGroup v-model="projectName" :label="`Type the project name '${project.name}' to confirm`" />
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
