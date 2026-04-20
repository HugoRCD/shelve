<script setup lang="ts">
const layers = [
  { id: 'kek', label: 'KEK', sub: 'platform', icon: 'lucide:shield', ring: 'ring-primary/40' },
  { id: 'dek', label: 'DEK', sub: 'per project', icon: 'lucide:key-round', ring: 'ring-default' },
  { id: 'value', label: 'ciphertext', sub: 'variables.encryptedValue', icon: 'lucide:lock', ring: 'ring-default' }
]
</script>

<template>
  <div class="relative flex flex-col items-center justify-center gap-4 w-full max-w-[340px] mx-auto">
    <div
      v-for="(layer, index) in layers"
      :key="layer.id"
      class="envelope-row relative w-full flex items-center gap-3 rounded-md bg-default/60 backdrop-blur-lg ring-1 p-3 shadow-sm"
      :class="[layer.ring]"
      :style="{ '--delay': `${index * 0.15}s` }"
    >
      <div class="flex size-10 items-center justify-center rounded-md border border-default bg-elevated/40">
        <UIcon :name="layer.icon" class="size-5 text-muted" />
      </div>
      <div class="flex flex-col text-left">
        <span class="text-sm font-semibold text-default">{{ layer.label }}</span>
        <span class="text-xs text-muted">{{ layer.sub }}</span>
      </div>
      <UIcon v-if="index < layers.length - 1" name="lucide:arrow-down" class="absolute -bottom-3.5 left-1/2 -translate-x-1/2 size-4 text-muted" />
    </div>
  </div>
</template>

<style scoped>
.envelope-row {
  animation: seal 3s ease-in-out infinite;
  animation-delay: var(--delay);
}

@keyframes seal {
  0%, 70%, 100% { transform: translateY(0); opacity: 1; }
  35% { transform: translateY(-2px); opacity: 0.85; }
}
</style>
