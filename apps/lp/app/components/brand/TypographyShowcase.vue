<script setup lang="ts">
defineProps<{
  font: 'geist' | 'jetbrains'
}>()
</script>

<template>
  <div class="p-6 rounded-md border border-solid border-(--ui-border)/50 bg-(--ui-bg-elevated) hover:bg-(--ui-bg-elevated)/50 transition-colors">
    <template v-if="font === 'geist'">
      <NuxtLink class="space-y-6 cursor-pointer" to="https://vercel.com/font">
        <div>
          <span class="text-sm text-(--ui-text-muted)">Display</span>
          <h1 class="text-4xl font-medium text-(--ui-text-highlighted)">
            The quick brown fox
          </h1>
        </div>
        <div>
          <span class="text-sm text-(--ui-text-muted)">Heading</span>
          <h2 class="text-2xl font-medium text-(--ui-text-highlighted)">
            The quick brown fox
          </h2>
        </div>
        <div>
          <span class="text-sm text-(--ui-text-muted)">Body</span>
          <p class="text-(--ui-text-muted)">
            The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once.
          </p>
        </div>
      </NuxtLink>
    </template>
    <template v-else>
      <NuxtLink class="space-y-6 cursor-pointer" to="https://fonts.google.com/specimen/JetBrains+Mono">
        <div>
          <span class="text-sm text-(--ui-text-muted)">Code</span>
          <div class="font-mono bg-(--ui-bg) p-4 rounded-md">
            <pre class="text-(--ui-text-muted)">const shelve = {
  name: 'Shelve',
  type: 'Awesome'
}</pre>
          </div>
        </div>
        <div>
          <span class="text-sm text-(--ui-text-muted)">Terminal</span>
          <div class="font-mono bg-(--ui-bg) p-4 rounded-md">
            <pre class="text-(--ui-text-muted)">$ npx create-nuxt-app my-project</pre>
          </div>
        </div>
      </NuxtLink>
    </template>
  </div>
</template>
