<script setup lang="ts">
const route = useRoute()
const { data } = route.params

const value = ref('')
const reads = ref(1)
const ttl = ref([
  '1d',
  '7d',
  '30d',
])

const selectedTtl = ref(ttl.value[0])
</script>

<template>
  <div class="mx-auto flex h-full max-w-2xl flex-col items-center justify-center">
    <div class="flex flex-col gap-3">
      <div>
        <h1 class="main-gradient text-4xl">
          EnvShare
        </h1>
        <p class="text-sm text-gray-500">
          EnvShare is a tool to share environment variables with your team.
        </p>
      </div>
      <div class="mt-2 flex flex-col items-center justify-center gap-2">
        <UTextarea
          v-model="value"
          autoresize
          autofocus
          class="w-full"
          placeholder="DATABASE_URL=your_value ..."
        />
        <div class="mt-2 flex w-full items-end justify-between gap-2">
          <UFormGroup label="Reads">
            <UInput
              v-model="reads"
              label="Reads"
              type="number"
              min="1"
            />
          </UFormGroup>
          <UFormGroup label="TTL">
            <USelect
              v-model="selectedTtl"
              :options="ttl"
              default-value="1d"
              value-attribute="value"
              option-attribute="label"
            />
          </UFormGroup>
        </div>
        <div class="mt-4 w-full">
          <UButton block label="Encrypt" color="gray" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
