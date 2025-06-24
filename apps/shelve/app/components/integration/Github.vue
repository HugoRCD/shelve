<script setup lang="ts">
interface Props {
  onConnected: () => void
}

const props = defineProps<Props>()

const features = [
  'Automatically sync secrets to GitHub',
  'Secure repository access management',
  'Keep CI/CD pipelines up to date'
]
</script>

<template>
  <IntegrationBase
    type="github"
    name="GitHub"
    icon="simple-icons:github"
    :features
    :on-connected="props.onConnected"
  />
</template> 
