<script setup lang="ts">

const reduceMotion = useCookie<boolean>('reduceMotion', {
  watch: true,
})

const autoUppercase = useCookie<boolean>('autoUppercase', {
  watch: true,
  default: () => true,
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
    id: 'reduceMotion',
    title: 'Reduce Motion',
    description: 'Remove all transitions and animations from the site.',
    modelValue: reduceMotion,
    stagger: 2
  }
])

watch(reduceMotion, () => {
  setPrefersReducedMotion()
})
</script>

<template>
  <div class="flex flex-col gap-4 pb-4">
    <template v-for="option in settingsOptions" :key="option.id">
      <div :style="`--stagger: ${option.stagger}`" data-animate class="flex flex-col gap-3">
        <LayoutSectionHeader :title="option.title" :description="option.description" />
        <USwitch v-model="option.modelValue" />
      </div>
      <USeparator class="my-4" />
    </template>

    <div style="--stagger: 3" data-animate class="flex flex-col gap-3">
      <LayoutSectionHeader title="Theme" description="Choose a theme for the app" />
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div
          v-for="theme in themes"
          :key="theme.id"
          :class="[
            theme.class,
            'flex cursor-pointer flex-col gap-2 rounded-lg border border-(--ui-border) bg-(--ui-bg) p-4 shadow-md hover:bg-(--ui-bg-muted)'
          ]"
          @click="$colorMode.preference = theme.id"
        >
          <h3 class="text-lg font-semibold text-(--ui-text-highlighted)">
            {{ theme.name }}
          </h3>
          <p class="text-sm text-(--ui-text-muted)">
            {{ theme.description }}
          </p>
          <div class="mt-2 flex flex-col gap-1">
            <div class="flex gap-2">
              <div class="h-3 w-1/2 rounded-full bg-(--ui-bg-elevated)" />
              <div class="h-3 w-1/4 rounded-full bg-(--ui-bg-elevated)" />
            </div>
            <div class="flex gap-2">
              <div class="h-3 w-1/4 rounded-full bg-(--ui-bg-elevated)" />
              <div class="h-3 w-1/2 rounded-full bg-(--ui-bg-elevated)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
