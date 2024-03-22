<script setup lang="ts">
import { Role, TeamRole } from "@shelve/types";

const open = defineModel({ type: Boolean });

const user = useCurrentUser();

const newMember = ref({
  email: "",
  role: TeamRole.DEVELOPER,
});

const roles = [
  {
    label: "Developer",
    value: TeamRole.DEVELOPER,
  },
  {
    label: "Admin",
    value: TeamRole.ADMIN,
    disabled: user.value?.role !== Role.ADMIN,
  },
];
</script>

<template>
  <div>
    <UModal
      v-model="open"
      :ui="{
        width: 'sm:max-w-sm',
      }"
    >
      <form>
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold leading-7">
              Add member
            </h2>
          </template>
          <div class="flex flex-col gap-4">
            <UInput v-model="newMember.email" label="Email" placeholder="Email" />
            <USelect
              v-model="newMember.role"
              label="Role"
              :options="roles"
              value-attribute="value"
              option-attribute="label"
            />
          </div>
          <template #footer>
            <div class="flex justify-end gap-4">
              <UButton color="gray" label="Cancel" @click="() => open = false" />
              <UButton label="Add member" type="submit" />
            </div>
          </template>
        </UCard>
      </form>
    </UModal>
  </div>
</template>

<style scoped>

</style>
