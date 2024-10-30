<script setup lang="ts">
const route = useRoute()
const id = computed(() => route.query.id)

const sealMode = computed(() => id.value)
</script>

<template>
  <div class="mx-auto my-8 flex h-full flex-col items-center justify-around gap-2 sm:my-0">
    <div class="flex w-full flex-col items-center justify-center">
      <div class="w-full border-y border-gray-500/20">
        <div class="mx-auto flex max-w-2xl justify-center px-5 sm:px-0">
          <CrossedDiv encrypted-text class="w-full">
            <div>
              <h1 class="main-gradient cursor-pointer text-3xl" @click="$router.push('/vault')">
                <LandingScrambleText label="Vault" />
              </h1>
              <p class="text-gray-500">
                Vault is a small utility to share secrets.
              </p>
            </div>
          </CrossedDiv>
        </div>
      </div>
      <VaultEncrypt v-if="!sealMode" />
      <VaultDecrypt v-else />
    </div>
    <VaultFaq />
  </div>
</template>
