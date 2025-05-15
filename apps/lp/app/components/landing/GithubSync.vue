<script setup lang="ts">
const containerRef = ref(null)
const div1Ref = ref(null)
const div2Ref = ref(null)
</script>

<template>
  <ClientOnly>
    <div
      ref="containerRef"
      class="relative flex w-full items-center justify-center overflow-hidden p-10"
    >
      <div class="flex size-full flex-col items-stretch justify-between gap-5">
        <div class="flex flex-row justify-between">
          <div
            ref="div1Ref"
            class="z-10 flex size-12 items-center justify-center rounded-full border border-default bg-muted p-2 ring ring-default ring-offset-2 ring-offset-(--ui-bg)"
          >
            <Icon
              name="custom:shelve"
              size="24"
              class="animate-pulse"
            />
          </div>
          <div
            ref="div2Ref"
            class="z-10 flex size-12 items-center justify-center rounded-full border border-default bg-muted p-2 ring ring-default ring-offset-2 ring-offset-(--ui-bg)"
          >
            <Icon
              name="simple-icons:github"
              size="24"
              class="animate-pulse"
            />
          </div>
        </div>
      </div>

      <AnimatedBeam
        :container-ref
        :from-ref="div1Ref"
        :to-ref="div2Ref"
        :curvature="-50"
      />
      <AnimatedBeam
        :container-ref
        :from-ref="div1Ref"
        :to-ref="div2Ref"
        :curvature="50"
        :reverse="true"
      />
    </div>
  </ClientOnly>
</template>
