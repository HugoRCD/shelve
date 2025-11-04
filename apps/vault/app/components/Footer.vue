<script setup lang="ts">
</script>

<template>
  <footer class="mt-20 flex flex-col gap-4 px-5">
    <Divider />
    <div class="flex items-center justify-between">
      <span class="text-xs font-mono italic tracking-tight text-muted">
        © {{ new Date().getFullYear() }} - Made by <NuxtLink to="https://hrcd.fr/" class="text-muted hover:text-neutral-200">
          HugoRCD
        </NuxtLink>
      </span>
      <span class="text-xs font-mono italic tracking-tight text-muted">
        <NuxtLink to="https://dub.sh/shelve" target="_blank" class="text-muted hover:text-neutral-200">
          Powered by Shelve <UIcon name="custom:shelve" />
        </NuxtLink>
      </span>
    </div>
  </footer>
</template>
