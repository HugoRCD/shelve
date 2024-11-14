<script setup lang="ts">
import type { Member } from '@shelve/types'

type TeamMemberProps = {
  member: Member
}

defineProps<TeamMemberProps>()
</script>

<template>
  <UTooltip :text="member.user.username || member.user.email" :content="{ side: 'top' }">
    <UAvatar
      :src="member.user.avatar"
      :alt="member.user.username"
      size="sm"
    />
  </UTooltip>
</template>

<style scoped>

</style>
