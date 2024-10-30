<script setup lang="ts">
const length = ref(25)
const includeSymbols = ref(true)
const isOpen = ref(false)
const virtualElement = ref({ getBoundingClientRect: () => ({}) })

const emit = defineEmits(['passwordGenerated'])

function generatePassword() {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-='
  let characters = charset
  if (includeSymbols.value) {
    characters += symbols
  }

  let password = ''
  for (let i = 0; i < length.value; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    password += characters[randomIndex]
  }

  emit('passwordGenerated', password)
}

function onContextMenu(event: MouseEvent) {
  const top = event.clientY
  const left = event.clientX

  virtualElement.value.getBoundingClientRect = () => ({
    width: 0,
    height: 0,
    top,
    left
  })

  isOpen.value = true
}
</script>

<template>
  <div class="w-full" @contextmenu.prevent="onContextMenu">
    <div>
      <slot />
    </div>

    <UContextMenu v-model="isOpen" :virtual-element>
      <UCard :ui="{ base: 'w-72' }">
        <template #header>
          <h3 class="text-sm font-semibold">
            Generate Password
          </h3>
        </template>
        <form class="flex flex-col gap-4" @submit.prevent="generatePassword">
          <UFormField :label="`Password Length (${length})`">
            <URange v-model="length" :min="5" :max="35" />
          </UFormField>
          <UCheckbox v-model="includeSymbols" label="Include Symbols" />
          <UDivider />
          <UButton label="Generate" type="submit" />
        </form>
      </UCard>
    </UContextMenu>
  </div>
</template>
