<script setup lang="ts">
const { start } = defineProps<{
  start: string
}>()

const copy = () => {
  navigator.clipboard.writeText(start)
  toast.info('Only the prefix is shown for security. The full API key is only shown when it is created.')
}
</script>

<template>
  <div class="flex select-none items-center gap-2">
    <span class="text-sm font-mono text-muted">
      {{ start }}…
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
