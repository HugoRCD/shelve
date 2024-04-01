<script setup>
const props = defineProps({
  label: String,
})

const displayText = ref(props.label)
const charset = 'abcdefghijklmnopqrstuvwxyz'

function randomChars(length) {
  return Array.from(
    { length },
    () => charset[Math.floor(Math.random() * charset.length)]
  ).join('')
}

async function scramble(input) {
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
  <span @mouseover="startScrambling">
    {{ displayText }}
  </span>
</template>

