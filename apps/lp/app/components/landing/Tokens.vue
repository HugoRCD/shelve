<script setup lang="ts">
const prefix = 'shv_01JB7FA2TX'
const scopes = [
  { label: 'variable:read', color: 'text-success' },
  { label: 'variable:write', color: 'text-success' },
  { label: 'audit:read', color: 'text-muted' }
]
</script>

<template>
  <div class="relative flex items-center justify-center w-full">
    <div class="relative w-[320px] rounded-xl bg-default/60 backdrop-blur-lg ring-1 ring-default shadow-xl p-4 flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="flex size-8 items-center justify-center rounded-md bg-elevated">
            <UIcon name="lucide:key-round" class="size-4 text-muted" />
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-semibold">ci-deploy</span>
            <span class="text-xs text-muted">created 2h ago</span>
          </div>
        </div>
        <span class="rounded-full bg-success/10 text-success text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5">active</span>
      </div>

      <div class="rounded-md bg-elevated/40 px-3 py-2 font-mono text-xs text-muted flex items-center justify-between">
        <span>{{ prefix }}••••••••••••••••</span>
        <UIcon name="lucide:eye-off" class="size-3.5" />
      </div>

      <div class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted">Scope</span>
          <div class="flex flex-wrap justify-end gap-1">
            <span v-for="scope in scopes" :key="scope.label" class="rounded bg-elevated px-1.5 py-0.5 font-mono text-[10px]" :class="scope.color">
              {{ scope.label }}
            </span>
          </div>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted">Expires</span>
          <span class="font-mono">in 7 days</span>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted">IP allowlist</span>
          <span class="font-mono text-default">10.0.0.0/8</span>
        </div>
      </div>
    </div>
  </div>
</template>
