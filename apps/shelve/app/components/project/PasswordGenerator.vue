<script setup lang="ts">
const length = ref(25)
const includeSymbols = ref(true)
const isOpen = ref(false)

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

const items = [
  [
    {
      label: 'Copy to clipboard',
    },
  ],
]
</script>

<template>
  <UPopover v-model:open="isOpen" arrow>
    <div>
      <UTooltip :content="{ side: 'top' }" text="Generate a random password">
        <UButton variant="soft" color="neutral" icon="lucide:lock-keyhole" />
      </UTooltip>
    </div>
    <template #content>
      <div class="w-72 flex flex-col gap-4 p-4">
        <h3 class="text-sm font-semibold">
          Generate Password
        </h3>
        <form class="flex flex-col gap-4" @submit.prevent="generatePassword">
          <UFormField :label="`Password Length (${length})`">
            <USlider v-model="length" :min="5" :max="35" />
          </UFormField>
          <UCheckbox v-model="includeSymbols" label="Include Symbols" />
          <UDivider />
          <UButton label="Generate" type="submit" />
        </form>
      </div>
    </template>
  </UPopover>
</template>
