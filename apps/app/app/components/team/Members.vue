<script setup lang="ts">
import { type Member, Role, type Team, TeamRole } from '@shelve/types'
import type { PropType } from 'vue'

type TeamMemberProps = {
  members: Member[]
  teamId: number
  display?: boolean
}

const open = ref(false)
const mainsTeammates = ref([])
const teammateLoading = ref(false)

const { members, teamId, display = false } = defineProps<TeamMemberProps>()

const {
  upsertMember,
  removeMember,
} = useTeams()

const { user } = useUserSession()

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
async function upsertMemberFunction(teamId: number, email: string, role: TeamRole) {
  loadingMembers.value = true
  await upsertMember(teamId, email, role)
  newMember.value.email = ''
  newMember.value.role = TeamRole.DEVELOPER
  loadingMembers.value = false
}

const loadingRemove = ref(false)
async function removeMemberFunction(teamId: number, memberId: number) {
  loadingRemove.value = true
  await removeMember(teamId, memberId)
  loadingRemove.value = false
}

async function loadTeammates() {
  const allTeammates = await $fetch<{ data: Member[] }>('/api/user/teammate', {
    method: 'GET',
  })
  mainsTeammates.value = allTeammates
  teammateLoading.value = true
}

watch(open, (newValue) => {
  if (newValue) {
    loadTeammates()
  } else {
    newMember.value.email = ''
    teammateLoading.value = false
  }
})
</script>

<template>
  <UAvatarGroup v-if="!display" :ui="{ ring: 'ring-0' }">
    <UPopover v-for="member in members" :key="member.id" :popper="{ arrow: true }">
      <TeamMember :member />
      <template #panel>
        <UCard>
          <form @submit.prevent="upsertMemberFunction(teamId, member.user.email, member.role)">
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
                <UButton color="red" variant="soft" label="Remove" :loading="loadingRemove" @click="removeMemberFunction(teamId, member.id)" />
              </div>
            </div>
          </form>
        </UCard>
      </template>
    </UPopover>
    <UPopover v-if="members.find(member => member.user.id === user?.id)?.role === TeamRole.OWNER" v-model:open="open" :popper="{ arrow: true }">
      <UTooltip text="Add member" :ui="{ popper: { placement: 'top' } }">
        <span class="flex size-8 cursor-pointer items-center justify-center rounded-full border border-dashed border-gray-400">+</span>
      </UTooltip>
      <template #panel>
        <UCard>
          <form @submit.prevent="upsertMemberFunction(teamId, newMember.email, newMember.role)">
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
                <UButton class="flex-1 justify-center" label="Add member" :loading="loadingMembers" type="submit" />
              </div>
              <div v-if="mainsTeammates.length > 0" class="flex w-full content-between gap-2">
                <p class=" content-center items-center text-center">
                  Your teammates :
                </p>
                <div v-if="!teammateLoading" class="flex">
                  <USkeleton v-for="n in 4" :key="n" class="size-8" :ui="{ rounded: 'rounded-full' }" />
                </div>
                <div v-else>
                  <div v-if="mainsTeammates" class="flex">
                    <UAvatarGroup :ui="{ ring: 'ring-0'}">
                      <UTooltip
                        v-for="teammate in mainsTeammates"
                        :key="teammate.teammate.id"
                        :text="teammate.teammate.username || teammate.teammate.email"
                        :ui="{ popper: { placement: 'top' } }"
                      >
                        <UAvatar
                          :src="teammate.teammate.avatar"
                          :alt="teammate.teammate.username"
                          size="sm"
                          class="ring-primary transform cursor-pointer transition duration-300 hover:z-40 hover:scale-105 hover:ring-2"
                          @click="newMember.email = teammate.teammate.email"
                        />
                      </UTooltip>
                    </UAvatarGroup>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </UCard>
      </template>
    </UPopover>
  </UAvatarGroup>
  <UAvatarGroup v-else :ui="{ ring: 'ring-0' }">
    <TeamMember v-for="member in members" :key="member.id" :member />
  </UAvatarGroup>
</template>
