<script setup lang="ts">
const route = useRoute()

const { data: variables, status, error, refresh } = useFetch("/api/variable/project/" + route.params.id, {
  method: "GET",
  watch: false,
})

const show = ref(false)
</script>

<template>
  <div>
    <h1>Project</h1>
    <div v-for="variable in variables" :key="variable.id">
      <div class="flex gap-3 p-4">
        <p>{{ variable.key }}</p>
        <p>{{ variable.value }}</p>
        <div>
          <CInput v-model="variable.value" :type="show ? 'text' : 'password'" />
          <button @click="show = !show">
            Show
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
