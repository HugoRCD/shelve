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
  <div class="mx-auto flex h-full flex-col items-center justify-center">
    <div class="w-full border-y border-gray-500/20">
      <div class="mx-auto flex max-w-2xl justify-center px-5 sm:px-0">
        <CrossedDiv encrypted-text class="flex w-full justify-center">
          <div>
            <h1 class="main-gradient text-3xl">
              <LandingScrambleText label="EnvShare" />
            </h1>
            <p class="text-gray-500">
              EnvShare is a small utility to share secrets.
            </p>
          </div>
        </CrossedDiv>
      </div>
    </div>
    <div class="mx-auto mt-8 flex w-full max-w-2xl flex-col justify-center gap-2 px-5 sm:px-0">
      <UTextarea
        v-model="value"
        autoresize
        autofocus
        :rows="5"
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
</template>

<style scoped>

</style>
