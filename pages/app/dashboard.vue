<script setup lang="ts">
</script>

<template>
  <div>
    Dashboard
    <button class="text-primary underline" @click="useSession().clear()">
      Logout
    </button>
    {{ useSession().isAdmin }} {{ useSession().isLoggedIn }}
  </div>
</template>

<style scoped>

</style>
