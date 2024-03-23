<script setup lang="ts">
import { type Member, Role, TeamRole } from "@shelve/types";
import type { PropType } from "vue";

const { members, teamId } = defineProps({
  members: {
    type: Array as PropType<Member[]>,
  },
  teamId: {
    type: Number,
    required: true,
  },
});

const {
  fetchTeams,
  upsertMember,
  removeMember,
} = useTeams();

const user = useCurrentUser();

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

const newMember = ref({
  email: "",
  role: TeamRole.DEVELOPER,
});

const loadingMembers = ref(false);
async function upsert_member(teamId: number, email: string, role: TeamRole) {
  loadingMembers.value = true;
  await upsertMember(teamId, email, role);
  newMember.value.email = "";
  newMember.value.role = TeamRole.DEVELOPER;
  loadingMembers.value = false;
  await fetchTeams();
}

const loadingRemove = ref(false);
async function remove_member(teamId: number, memberId: number) {
  loadingRemove.value = true;
  await removeMember(teamId, memberId);
  loadingRemove.value = false;
  await fetchTeams();
}
</script>

<template>
  <UAvatarGroup
    :ui="{
      ring: 'ring-0'
    }"
  >
    <UPopover
      v-for="member in members"
      :key="member.id"
      :popper="{ arrow: true }"
    >
      <UAvatar
        :src="member.user.avatar"
        :alt="member.user.username"
        size="sm"
      />
      <template #panel>
        <UCard>
          <form @submit.prevent="upsert_member(teamId, member.user.email, member.role)">
            <div class="flex flex-col gap-2">
              <p class="flex gap-2 text-sm font-semibold leading-6">
                <span class="text-gray-200">{{ member.user.username }}</span>
                <span>({{ member.user.email }})</span>
              </p>
              <div v-if="user?.role === Role.ADMIN" class="flex gap-2">
                <USelect
                  v-model="member.role"
                  label="Role"
                  :options="roles"
                  value-attribute="value"
                  option-attribute="label"
                />
                <UButton label="Update" :loading="loadingMembers" type="submit" />
                <UButton color="red" variant="soft" label="Remove" :loading="loadingRemove" @click="remove_member(teamId, member.id)" />
              </div>
            </div>
          </form>
        </UCard>
      </template>
    </UPopover>
    <div>
      <UPopover :popper="{ arrow: true }">
        <span class="flex size-8 cursor-pointer items-center justify-center rounded-full border border-dashed border-gray-400">+</span>
        <template #panel>
          <UCard>
            <form @submit.prevent="upsert_member(teamId, newMember.email, newMember.role)">
              <div class="flex flex-col gap-2">
                <UInput v-model="newMember.email" label="Email" placeholder="Email" />
                <div class="flex gap-2">
                  <USelect
                    v-model="newMember.role"
                    label="Role"
                    :options="roles"
                    value-attribute="value"
                    option-attribute="label"
                  />
                  <UButton label="Add member" :loading="loadingMembers" type="submit" />
                </div>
              </div>
            </form>
          </UCard>
        </template>
      </UPopover>
    </div>
  </UAvatarGroup>
</template>

<style scoped>

</style>
