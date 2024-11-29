<script setup lang="ts">
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
  <div class="z-20 h-96 w-full sm:p-0 p-5 relative overflow-hidden">
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

    <div class="size-60 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 absolute bottom-0 left-0 right-0 mx-auto -mb-40 blur-[200px] -z-1" />
  </div>
</template>
