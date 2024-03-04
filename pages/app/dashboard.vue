<script setup lang="ts">
</script>

<template>
  <div class="flex h-full flex-col justify-center gap-3 p-5">
    <div class="flex h-full flex-col">
      <h2 class="font-newsreader text-3xl font-light italic">
        Your projects
      </h2>
      <button class="text-primary underline" @click="useSession().clear()">
        Logout
      </button>
      <button class="text-primary underline" @click="navigateTo('/')">
        Go to home
      </button>
    </div>
    <LayoutFooter />
  </div>
</template>

<style scoped>

</style>
