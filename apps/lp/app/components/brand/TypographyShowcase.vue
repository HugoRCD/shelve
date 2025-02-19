<script setup lang="ts">
defineProps<{
  font: 'geist' | 'jetbrains'
}>()
</script>

<template>
  <div class="p-6 rounded-md border border-solid border-(--ui-border)/50 bg-(--ui-gray-100) dark:bg-(--ui-gray-900)">
    <template v-if="font === 'geist'">
      <div class="space-y-6">
        <div>
          <span class="text-sm text-(--ui-text-muted)">Display</span>
          <h1 class="font-geist text-4xl font-medium">
            The quick brown fox
          </h1>
        </div>
        <div>
          <span class="text-sm text-(--ui-text-muted)">Heading</span>
          <h2 class="font-geist text-2xl font-medium">
            The quick brown fox
          </h2>
        </div>
        <div>
          <span class="text-sm text-(--ui-text-muted)">Body</span>
          <p class="font-geist">
            The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once.
          </p>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="space-y-6">
        <div>
          <span class="text-sm text-(--ui-text-muted)">Code</span>
          <div class="font-jetbrains bg-(--ui-gray-900) p-4 rounded-md">
            <pre class="text-white">const shelve = {
  name: 'Shelve',
  type: 'Awesome'
}</pre>
          </div>
        </div>
        <div>
          <span class="text-sm text-(--ui-text-muted)">Terminal</span>
          <div class="font-jetbrains bg-(--ui-gray-900) p-4 rounded-md">
            <pre class="text-white">$ npx create-nuxt-app my-project</pre>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
