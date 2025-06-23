<script setup lang="ts">

const reduceMotion = useCookie<boolean>('reduceMotion', {
  watch: true,
})

const autoUppercase = useCookie<boolean>('autoUppercase', {
  watch: true,
  default: () => true,
})

const syncWithGitHub = useCookie<boolean>('syncWithGitHub', {
  watch: true,
  default: () => false,
})

function setPrefersReducedMotion() {
  if (reduceMotion.value) {
    document.documentElement.setAttribute('data-reduce-motion', 'reduce')
  } else {
    document.documentElement.removeAttribute('data-reduce-motion')
  }
}

const themes = [
  {
    id: 'light',
    name: 'Shining Star',
    description: 'Shining Star theme is the theme for all people who like keeping it bright.',
    class: 'light'
  },
  {
    id: 'dark',
    name: 'Sideral Night',
    description: 'Sideral Night theme is the theme for all people who like keeping it dark.',
    class: 'dark'
  }
]

const settingsOptions = ref([
  {
    id: 'autoUppercase',
    title: 'Auto uppercase',
    description: 'Automatically uppercase the keys of the variables',
    modelValue: autoUppercase,
    stagger: 1
  },
  {
    id: 'syncWithGitHub',
    title: 'Sync with GitHub',
    description: 'Automatically sync environment variables with GitHub secrets by default',
    modelValue: syncWithGitHub,
    stagger: 2
  },
  {
    id: 'reduceMotion',
    title: 'Reduce Motion',
    description: 'Remove all transitions and animations from the site.',
    modelValue: reduceMotion,
    stagger: 3
  }
])

watch(reduceMotion, () => {
  setPrefersReducedMotion()
})

useSeoMeta({
  title: 'Settings',
})

definePageMeta({
  title: 'User Settings',
})
</script>

<template>
  <PageSection
    v-for="option in settingsOptions"
    :key="option.id"
    :title="option.title"
    :description="option.description"
    :stagger="option.stagger"
    class="border-b border-default pb-6"
  >
    <USwitch v-model="option.modelValue" />
  </PageSection>

  <PageSection
    title="Theme"
    description="Choose a theme for the app"
  >
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div
        v-for="theme in themes"
        :key="theme.id"
        :class="[
          theme.class,
          'flex cursor-pointer flex-col gap-2 rounded-lg border border-default bg-default p-4 shadow-md hover:bg-muted'
        ]"
        @click="$colorMode.preference = theme.id"
      >
        <h3 class="text-lg font-semibold text-highlighted">
          {{ theme.name }}
        </h3>
        <p class="text-sm text-muted">
          {{ theme.description }}
        </p>
        <div class="mt-2 flex flex-col gap-1">
          <div class="flex gap-2">
            <div class="h-3 w-1/2 rounded-full bg-elevated" />
            <div class="h-3 w-1/4 rounded-full bg-elevated" />
          </div>
          <div class="flex gap-2">
            <div class="h-3 w-1/4 rounded-full bg-elevated" />
            <div class="h-3 w-1/2 rounded-full bg-elevated" />
          </div>
        </div>
      </div>
    </div>
  </PageSection>
</template>
