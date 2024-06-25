<script setup lang="ts">
const reduceMotion = useCookie<boolean>('reduceMotion', {
  watch: true,
})

function setPrefersReducedMotion() {
  if (reduceMotion.value) {
    document.documentElement.setAttribute('data-reduce-motion', 'reduce')
  } else {
    document.documentElement.removeAttribute('data-reduce-motion')
  }
}

watch(reduceMotion, () => {
  setPrefersReducedMotion()
})
</script>

<template>
  <div class="flex flex-col gap-4 pb-4">
    <div style="--stagger: 1" data-animate class="flex flex-col gap-3">
      <div class="flex flex-col gap-1">
        <h2 class="text-lg font-bold">
          Reduce Motion
        </h2>
        <p class="text-sm text-gray-500">
          Remove all transitions and animations from the site.
        </p>
      </div>
      <UToggle v-model="reduceMotion" />
    </div>
    <UDivider class="my-4" />
    <div style="--stagger: 2" data-animate class="flex flex-col gap-3">
      <h2 class="text-lg font-bold">
        Theme settings
      </h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div
          class="flex cursor-pointer flex-col gap-2 rounded-lg border border-gray-300 bg-[#F8F8F8] p-4 shadow-md hover:border-gray-400 hover:bg-gray-200"
          @click="$colorMode.preference = 'light'"
        >
          <h3 class="text-lg font-semibold text-gray-700">
            Shining Star
          </h3>
          <p class="text-sm text-gray-500">
            Shining Star theme is the theme for all people who like keeping it bright.
          </p>
          <div class="mt-2 flex flex-col gap-1">
            <div class="flex gap-2">
              <div class="h-3 w-1/2 rounded-full bg-gray-400" />
              <div class="h-3 w-1/4 rounded-full bg-gray-400" />
            </div>
            <div class="flex gap-2">
              <div class="h-3 w-1/4 rounded-full bg-gray-400" />
              <div class="h-3 w-1/2 rounded-full bg-gray-400" />
            </div>
          </div>
        </div>
        <div
          class="flex cursor-pointer flex-col gap-2 rounded-lg border border-gray-700 bg-[#131113] p-4 shadow-md hover:border-gray-600 hover:bg-gray-900"
          @click="$colorMode.preference = 'dark'"
        >
          <h3 class="text-lg font-semibold text-gray-100">
            Sideral Night
          </h3>
          <p class="text-sm text-gray-400">
            Sideral Night theme is the theme for all people who like keeping it dark.
          </p>
          <div class="mt-2 flex flex-col gap-1">
            <div class="flex gap-2">
              <div class="h-3 w-1/2 rounded-full bg-gray-700" />
              <div class="h-3 w-1/4 rounded-full bg-gray-700" />
            </div>
            <div class="flex gap-2">
              <div class="h-3 w-1/4 rounded-full bg-gray-700" />
              <div class="h-3 w-1/2 rounded-full bg-gray-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.light {
  background-color: #fff;
  color: #000;
}
</style>
