<script setup lang="ts">
const entries = [
  { action: 'variable.update', actor: 'owner', resource: 'production/STRIPE_SECRET_KEY', ago: '12s', icon: 'lucide:pencil', color: 'text-warning' },
  { action: 'token.create', actor: 'owner', resource: 'ci-deploy', ago: '2m', icon: 'lucide:key-round', color: 'text-primary' },
  { action: 'variable.delete', actor: 'admin', resource: 'preview/LEGACY_FLAG', ago: '14m', icon: 'lucide:trash-2', color: 'text-error' },
  { action: 'team.member.invite', actor: 'owner', resource: 'teammate@example.com', ago: '1h', icon: 'lucide:user-plus', color: 'text-success' },
  { action: 'project.create', actor: 'admin', resource: 'web-platform', ago: '3h', icon: 'lucide:folder-plus', color: 'text-muted' }
]
</script>

<template>
  <div class="w-full max-w-[380px]">
    <div class="rounded-lg bg-default/60 backdrop-blur-lg ring-1 ring-default shadow-xl overflow-hidden">
      <div class="flex items-center justify-between border-b border-default px-3 py-2">
        <div class="flex items-center gap-2">
          <UIcon name="lucide:history" class="size-4 text-muted" />
          <span class="text-xs font-semibold">Audit log</span>
        </div>
        <span class="text-[10px] text-muted font-mono">/api/teams/shelve/audit-logs</span>
      </div>
      <ul class="divide-y divide-default">
        <li v-for="entry in entries" :key="entry.action + entry.resource" class="flex items-start gap-3 px-3 py-2.5">
          <div class="flex size-7 items-center justify-center rounded-md bg-elevated/50 shrink-0">
            <UIcon :name="entry.icon" class="size-3.5" :class="entry.color" />
          </div>
          <div class="flex flex-1 flex-col min-w-0">
            <div class="flex items-center gap-2 text-xs">
              <span class="font-mono text-default truncate">{{ entry.action }}</span>
              <span class="text-muted shrink-0">·</span>
              <span class="text-muted shrink-0">{{ entry.actor }}</span>
            </div>
            <span class="text-[11px] text-muted truncate">{{ entry.resource }}</span>
          </div>
          <span class="text-[10px] text-muted font-mono shrink-0 pt-0.5">{{ entry.ago }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
