<script setup lang="ts">
import type { Session } from "@shelve/types";
import type { PropType } from "vue";

const props = defineProps({
  session: {
    type: Object as PropType<Session>,
    required: true,
  },
});

const { status, error, execute } = await useFetch(`/api/user/session/${props.session.id}`, {
  method: "DELETE",
  watch: false,
  immediate: false,
})

const emit = defineEmits(["refresh"]);
async function logoutSession() {
  await execute()
  if (error.value) toast.error("An error occurred")
  else {
    toast.success("You have been logged out from this device")
    emit("refresh")
  }
}
</script>

<template>
  <UCard class="h-full">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Status :active="session.current" active-text="This device" inactive-text="Other device" />
        <div class="flex flex-col gap-1">
          <h3 class="flex flex-col text-lg font-semibold">
            {{ session.device }}
          </h3>
          <div class="text-xs font-normal text-gray-500">
            <span>
              Last login: {{ new Date(session.updatedAt).toLocaleString() }}
            </span>
          </div>
        </div>
      </div>
      <UButton v-if="!session.current" color="gray" variant="ghost" :loading="status === 'pending'" @click="logoutSession">
        Logout
      </UButton>
    </div>
  </UCard>
</template>

<style scoped>

</style>
