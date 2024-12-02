<script setup lang="ts">
defineProps<{
  line?: boolean
}>()
</script>

<template>
  <div class="relative -mb-px -ml-px">
    <div v-if="line" class="h-0.5 w-[200rem] bg-neutral-100 dark:bg-neutral-800 absolute -left-[100rem] opacity-40" />
    <div v-if="line" class="h-[200rem] w-0.5 bg-neutral-100 dark:bg-neutral-800 absolute -top-[100rem] opacity-40 -left-0.5" />
    <span class="bottom absolute -bottom-px -left-px size-px" />
    <span class="bottom absolute -bottom-px -right-px size-px" />
    <span class="bottom absolute -left-px -top-px size-px" />
    <span class="bottom absolute -right-px -top-px size-px" />
    <div class="relative z-10 flex h-full flex-col justify-center">
      <slot />
    </div>
    <div v-if="line" class="h-0.5 w-[200rem] -z-1 bg-neutral-100 dark:bg-neutral-800 absolute -right-[100rem] opacity-40" />
    <div v-if="line" class="h-[200rem] w-0.5 -z-1 bg-neutral-100 dark:bg-neutral-800 absolute -bottom-[100rem] opacity-40 -right-0.5" />
  </div>
</template>

<style scoped>
.bottom:before {
  --tw-bg-opacity: 1;
  content: "";
  width: 1px;
  height: 9px;
  position: absolute;
  top: -4px;
}

.bottom:after {
  --tw-bg-opacity: 1;
  content: "";
  width: 9px;
  height: 1px;
  position: absolute;
  left: -4px;
}

.dark {
  .bottom:before, .bottom:after {
    background-color: rgb(255 255 255 / var(--tw-bg-opacity));
  }
}

.light {
  .bottom:before, .bottom:after {
    background-color: rgb(0 0 0 / var(--tw-bg-opacity));
  }
}

.encryption {
  --x: 80%;
  --y: 0%;
  transition: .5s;
  -webkit-mask-image: radial-gradient(300px circle at var(--x) var(--y), #000 10%, rgba(0, 0, 0, .25), transparent);
  mask-image: radial-gradient(300px circle at var(--x) var(--y), #000 10%, rgba(0, 0, 0, .25), transparent);
  opacity: .4;
}
</style>
