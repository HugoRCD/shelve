<script setup lang="ts">
import { type Member, Role, TeamRole } from '@shelve/types'
import type { PropType } from 'vue'

const { members, teamId, display } = defineProps({
  members: {
    type: Array as PropType<Member[]>,
    required: true,
  },
  teamId: {
    type: Number,
    required: true,
  },
  display: {
    type: Boolean,
    default: false,
  },
})

const {
  upsertMember,
  removeMember,
} = useTeams()

const user = useCurrentUser()

const roles = [
  {
    label: 'Developer',
    value: TeamRole.DEVELOPER,
  },
  {
    label: 'Admin',
    value: TeamRole.ADMIN,
    disabled: user.value?.role !== Role.ADMIN,
  },
  {
    label: 'Owner',
    value: TeamRole.OWNER,
    disabled: user.value?.role !== Role.ADMIN
  }
]

const newMember = ref({
  email: '',
  role: TeamRole.DEVELOPER,
})

const loadingMembers = ref(false)
async function upsert_member(teamId: number, email: string, role: TeamRole) {
  loadingMembers.value = true
  await upsertMember(teamId, email, role)
  newMember.value.email = ''
  newMember.value.role = TeamRole.DEVELOPER
  loadingMembers.value = false
}

const loadingRemove = ref(false)
async function remove_member(teamId: number, memberId: number) {
  loadingRemove.value = true
  await removeMember(teamId, memberId)
  loadingRemove.value = false
}
</script>

<template>
  <UAvatarGroup v-if="!display" :ui="{ ring: 'ring-0' }">
    <UPopover v-for="member in members" :key="member.id" :popper="{ arrow: true }">
      <TeamMember :member="member" />
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
    <UPopover v-if="members.find(member => member.user.id === user?.id)?.role === TeamRole.OWNER" :popper="{ arrow: true }">
      <UTooltip text="Add member" :ui="{ popper: { placement: 'top' } }">
        <span class="flex size-8 cursor-pointer items-center justify-center rounded-full border border-dashed border-gray-400">+</span>
      </UTooltip>
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
  </UAvatarGroup>
  <UAvatarGroup v-else :ui="{ ring: 'ring-0' }">
    <TeamMember v-for="member in members" :key="member.id" :member="member" />
  </UAvatarGroup>
</template>
