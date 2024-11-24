<script setup lang="ts">
const toTest = ref(JSON.stringify({
  foo: 'bar',
  bar: [1, 2, 3],
}))

async function test() {
  await $fetch('/api/test', {
    method: 'POST',
    body: {
      toTest: toTest.value,
    }
  })
}
</script>

<template>
  <div>
    <h1>
      Encrypt/Decrypt
    </h1>
    <textarea v-model="toTest" />
    <br>
    <button @click="test">
      Test
    </button>
  </div>
</template>
