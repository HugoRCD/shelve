<script setup lang="ts">
const key = defineModel({ type: String })

const { x, y } = useMouse()
const { y: windowY } = useWindowScroll()

const isOpen = ref(false)
const virtualElement = ref({ getBoundingClientRect: () => ({}) })

function onContextMenu () {
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

function addPrefixToInputId (prefix: string) {
  if (key.value?.startsWith(prefix)) return
  key.value = `${prefix}_${key.value}`
}
</script>

<template>
  <div class="w-full" @contextmenu.prevent="onContextMenu">
    <div>
      <slot />
    </div>

    <UContextMenu v-model="isOpen" :virtual-element="virtualElement">
      <div class="p-4">
        <UButton @click="addPrefixToInputId('NUXT_PRIVATE')">
          Add NUXT_PRIVATE_
        </UButton>
      </div>
    </UContextMenu>
  </div>
</template>

