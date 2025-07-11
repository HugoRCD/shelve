<script setup lang="ts">
interface Props {
  onConnected: () => void
}

const props = defineProps<Props>()

const features = [
  'Automatically sync environment variables to Vercel',
  'Deploy with up-to-date configurations',
  'Keep projects synchronized'
]
</script>

<template>
  <IntegrationBase
    type="vercel"
    name="Vercel"
    icon="simple-icons:vercel"
    :features
    :on-connected="props.onConnected"
  />
</template> 
