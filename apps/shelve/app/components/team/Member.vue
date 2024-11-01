<script setup lang="ts">
import type { Member } from '@shelve/types'
import type { PropType } from 'vue'

defineProps({
  member: {
    type: Object as PropType<Member>,
    required: true
  }
})
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
