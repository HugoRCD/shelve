<script setup lang="ts">
const ignored = ['.env', '.env.local', '.env.production', '.shelve/']
</script>

<template>
  <div class="relative flex items-center justify-center w-full">
    <div class="grid grid-cols-[1fr_auto_1fr] gap-4 items-center w-full max-w-[380px]">
      <div class="flex flex-col items-center gap-2 rounded-lg bg-default/60 backdrop-blur-lg ring-1 ring-default p-3 shadow-sm">
        <div class="flex size-10 items-center justify-center rounded-md bg-elevated/50">
          <UIcon name="lucide:bot" class="size-5 text-muted" />
        </div>
        <span class="text-xs font-semibold">AI agent</span>
        <span class="text-[10px] text-muted">Cursor · Claude · Aider</span>
      </div>

      <div class="flex flex-col items-center gap-1">
        <UIcon name="lucide:shield" class="size-5 text-primary" />
        <span class="text-[10px] text-muted font-mono">.cursorignore</span>
      </div>

      <div class="flex flex-col gap-1.5 rounded-lg bg-default/60 backdrop-blur-lg ring-1 ring-default p-3 shadow-sm">
        <span class="text-xs font-semibold text-default mb-1">Hidden from agent</span>
        <div
          v-for="file in ignored"
          :key="file"
          class="flex items-center gap-1.5 font-mono text-[11px] text-muted"
        >
          <UIcon name="lucide:eye-off" class="size-3 shrink-0" />
          <span class="truncate">{{ file }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
