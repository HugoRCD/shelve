<script setup lang="ts">
import { type Member, Role, TeamRole } from '@shelve/types'

type TeamMemberProps = { members: Member[] }

const open = ref(false)

const { members } = defineProps<TeamMemberProps>()

const { addMember } = useTeams()

const { user } = useUserSession()
const isOwner = computed(() => members.find(member => member.user.id === user.value?.id)?.role === TeamRole.OWNER)

const roles = [
  {
    label: 'Member',
    value: TeamRole.MEMBER,
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
  role: TeamRole.MEMBER,
})

const loadingMembers = ref(false)
async function addMemberFunction(email: string, role: TeamRole) {
  loadingMembers.value = true
  await addMember(email, role)
  newMember.value.email = ''
  newMember.value.role = TeamRole.MEMBER
  loadingMembers.value = false
}
</script>

<template>
  <UPopover v-if="isOwner" v-model:open="open" arrow>
    <UButton label="Add member" size="sm" />
    <template #content>
      <UCard>
        <form @submit.prevent="addMemberFunction(newMember.email, newMember.role)">
          <div class="flex flex-col gap-2">
            <UInput v-model="newMember.email" label="Email" placeholder="Email" />
            <div class="flex gap-2">
              <USelect
                v-model="newMember.role"
                label="Role"
                :items="roles"
                value-attribute="value"
                option-attribute="label"
              />
              <UButton class="flex-1 justify-center" label="Add member" :loading="loadingMembers" type="submit" />
            </div>
          </div>
        </form>
      </UCard>
    </template>
  </UPopover>
</template>
