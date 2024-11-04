<script setup lang="ts">
const { title } = useAppConfig()

const { siteUrl } = useRuntimeConfig().public

defineShortcuts({
  s: {
    usingInput: true,
    handler: () => {
      navigateTo(`https://app.shelve.cloud/login`, { external: true })
    }
  }
})
</script>

<template>
  <div class="z-20 h-96 w-full overflow-hidden">
    <div class="mx-auto mt-32 w-full max-w-2xl">
      <div class="mx-auto max-w-md text-pretty text-center text-3xl sm:text-4xl">
        The all-in-one developer <span class="font-newsreader font-light italic">workspace</span>
      </div>
      <p class="mx-auto mt-2 max-w-lg text-center text-neutral-400 sm:block">
        Automate your workflow, manage your projects, and work faster with your team.
      </p>
      <p class="mt-4 hidden text-center text-neutral-400 sm:block">
        Press <UKbd>S</UKbd> to start your journey
      </p>
      <div class="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
        <UButton
          class="sm:hidden"
          :to="`https://app.shelve.cloud/login`"
          label="Start your journey"
          icon="lucide:arrow-right"
          trailing
          color="neutral"
        />
      </div>
    </div>

    <div
      class="gradient-mask gradient-color pointer-events-none relative -mt-32 h-96 w-screen overflow-hidden before:absolute before:inset-0 before:opacity-40 after:absolute after:-left-1/2 after:top-1/2 after:aspect-[1/0.7] after:w-[200%] after:rounded-[100%] after:border-t after:border-[#7876c566] after:bg-[#121212]"
    >
      <LandingSparkles
        :density="1200"
        class="gradient-mask-2 absolute inset-x-0 bottom-0 size-full"
      />
    </div>
  </div>
</template>

<style scoped>
.gradient-mask {
  mask-image: radial-gradient(closest-side at 50% 50%, white, transparent);
}

.gradient-mask-2 {
  mask-image: radial-gradient(closest-side at 50% 50%, white, transparent 85%);
}

.gradient-color:before {
  content: '';
  background: radial-gradient(circle at bottom center, #4C7EFF, transparent 70%);
}
</style>
