<script setup lang="ts">
import { ref } from 'vue'

const length = ref(8)
const includeSymbols = ref(false)
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
  <div @contextmenu.prevent="onContextMenu">
    <UContextMenu v-model="isOpen" :virtual-element>
      <UCard>
        <template #header>
          <h3 class="text-sm font-semibold">
            Generate Password
          </h3>
        </template>
        <form @submit.prevent="generatePassword">
          <label for="length">Password Length:</label>
          <input v-model="length" type="number" min="1" max="25" required>

          <label for="includeSymbols">Include Symbols:</label>
          <input v-model="includeSymbols" type="checkbox">

          <button type="submit">
            Generate Password
          </button>
        </form>
      </UCard>
    </UContextMenu>
  </div>
</template>
