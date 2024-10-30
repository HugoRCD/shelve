<script lang="ts" setup>
type ConfirmModalProps = {
  title: string
  description?: string
  danger?: boolean
}

defineProps<ConfirmModalProps>()

const modal = useModal()
const emit = defineEmits(['success', 'cancel'])

function onSuccess() {
  emit('success')
  modal.close()
}

function onCancel() {
  modal.close()
}
</script>

<template>
  <UModal :title :description>
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton variant="ghost" color="neutral" @click="onCancel">
          Cancel
        </UButton>
        <UButton :color="danger ? 'error' : 'primary'" @click="onSuccess">
          Confirm
        </UButton>
      </div>
    </template>
  </UModal>
</template>

