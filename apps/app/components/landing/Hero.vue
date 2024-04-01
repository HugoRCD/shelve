<script setup lang="ts">
const { title } = useAppConfig()

defineShortcuts({
  s: {
    usingInput: true,
    handler: () => {
      useRouter().push('/login')
    }
  }
})
</script>

<template>
  <div class="h-96 w-full overflow-hidden">
    <div class="mx-auto mt-32 w-full max-w-2xl">
      <div class="text-balance text-center text-3xl font-extralight sm:text-4xl">
        Meet <span class="font-newsreader font-light italic">{{ title }}</span> a cosy home for all your <span class="font-newsreader font-light italic">projects</span>
      </div>
      <p class="mt-4 text-center text-gray-400">
        Press <UKbd>S</UKbd> to start your journey
      </p>
    </div>

    <div
      class="pointer-events-none relative -mt-32 h-96 w-screen overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_center,#4C7EFF,transparent_70%)] before:opacity-40 after:absolute after:-left-1/2 after:top-1/2 after:aspect-[1/0.7] after:w-[200%] after:rounded-[100%] after:border-t after:border-[#7876c566] after:bg-[#121212]"
    >
      <LandingSparkles
        :density="1200"
        class="absolute inset-x-0 bottom-0 size-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
