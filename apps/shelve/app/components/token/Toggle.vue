<script setup lang="ts">
const { token } = defineProps<{
  token: string
}>()

const visible = ref(false)

const copy = () => {
  navigator.clipboard.writeText(token)
  toast.success('Token copied to clipboard')
}
</script>

<template>
  <div class="flex select-none items-center gap-2">
    <div class="cursor-pointer text-sm text-muted" @click="copy">
      **********
    </div>
    <UPopover>
      <UButton
        icon="lucide:eye"
        size="sm"
        variant="ghost"
        @click="visible = !visible"
      />
      <template #content>
        <UCard :ui="{ body: 'px-2 sm:px-2 py-1 sm:py-1' }" class="cursor-pointer hover:bg-muted" @click="copy">
          <span class="text-sm font-mono">
            {{ token.slice(0, 4) }}...{{ token.slice(-4) }}
          </span>
        </UCard>
      </template>
    </UPopover>
  </div>
</template>
