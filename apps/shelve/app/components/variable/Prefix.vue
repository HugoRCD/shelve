<script setup lang="ts">
const route = useRoute()
const projectId = route.params.projectId as string
const teamSlug = route.params.teamSlug as string
const project = useProject(projectId)

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
        <UButton variant="soft" icon="lucide:list-start" />
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
            icon="heroicons:plus"
            :label="prefix"
            @click="addPrefixToInputId(prefix)"
          />
        </div>
        <NuxtLink :to="`/${teamSlug}/projects/${project.id}/settings#variable-prefix`" class="text-xs text-(--ui-text-muted) flex gap-1 hover:underline">
          Create variable prefix
          <UIcon name="lucide:external-link" class="mt-0.5" />
        </NuxtLink>
      </div>
    </template>
  </UPopover>
</template>

