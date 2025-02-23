<script setup lang="ts">
import type { Member } from '@types'
import { TeamRole } from '@types'
import { ConfirmModal } from '#components'

const { updateMember, removeMember } = useTeamsService()

const currentTeam = useTeam()
const members = computed(() => currentTeam.value.members.filter((member) => member.user.username.toLowerCase().includes(search.value.toLowerCase())))

const teamRole = useTeamRole()
const canDelete = computed(() => hasAccess(teamRole.value, TeamRole.OWNER))
const canUpdate = computed(() => hasAccess(teamRole.value, TeamRole.ADMIN))

const search = ref('')

function changeMemberRole(memberId: number, role: TeamRole) {
  toast.promise(updateMember(memberId, role), {
    loading: 'Updating member role...',
    success: 'Member role updated successfully',
    error: 'Error updating member role',
  })
}

const modal = useModal()

const items = (row: Member) => [
  [
    {
      label: 'Set as Owner',
      icon: 'lucide:crown',
      disabled: row.role === TeamRole.OWNER || !hasAccess(teamRole.value, TeamRole.OWNER),
      onSelect: () => {
        if (row.role === TeamRole.OWNER) {
          toast.success('User is already an owner')
          return
        }
        changeMemberRole(row.id, TeamRole.OWNER)
      },
    },
    {
      label: 'Set as Admin',
      icon: 'lucide:shield',
      disabled: row.role === TeamRole.ADMIN || !hasAccess(teamRole.value, TeamRole.ADMIN),
      onSelect: () => {
        if (row.role === TeamRole.ADMIN) {
          toast.success('User is already an admin')
          return
        }
        changeMemberRole(row.id, TeamRole.ADMIN)
      },
    },
    {
      label: 'Set as Member',
      icon: 'lucide:user',
      disabled: row.role === TeamRole.MEMBER || !hasAccess(teamRole.value, TeamRole.ADMIN),
      onSelect: () => {
        changeMemberRole(row.id, TeamRole.MEMBER)
      },
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'heroicons:trash-20-solid',
      color: 'error' as const,
      disabled: !canDelete.value,
      onSelect: () => {
        if (row.role === TeamRole.OWNER) {
          toast.error('Cannot delete team owner')
          return
        }
        modal.open(ConfirmModal, {
          title: 'Are you sure?',
          description: `You are about to remove ${row.user.username} from the team.`,
          danger: true,
          onSuccess() {
            toast.promise(removeMember(row.id), {
              loading: 'Removing member...',
              success: 'Member removed successfully',
              error: 'Error removing member',
            })
          },
        })
      },
    },
  ],
]
</script>

<template>
  <div class="mt-1 flex flex-col gap-4">
    <Teleport defer to="#action-items">
      <div v-if="canUpdate" class="flex gap-1">
        <TeamAddMember v-if="members" :members />
      </div>
    </Teleport>
    <div class="flex flex-col justify-end gap-4 sm:flex-row sm:items-center">
      <UInput v-model="search" label="Search" placeholder="Search a user" icon="heroicons:magnifying-glass-20-solid" />
    </div>
    <div class="flex flex-col gap-4">
      <div>
        <h2 class="text-lg font-bold">
          Members
        </h2>
        <p class="text-sm text-(--ui-text-muted)">
          Manage team members
        </p>
      </div>
      <TransitionGroup name="fade" tag="ul" class="flex flex-col gap-4">
        <div v-for="member in members" :key="member.id" class="flex flex-col gap-4">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <UAvatar :src="member.user.avatar" :alt="member.user.username" img-class="object-cover" />
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold">{{ member.user.username }}</span>
                  <UBadge size="sm" :label="member.role.toUpperCase()" variant="subtle" :color="member.role === TeamRole.OWNER ? 'primary' : member.role === TeamRole.ADMIN ? 'success' : 'neutral'" />
                </div>
                <span class="text-xs text-(--ui-text-muted) hover:text-(--ui-text-highlighted) cursor-pointer" @click="copyToClipboard(member.user.email)">
                  {{ member.user.email }}
                </span>
              </div>
            </div>
            <div class="flex gap-2">
              <div class="flex-col gap-1 text-xs text-(--ui-text-muted) hidden sm:flex">
                <span>CreatedAt: {{ new Date(member.createdAt).toLocaleString() }}</span>
                <span>UpdatedAt: {{ new Date(member.updatedAt).toLocaleString() }}</span>
              </div>
              <UDropdownMenu v-if="canUpdate" :items="items(member)">
                <UButton variant="ghost" icon="heroicons:ellipsis-horizontal-20-solid" />
              </UDropdownMenu>
            </div>
          </div>
          <USeparator />
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

