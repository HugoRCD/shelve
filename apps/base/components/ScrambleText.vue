<script setup lang="ts">
const props = defineProps<{
  label: string
}>()

const displayText = ref(props.label)
const charset = 'abcdefghijklmnopqrstuvwxyz1234567890'

function randomChars(length: number) {
  return Array.from(
    { length },
    () => charset[Math.floor(Math.random() * charset.length)]
  ).join('')
}

async function scramble(input: string) {
  let prefix = ''
  for (let index = 0; index < input.length; index++) {
    await new Promise((resolve) => setTimeout(resolve, 50))
    prefix += input.charAt(index)
    displayText.value = prefix + randomChars(input.length - prefix.length)
  }
}

const startScrambling = () => {
  scramble(props.label)
  setTimeout(() => props.label.length * 50)
}
startScrambling()
</script>

<template>
  <span class="font-mono" @mouseover="startScrambling">
    {{ displayText }}
  </span>
</template>

