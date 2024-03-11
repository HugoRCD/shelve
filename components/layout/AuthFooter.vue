<template>
  <div class="mt-6">
    <LayoutDivider />
    <footer class="mx-auto flex max-w-7xl flex-col items-center justify-around gap-4 px-4 py-6 sm:flex-row">
      <div class="flex items-center gap-4">
        <span class="text-sm text-tertiary">
          Want to go back to homepage ?
          <NuxtLink to="/" class="text-primary ml-1 transition duration-300 ease-in-out hover:text-accent">
            Go to homepage
          </NuxtLink>
        </span>
        <SettingThemeToggle />
      </div>
    </footer>
  </div>
</template>
