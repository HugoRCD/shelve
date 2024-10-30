<script setup lang="ts">
import type { Project } from '@shelve/types'
import type { Ref } from 'vue'

const project = inject('project') as Ref<Project>

const prefixList = computed(() => {
  return project.value.variablePrefix?.replace(/\s/g, '').split(',')
})

const key = defineModel({ type: String })

const { x, y } = useMouse()
const { y: windowY } = useWindowScroll()

const isOpen = ref(false)
const virtualElement = ref({ getBoundingClientRect: () => ({}) })

function onContextMenu() {
  const top = unref(y) - unref(windowY)
  const left = unref(x)

  virtualElement.value.getBoundingClientRect = () => ({
    width: 0,
    height: 0,
    top,
    left
  })

  isOpen.value = true
}

function addPrefixToInputId(prefix: string) {
  if (key.value?.startsWith(prefix)) return
  key.value = `${prefix}${key.value}`
}
</script>

<template>
  <div class="w-full" @contextmenu.prevent="onContextMenu">
    <div>
      <slot />
    </div>

    <UContextMenu v-model="isOpen" :virtual-element>
      <UCard>
        <template #header>
          <h3 class="text-sm font-semibold">
            Add Prefix to your variable
          </h3>
        </template>
        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="prefix in prefixList"
            :key="prefix"
            color="neutral"
            icon="heroicons:plus"
            :label="prefix"
            @click="addPrefixToInputId(prefix)"
          />
        </div>
      </UCard>
    </UContextMenu>
  </div>
</template>

