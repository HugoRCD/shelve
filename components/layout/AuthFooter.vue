<template>
  <div class="mt-6">
    <LayoutDivider />
    <footer class="mx-auto flex max-w-7xl flex-col items-center justify-around gap-4 px-4 py-6 sm:flex-row">
      <div class="flex items-center gap-4">
        <span class="text-center text-sm text-tertiary">
          Dont have an account? <NuxtLink to="/signup" class="text-primary transition duration-300 ease-in-out hover:text-accent">Sign up</NuxtLink>
        </span>
        <SettingThemeToggle />
      </div>
    </footer>
  </div>
</template>
