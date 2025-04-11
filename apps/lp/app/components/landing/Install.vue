<script setup lang="ts">
function useClipboard(text: string) {
  copyToClipboard(text, 'Copied to clipboard')
  copy.value = true
  setTimeout(() => {
    copy.value = false
  }, 1000)
}

const copy = ref(false)
</script>

<template>
  <div class="relative flex items-center justify-center size-full">
    <div class="absolute bottom-16 z-20 flex items-center justify-center [mask-image:linear-gradient(to_bottom,white,transparent)]">
      <div
        class="flex items-center justify-center gap-4 rounded-md bg-(--ui-bg-inverted)/5 px-4 py-2 backdrop-blur-lg"
        @click="useClipboard('npx nypm add -D @shelve/cli')"
      >
        <div class="flex cursor-pointer items-center justify-center gap-2 text-sm text-(--ui-text-muted)">
          <span>
            npx nypm add -D @shelve/cli
          </span>
          <UIcon v-if="!copy" name="lucide:copy" />
          <UIcon v-else name="lucide:check" class="text-(--ui-primary) text-lg" />
        </div>
      </div>
    </div>

    <div class="relative py-40 w-full">
      <div class="absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_bottom,white,transparent)]">
        <div class="bg-(--ui-bg-inverted)/2.5 absolute size-96 rounded-full shadow-xl" />

        <div class="bg-(--ui-bg-inverted)/2.5 absolute size-[19rem] rounded-full border border-white/5 shadow-xl" />

        <div class="bg-(--ui-bg-inverted)/2.5 absolute size-56 rounded-full border border-white/10 shadow-xl" />

        <div class="bg-(--ui-bg-inverted)/2.5 absolute size-36 rounded-full border border-dashed border-white/15 shadow-xl" />
      </div>

      <div class="relative flex items-center justify-center">
        <div class="flex size-16 items-center justify-center rounded-full border border-white/10 bg-(--ui-bg-inverted)/2.5 p-3 shadow-md">
          <UIcon name="lucide:lock" class="size-8 text-(--ui-text-muted)" />
        </div>
      </div>
    </div>
  </div>
</template>
