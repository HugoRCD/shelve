<script setup lang="ts">
import Variable from "~/components/Variable.vue";

const route = useRoute()
const showEdit = ref(false)

const { data: project, status, error, refresh } = useFetch(`/api/project/${route.params.id}`, {
  method: "GET",
  watch: false,
})

const { status: updateStatus, error: updateError, execute } = useFetch("/api/project", {
  method: "POST",
  body: project,
  watch: false,
  immediate: false,
})

async function updateCurrentProject() {
  await execute();
  if (error.value) toast.error("An error occurred");
  else toast.success("Your project has been updated");
  showEdit.value = false
}

const items = [
    [
      {
        label: "Copy .env",
        icon: "i-lucide-clipboard",
        click: () => {
          navigator.clipboard.writeText(project.value!.variables.map(v => `${v.key}=${v.value}`).join("\n"))
          toast.success("Copied to clipboard")
        }
      }
    ],
  [
    {
      label: "Edit",
      icon: "i-lucide-pen-line",
      click: () => showEdit.value = !showEdit.value
    },
    {
      label: "Delete",
      icon: "i-lucide-trash",
      iconClass: "text-red-500 dark:text-red-500",
    }
  ]
];
</script>

<template>
  <div class="mx-auto max-w-2xl py-6 sm:px-6 lg:px-8">
    <div class="mb-8 flex cursor-pointer items-center text-sm text-gray-500 hover:text-gray-400">
      <UIcon
        name="i-heroicons-chevron-left-20-solid"
        class="size-4"
      />
      <NuxtLink to="/app/dashboard">
        Back to projects
      </NuxtLink>
    </div>
    <div v-if="status !== 'pending'" class="flex flex-col">
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-4">
          <UAvatar :src="project.avatar" size="xl" />
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
                  <UAvatar :src="project.avatar" size="xl" />
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
      <UDivider class="my-6" />
      <div class="flex flex-col gap-4">
        <div v-for="variable in project.variables" :key="variable.id">
          <Variable :variable="variable" />
        </div>
      </div>
    </div>
    <div v-else class="flex flex-col">
      <div class="flex items-start justify-between gap-4">
        <div class="flex w-full items-start gap-4">
          <div>
            <USkeleton class="size-16 rounded-full" />
          </div>
          <div class="w-full space-y-2">
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-[25%]" />
          </div>
        </div>
      </div>
      <UDivider class="my-6" />
      <div class="flex flex-col gap-4">
        <div v-for="variable in 5" :key="variable">
          <USkeleton class="h-16 w-full" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
