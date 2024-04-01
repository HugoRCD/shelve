<template>
  <div class="relative flex h-screen flex-col">
    <LayoutNavbar />
    <div class="flex-1">
      <slot />
    </div>
    <LayoutFooter />
  </div>
</template>
