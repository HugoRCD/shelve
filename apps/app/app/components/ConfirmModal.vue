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
  <UModal>
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">
          {{ title }}
        </h3>
      </template>
      <div class="text-gray-300">
        {{ description }}
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="gray" @click="onCancel">
            Cancel
          </UButton>
          <UButton :color="danger ? 'red' : 'primary'" @click="onSuccess">
            Confirm
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

