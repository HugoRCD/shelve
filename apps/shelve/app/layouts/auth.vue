<template>
  <div class="relative flex h-full flex-col">
    <div class="absolute top-4 right-4 opacity-50">
      <SettingThemeToggle />
    </div>
    <div class="flex-1">
      <slot />
    </div>
    <div>
      <Divider />
      <footer class="mx-auto flex max-w-7xl flex-col items-center justify-around gap-4 px-4 py-6 sm:flex-row">
        <div class="flex items-center text-muted gap-4">
          <span class="text-sm flex items-center">
            Want to go back to homepage ?
            <UButton
              variant="link"
              icon="nucleo:house"
              :ui="{ leadingIcon: 'size-4' }"
              label="Click Here"
              to="https://shelve.cloud"
            />
          </span>
        </div>
      </footer>
    </div>
  </div>
</template>
