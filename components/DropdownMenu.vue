<script setup lang="ts">
/*const props = defineProps({
  msg: {
    type: String,
    required: true
  }
});*/

const user = useSession().user;
const navigation = getNavigation("app");
</script>

<template>
  <HeadlessMenu as="div" class="relative inline-block text-left lg:hidden">
    <div>
      <HeadlessMenuButton class="inline-flex w-full justify-center rounded-md font-medium text-primary focus:outline-none">
        <span class="sr-only">Open menu</span>
        <img
          class="size-8 rounded-full"
          :src="user.avatar"
          alt="Profile picture"
        >
      </HeadlessMenuButton>
    </div>
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <HeadlessMenuItems
        class="absolute right-0 w-56 origin-top-right divide-y divide-gray-600 rounded-md bg-secondary shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        <div v-if="user" class="px-4 py-3">
          <p class="text-sm">
            Signed in as
          </p>
          <p class="truncate text-sm font-medium text-accent">
            {{ user.email }}
          </p>
        </div>
        <div>
          <HeadlessMenuItem v-for="item in navigation" v-slot="{ active }" :key="item.name">
            <NuxtLink
              :id="item.name.toLowerCase()"
              :to="item.to"
              :class="[active || item.name === $route.name ? 'bg-accent-faded text-accent' : 'text-primary', 'block w-full px-4 py-2 text-left text-sm']"
            >
              {{ item.name }}
            </NuxtLink>
          </HeadlessMenuItem>
        </div>
        <div>
          <HeadlessMenuItem v-slot="{ active }">
            <NuxtLink
              to="/app/settings"
              class="block w-full px-4 py-2 text-left text-sm text-primary"
              :class="active ? 'bg-accent-faded text-accent' : 'text-primary'"
            >
              Settings
            </NuxtLink>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }">
            <button
              class="block w-full px-4 py-2 text-left text-sm text-primary"
              :class="active ? 'bg-accent-faded text-accent' : 'text-red-600'"
              @click="useSession().clear()"
            >
              Logout
            </button>
          </HeadlessMenuItem>
        </div>
      </HeadlessMenuItems>
    </transition>
  </HeadlessMenu>
</template>

<style scoped>

</style>
