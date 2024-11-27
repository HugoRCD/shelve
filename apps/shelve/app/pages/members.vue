<script setup lang="ts">
import type { Member } from '@shelve/types'
import { TeamRole } from '@shelve/types'
import { ConfirmModal } from '#components'

const { updateMember, removeMember } = useTeamsService()

const currentTeam = useTeam()
const members = computed(() => currentTeam.value.members.filter((member) => member.user.username.toLowerCase().includes(search.value.toLowerCase())))

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
      onSelect: () => {
        changeMemberRole(row.id, TeamRole.MEMBER)
      },
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'heroicons:trash-20-solid',
      iconClass: 'text-red-500 dark:text-red-500',
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
      <div class="flex gap-1">
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
        <p class="text-sm text-neutral-500">
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
                <span class="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer" @click="copyToClipboard(member.user.email)">
                  {{ member.user.email }}
                </span>
              </div>
            </div>
            <div class="flex gap-2">
              <div class="flex flex-col gap-1">
                <span class="text-xs text-neutral-500 hidden sm:flex">CreatedAt: {{ new Date(member.createdAt).toLocaleString() }}</span>
                <span class="text-xs text-neutral-500 hidden sm:flex">UpdatedAt: {{ new Date(member.updatedAt).toLocaleString() }}</span>
              </div>
              <UDropdownMenu :items="items(member)">
                <UButton color="neutral" variant="ghost" icon="heroicons:ellipsis-horizontal-20-solid" />
              </UDropdownMenu>
            </div>
          </div>
          <USeparator />
        </div>
      </TransitionGroup>
    <!--    <UTable :data="currentTeam.members" :columns :loading="updateLoading || deleteLoading">
      <template #avatar-cell="{ row }">
        <UAvatar :src="row.original.user.avatar" :alt="row.original.user.username" size="sm" img-class="object-cover" />
      </template>
      <template #role-cell="{ row }">
        <UBadge :label="row.original.role.toUpperCase()" variant="subtle" :color="row.original.role === TeamRole.OWNER ? 'primary' : row.original.role === TeamRole.ADMIN ? 'success' : 'neutral'" />
      </template>
      <template #actions-cell="{ row }">
        <UDropdownMenu :items="items(row.original)">
          <UButton color="neutral" variant="ghost" icon="heroicons:ellipsis-horizontal-20-solid" />
        </UDropdownMenu>
      </template>
    </UTable>-->
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.fade-enter {
  transform: translateY(10px);
}
</style>
