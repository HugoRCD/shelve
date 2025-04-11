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
            class="z-10 flex size-12 items-center justify-center rounded-full border border-(--ui-border) bg-(--ui-bg-muted) p-2"
          >
            <Icon
              name="custom:shelve"
              size="24"
            />
          </div>
          <div
            ref="div2Ref"
            class="z-10 flex size-12 items-center justify-center rounded-full border border-(--ui-border) bg-(--ui-bg-muted) p-2"
          >
            <Icon
              name="simple-icons:github"
              size="24"
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
