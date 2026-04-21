<script setup lang="ts">
const layers = [
  { id: 'kek', label: 'KEK', sub: 'platform', icon: 'lucide:shield', ring: 'ring-primary/40' },
  { id: 'dek', label: 'DEK', sub: 'per project', icon: 'lucide:key-round', ring: 'ring-default' },
  { id: 'value', label: 'ciphertext', sub: 'variables.encryptedValue', icon: 'lucide:lock', ring: 'ring-default' }
]
</script>

<template>
  <div class="flex w-full max-w-[340px] flex-col items-stretch mx-auto">
    <template v-for="(layer, index) in layers" :key="layer.id">
      <div
        class="envelope-row flex w-full items-center gap-3 rounded-md bg-default/60 p-3 shadow-sm ring-1 backdrop-blur-lg"
        :class="[layer.ring]"
        :style="{ '--delay': `${index * 0.18}s` }"
      >
        <div class="flex size-10 shrink-0 items-center justify-center rounded-md border border-default bg-elevated/40">
          <UIcon :name="layer.icon" class="size-5 text-muted" />
        </div>
        <div class="flex flex-col text-left">
          <span class="text-sm font-semibold text-default">{{ layer.label }}</span>
          <span class="text-xs text-muted">{{ layer.sub }}</span>
        </div>
      </div>

      <div
        v-if="index < layers.length - 1"
        class="envelope-arrow flex h-6 items-center justify-center"
        :style="{ '--delay': `${index * 0.18 + 0.09}s` }"
        aria-hidden="true"
      >
        <span class="block h-3 w-px bg-default/60" />
        <UIcon name="lucide:chevron-down" class="-mx-px size-4 text-muted" />
        <span class="block h-3 w-px bg-default/60" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.envelope-row {
  animation: seal 3.2s ease-in-out infinite;
  animation-delay: var(--delay);
}

.envelope-arrow {
  animation: flow 3.2s ease-in-out infinite;
  animation-delay: var(--delay);
}

@keyframes seal {
  0%, 70%, 100% { transform: translateY(0); opacity: 1; }
  35% { transform: translateY(-1px); opacity: 0.9; }
}

@keyframes flow {
  0%, 100% { opacity: 0.4; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(2px); }
}
</style>
