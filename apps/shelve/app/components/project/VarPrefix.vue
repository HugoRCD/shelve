<script setup lang="ts">
import type { Project } from '@shelve/types'
import type { Ref } from 'vue'

const project = inject('project') as Ref<Project>

const prefixList = computed(() => {
  return project.value.variablePrefix?.replace(/\s/g, '').split(',')
})

const key = defineModel({ type: String })

const isOpen = ref(false)

function addPrefixToInputId(prefix: string) {
  if (key.value?.startsWith(prefix)) return
  key.value = `${prefix}${key.value}`
}
</script>

<template>
  <UPopover v-model:open="isOpen">
    <div class="w-full">
      <div>
        <slot />
      </div>
    </div>
    <template #content>
      <div class="p-4 flex flex-col gap-2">
        <h3 class="text-sm font-semibold">
          Add Prefix to your variable
        </h3>
        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="prefix in prefixList"
            :key="prefix"
            size="xs"
            variant="soft"
            color="neutral"
            icon="heroicons:plus"
            :label="prefix"
            @click="addPrefixToInputId(prefix)"
          />
        </div>
      </div>
    </template>
  </UPopover>
</template>

