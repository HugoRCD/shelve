<script setup lang="ts">
</script>

<template>
  <div class="max-layout-width relative flex h-screen">
    <div class="main-container flex flex-1 flex-col overflow-hidden border-l border-l-neutral-200 dark:border-l-neutral-800">
      <div class="flex justify-between gap-1 border-b border-neutral-200 px-5 py-2 dark:border-b-neutral-800">
        <div class="flex items-center gap-2">
          <div id="action-items">
            <!-- action-items -->
          </div>
          <UserDropdown />
        </div>
      </div>
      <div class="flex h-full flex-col gap-4 overflow-y-auto px-3 py-6 sm:px-6">
        <slot />
      </div>
    </div>
  </div>
</template>

