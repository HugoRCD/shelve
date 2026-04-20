<script setup lang="ts">
const { prefix } = defineProps<{
  prefix: string
}>()

const copy = () => {
  navigator.clipboard.writeText(prefix)
  toast.info('Only the prefix is shown for security. Full token is only revealed at creation.')
}
</script>

<template>
  <div class="flex select-none items-center gap-2">
    <span class="text-sm font-mono text-muted">
      {{ prefix }}…
    </span>
    <UTooltip text="Copy prefix">
      <UButton
        icon="lucide:copy"
        size="sm"
        variant="ghost"
        @click="copy"
      />
    </UTooltip>
  </div>
</template>
