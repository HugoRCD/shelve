<template>
  <div class="fixed inset-x-0 top-0 isolate h-24">
    <div
      style="-webkit-backdrop-filter:blur(1px);backdrop-filter:blur(1px)"
      class="absolute inset-0 gradient-mask-b-0 blur-[1px]"
    />
    <div
      style="-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)"
      class="absolute inset-0 gradient-mask-b-0 blur-[2px]"
    />
    <div
      style="-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)"
      class="absolute inset-0 gradient-mask-b-0 blur-[3px]"
    />
    <div
      style="-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)"
      class="absolute inset-0 gradient-mask-b-0 blur-[6px]"
    />
    <div
      style="-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)"
      class="absolute inset-0 gradient-mask-b-0 blur-[12px]"
    />
  </div>
</template>

<style scoped>
.gradient-mask-b-0 {
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, transparent 100%);
}
</style>
