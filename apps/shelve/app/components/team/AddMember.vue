<script setup lang="ts">
import { type Member, Role, TeamRole } from '@types'

type TeamMemberProps = { members: Member[] }

const open = ref(false)

const { members } = defineProps<TeamMemberProps>()

const emit = defineEmits<{
  invitationSent: []
}>()

const { sendInvitation } = useTeamsService()

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

const loading = ref(false)

function cleanEmail(email: string) {
  return email
    .replace(/[\t\r\n]/g, '') // Remove tabs, line breaks
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim()
}

async function sendInvitationHandler(email: string, role: TeamRole) {
  loading.value = true
  try {
    await sendInvitation(cleanEmail(email), role)
    toast.success('Invitation sent successfully')
    newMember.value.email = ''
    newMember.value.role = TeamRole.MEMBER
    open.value = false
    emit('invitationSent')
  } catch (error: any) {
    if (error.data?.message) {
      toast.error(error.data.message)
    } else {
      toast.error('Failed to send invitation')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UPopover v-if="isOwner" v-model:open="open" arrow>
    <CustomButton label="Invite member" size="sm" icon="heroicons:user-plus" />
    <template #content>
      <UCard>
        <form @submit.prevent="sendInvitationHandler(newMember.email, newMember.role)">
          <div class="flex flex-col gap-2">
            <UInput v-model="newMember.email" type="email" label="Email" placeholder="member@example.com" required />
            <div class="flex gap-2">
              <USelect
                v-model="newMember.role"
                label="Role"
                :items="roles"
                value-attribute="value"
                option-attribute="label"
              />
              <UButton class="flex-1 justify-center" label="Send invite" :loading icon="heroicons:paper-airplane" type="submit" />
            </div>
          </div>
        </form>
      </UCard>
    </template>
  </UPopover>
</template>
