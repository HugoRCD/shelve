<script setup lang="ts">
const headlines: Record<string, string> = {
  morning: 'Secure your build this morning.',
  afternoon: 'Streamline your workflow this afternoon.',
  evening: 'Ensure overnight builds run smoothly.',
  default: 'Manage secrets effectively, anytime.'
}

const userTimeSegment = useCookie<string | undefined>('userTimeSegment')

const timeSensitiveHeadline = computed(() => {
  const segment = userTimeSegment.value
  if (segment && headlines[segment]) {
    return headlines[segment]
  }
  return headlines.default
})
</script>

<template>
  <UPageCTA
    :title="timeSensitiveHeadline"
    description="Imagine your workflow, just smoother and more secure. That’s the developer experience Shelve is built to deliver."
    class="relative rounded-none"
    :ui="{ links: 'gap-2' }"
  >
    <div class="absolute bg-stripes inset-0 opacity-30 -z-10" />
    <template #title>
      <span class="main-gradient">
        {{ timeSensitiveHeadline }}
      </span>
    </template>
    <template #links>
      <CustomButton label="Get Started" to="https://app.shelve.cloud" />
      <UButton label="Self-Host" to="/docs/self-hosting/docker" icon="simple-icons:docker" variant="ghost" />
    </template>
  </UPageCTA>
</template>
