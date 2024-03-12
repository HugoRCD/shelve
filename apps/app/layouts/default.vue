<template>
  <div class="relative flex h-screen flex-col">
    <Noise />
    <div class="z-20 flex-1">
      <slot />
    </div>
    <LayoutFooter />
  </div>
</template>
