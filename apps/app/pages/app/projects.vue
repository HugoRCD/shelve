<script setup lang="ts">
import { isMounted } from "~/composables/useDOM";

const { data: projects, status, refresh } = useFetch("/api/project", {
  method: "GET",
  watch: false,
});

const projectCreateInput = ref({
  name: "",
  description: "",
  avatar: "",
})
const createModal = ref(false)

const { status: createStatus, error: createError, execute } = useFetch("/api/project", {
  method: "POST",
  body: projectCreateInput,
  watch: false,
  immediate: false,
})

async function createProject() {
  await execute()
  if (createError.value) toast.error("An error occurred")
  else {
    toast.success("Your project has been created")
    createModal.value = false
    await refresh()
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-end">
      <Teleport v-if="isMounted('action-items')" to="#action-items">
        <div class="flex gap-4">
          <UButton
            size="xs"
            icon="i-heroicons-plus-20-solid"
            :loading="createStatus === 'pending'"
            label="Add project"
            @click="createModal = true"
          />
        </div>
      </Teleport>
      <UModal v-model="createModal" @close="createModal = false">
        <UCard class="p-2">
          <form class="flex flex-col gap-4" @submit.prevent="createProject">
            <FormGroup v-model="projectCreateInput.name" label="Project name" />
            <FormGroup v-model="projectCreateInput.description" label="Description" type="textarea" />
            <div class="flex items-center gap-4">
              <UAvatar :src="projectCreateInput.avatar" size="xl" :alt="projectCreateInput.name" />
              <FormGroup v-model="projectCreateInput.avatar" label="Avatar" class="w-full" />
            </div>
            <div class="flex justify-end gap-4">
              <UButton color="gray" variant="ghost" @click="createModal = false">
                Cancel
              </UButton>
              <UButton color="primary" form="envForm" type="submit" trailing :loading="createStatus === 'pending'">
                Save
              </UButton>
            </div>
          </form>
        </UCard>
      </UModal>
    </div>
    <div v-if="status !== 'pending'" class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <NuxtLink
        v-for="project in projects"
        :key="project.id"
        :to="`/app/project/${project.id}`"
      >
        <UCard class="h-full">
          <div class="flex w-full items-start gap-4">
            <UAvatar
              :src="project.avatar"
              :alt="project.name"
              size="sm"
              img-class="object-cover"
            />
            <div class="flex flex-col gap-1">
              <h3 class="flex flex-col text-lg font-semibold">
                {{ project.name }}
              </h3>
              <div class="text-xs font-normal text-gray-500">
                {{ project.description }}
              </div>
            </div>
          </div>
        </UCard>
      </NuxtLink>
    </div>
    <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <USkeleton v-for="i in 4" :key="i" class="h-32" />
    </div>
  </div>
</template>

<style scoped>

</style>
