<script setup lang="ts">
type VariableInputProps = {
  type?: 'key' | 'value'
}

const { type = 'value' } = defineProps<VariableInputProps>()

const model = defineModel({ type: String })

const show = ref(false)

const copied = ref(false)

function copy() {
  if (!model.value) return
  copyToClipboard(model.value, 'Copied to clipboard')
  copied.value = true

  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <UInput
    v-model="model"
    placeholder="Password"
    :type="type === 'key' ? 'text' : show ? 'text' : 'password'"
    :variant="type === 'key' ? 'ghost' : 'soft'"
    :ui="{ trailing: 'pe-1', base: 'pe-16' }"
  >
    <template v-if="model?.length" #trailing>
      <div>
        <UButton
          v-if="type === 'value'"
          color="neutral"
          variant="link"
          size="sm"
          :icon="show ? 'lucide:eye-off' : 'lucide:eye'"
          aria-label="show ? 'Hide password' : 'Show password'"
          :aria-pressed="show"
          aria-controls="password"
          @click="show = !show"
        />
        <UTooltip
          :text="`Copy ${type === 'key' ? 'key' : 'value'} to clipboard`"
          :content="{ side: 'top' }"
        >
          <UButton
            :color="copied ? 'success' : 'neutral'"
            variant="link"
            size="sm"
            :icon="copied ? 'lucide:copy-check' : 'lucide:copy'"
            aria-label="Copy to clipboard"
            @click="copy"
          />
        </UTooltip>
      </div>
    </template>
  </UInput>
</template>

