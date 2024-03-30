<template>
  <ClientOnly>
    <button
      :class="[$colorMode.value === 'light' ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid', size]"
      aria-label="Theme"
      @click="startViewTransition($colorMode.value === 'light' ? 'dark' : 'light')"
    />
    <template #fallback>
      <div :class="size" />
    </template>
  </ClientOnly>
</template>

<script setup>
defineProps({
  size: {
    type: String,
    default: 'size-4'
  }
})

const colorMode = useColorMode()

const switchTheme = () => {
  colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
  colorMode.preference = colorMode.value
}

function startViewTransition(theme) {
  if (theme === colorMode.value) return
  if (!document.startViewTransition) {
    switchTheme()
    return
  }
  if (window.innerWidth < 768) {
    switchTheme()
    return
  }
  document.startViewTransition(switchTheme)
}
</script>

<style>
/* Dark/Light reveal effect */
::view-transition-group(root) {
  animation-duration: 1.5s;
}
::view-transition-new(root),
::view-transition-old(root) {
  mix-blend-mode: normal;
}

::view-transition-new(root) {
  animation-name: reveal-light;
}

::view-transition-old(root),
.dark::view-transition-old(root) {
  animation: none;
}
.dark::view-transition-new(root) {
  animation-name: reveal-dark;
}

@keyframes reveal-dark {
  from {
    clip-path: polygon(-30% 0, -30% 0, -15% 100%, -10% 115%);
  }
  to {
    clip-path: polygon(-30% 0, 130% 0, 115% 100%, -10% 115%);
  }
}

@keyframes reveal-light {
  from {
    clip-path: polygon(130% 0, 130% 0, 115% 100%, 110% 115%);
  }
  to {
    clip-path: polygon(130% 0, -30% 0, -15% 100%, 110% 115%);
  }
}
</style>
