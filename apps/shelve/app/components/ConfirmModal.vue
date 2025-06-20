<script lang="ts" setup>
type ConfirmModalProps = {
  title: string
  description?: string
  danger?: boolean
}

defineProps<ConfirmModalProps>()

const emit = defineEmits<{ close: [boolean], success: [void], cancel: [void] }>()

function onSuccess() {
  emit('success')
  emit('close', false)
}

function onCancel() {
  emit('close', false)
}
</script>

<template>
  <UModal 
    :close="{ onClick: onCancel }"
    :title
    :description
    :ui="{
      overlay: 'bg-default/10 backdrop-blur-sm',
    }"
  >
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton variant="ghost" @click="onCancel">
          Cancel
        </UButton>
        <UButton :color="danger ? 'error' : 'primary'" @click="onSuccess">
          Confirm
        </UButton>
      </div>
    </template>
  </UModal>
</template>

