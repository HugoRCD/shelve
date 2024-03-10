<script setup lang="ts">
import Variable from "~/components/Variable.vue";

const route = useRoute()

const { data: project, status, error, refresh } = useFetch(`/api/project/${route.params.id}`, {
  method: "GET",
  watch: false,
})

const { status: updateStatus, error: updateError, execute } = useFetch("/api/user", {
  method: "PUT",
  body: project,
  watch: false,
  immediate: false,
})

async function updateCurrentProject() {
  await execute();
  if (error.value) toast.error("An error occurred");
  else toast.success("Your project has been updated");
}
</script>

<template>
  <div class="mx-auto max-w-2xl py-6 sm:px-6 lg:px-8">
    <form v-if="status !== 'pending'" class="flex flex-col" @submit.prevent="updateCurrentProject">
      <div class="flex items-center gap-4">
        <NuxtImg :src="project.avatar" class="size-10 rounded-full" />
        <div>
          <h2 class="text-base font-semibold leading-7">
            {{ project.name }}
          </h2>
          <p class="text-sm leading-6 text-gray-500">
            {{ project.description }}
          </p>
        </div>
      </div>
      <div v-for="variable in project.variables" :key="variable.id" class="mt-6">
        <Variable :variable="variable" />
      </div>
    </form>
  </div>
</template>

<style scoped>

</style>
