<script setup lang="ts">
const route = useRoute()
const projectId = route.params.projectId as string
const variables = useVariables(projectId)
const selectedVariables = useSelectedVariables(projectId)

function selectAll() {
  selectedVariables.value = variables.value
}

function deselectAll() {
  selectedVariables.value = []
}
</script>

<template>
  <CommandButton
    icon="lucide:text-select"
    label="Select all variables"
    @click="selectAll()"
  />
</template>
