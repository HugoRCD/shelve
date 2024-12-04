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
    <UTooltip text="Copy token" class="cursor-pointer text-sm font-semibold leading-6 text-neutral-500 dark:text-neutral-400">
      <span v-if="visible" @click="copy">
        {{ token.slice(0, 4) }}...{{ token.slice(-4) }}
      </span>
      <div v-else @click="copy">
        **********
      </div>
    </UTooltip>
    <UIcon
      :name="visible ? 'lucide:eye-off' : 'lucide:eye'"
      class="cursor-pointer text-neutral-500 dark:text-neutral-400"
      @click="visible = !visible"
    />
  </div>
</template>
