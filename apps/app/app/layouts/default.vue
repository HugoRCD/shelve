<template>
  <div class="relative flex h-screen flex-col">
    <LayoutNavbar />
    <div class="mt-14 flex-1">
      <slot />
    </div>
    <LayoutFooter />
  </div>
</template>
