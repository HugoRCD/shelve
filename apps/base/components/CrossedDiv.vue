<script setup lang="ts">
const { as = 'div' } = defineProps<{
  as?: string
  line?: boolean
}>()
</script>

<template>
  <component :is="as" class="relative -mb-px -ml-px">
    <div v-if="line" class="h-0.5 w-[200rem] bg-elevated/50 absolute -left-[100rem]" />
    <div v-if="line" class="h-[200rem] w-0.5 bg-elevated/50 absolute -top-[100rem] -left-0.5" />
    <span class="cross absolute -bottom-px -left-px size-px" />
    <span class="cross absolute -bottom-px -right-px size-px" />
    <span class="cross absolute -left-px -top-px size-px" />
    <span class="cross absolute -right-px -top-px size-px" />
    <div class="relative z-10 flex h-full flex-col justify-center">
      <slot />
    </div>
    <div v-if="line" class="h-0.5 w-[200rem] -z-1 bg-elevated/50 absolute -right-[100rem]" />
    <div v-if="line" class="h-[200rem] w-0.5 -z-1 bg-elevated/50 absolute -bottom-[100rem] -right-0.5" />
  </component>
</template>

<style scoped>
.encryption {
  --x: 80%;
  --y: 0%;
  transition: .5s;
  -webkit-mask-image: radial-gradient(300px circle at var(--x) var(--y), #000 10%, rgba(0, 0, 0, .25), transparent);
  mask-image: radial-gradient(300px circle at var(--x) var(--y), #000 10%, rgba(0, 0, 0, .25), transparent);
  opacity: .4;
}
</style>
