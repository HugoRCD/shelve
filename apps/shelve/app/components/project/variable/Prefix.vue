<script setup lang="ts">
import type { Project } from '@shelve/types'
import type { Ref } from 'vue'

const project = inject('project') as Ref<Project>

const prefixList = computed(() => {
  return project.value.variablePrefix?.replace(/\s/g, '').split(',').filter(Boolean) || []
})

const key = defineModel({ type: String })

const open = ref(false)

function addPrefixToInputId(prefix: string) {
  if (key.value?.startsWith(prefix)) return
  key.value = `${prefix}${key.value}`
  open.value = false
}
</script>

<template>
  <UPopover v-model:open="open" arrow>
    <div>
      <UTooltip :content="{ side: 'top' }" text="Add common prefix to your variable">
        <UButton variant="soft" color="neutral" icon="lucide:list-start" />
      </UTooltip>
    </div>
    <template #content>
      <div class="p-4 flex w-full flex-col gap-3">
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
        <NuxtLink :to="`/project/${project.id}/settings#variable-prefix`" class="text-xs text-neutral-500 dark:text-neutral-400 flex gap-1 hover:underline">
          Create variable prefix
          <UIcon name="lucide:external-link" class="mt-0.5" />
        </NuxtLink>
      </div>
    </template>
  </UPopover>
</template>

