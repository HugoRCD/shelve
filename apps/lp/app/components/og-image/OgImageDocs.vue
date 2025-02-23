<script setup lang="ts">
defineOptions({
  inheritAttrs: false
})

const { headline = '' } = defineProps<{
  title?: string
  description?: string
  headline?: string
}>()
</script>

<template>
  <div class="size-full flex justify-center items-center bg-neutral-950 text-white p-10" style="background-image: url(/og-bg.png)">
    <div class="relative size-full flex flex-row border-neutral-700 p-8 items-center justify-around">
      <div>
        <p v-if="headline" class="uppercase text-[24px] mb-4 font-semibold">
          {{ headline }}
        </p>
        <h1 class="m-0 text-[75px] font-semibold mb-2 flex items-center">
          <span>{{ title }}</span>
        </h1>
        <p v-if="description" class="text-[32px] text-neutral-400 leading-tight text-balance max-w-4xl">
          {{ description.slice(0, 200) }}
        </p>
      </div>

      <UIcon name="custom:shelve" mode="svg" class="w-[210px] h-[140px]" />
    </div>
    <!--    <svg
      class="absolute right-0 top-0"
      width="629"
      height="593"
      viewBox="0 0 629 593"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_f_199_94966)">
        <path
          d="M628.5 -578L639.334 -94.4223L806.598 -548.281L659.827 -87.387L965.396 -462.344L676.925 -74.0787L1087.69 -329.501L688.776 -55.9396L1160.22 -164.149L694.095 -34.9354L1175.13 15.7948L692.306 -13.3422L1130.8 190.83L683.602 6.50012L1032.04 341.989L668.927 22.4412L889.557 452.891L649.872 32.7537L718.78 511.519L628.5 36.32L538.22 511.519L607.128 32.7537L367.443 452.891L588.073 22.4412L224.955 341.989L573.398 6.50012L126.198 190.83L564.694 -13.3422L81.8734 15.7948L562.905 -34.9354L96.7839 -164.149L568.224 -55.9396L169.314 -329.501L580.075 -74.0787L291.604 -462.344L597.173 -87.387L450.402 -548.281L617.666 -94.4223L628.5 -578Z"
          fill="white"
        />
      </g>
      <defs>
        <filter
          id="filter0_f_199_94966"
          x="0.873535"
          y="-659"
          width="1255.25"
          height="1251.52"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="40.5" result="effect1_foregroundBlur_199_94966" />
        </filter>
      </defs>
    </svg>-->

    <!--    <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 717 488">
      <path
        d="M700.867 0L577.808 142.717C563.922 158.728 542.573 168.197 519.836 168.197H388.098C379.94 168.197 373.518 162.343 373.518 155.113V110.696C373.518 98.3011 355.814 92.9643 347.309 102.777L182.593 293.698C168.708 309.709 147.359 319.177 124.622 319.177H0L253.583 25.4791C267.468 9.46859 288.817 0 311.554 0H700.867Z"
      />
      <path
        d="M15.4475 487.374L138.507 344.657C152.393 328.646 173.742 319.177 196.479 319.177H328.217C336.375 319.177 342.797 325.031 342.797 332.261V376.678C342.797 389.073 360.501 394.41 369.005 384.597L533.721 193.676C547.607 177.665 568.956 168.197 591.693 168.197H716.141L462.559 461.895C448.673 477.905 427.324 487.374 404.587 487.374H15.4475Z"
      />
    </svg>-->
  </div>
</template>

<style scoped>
.cross:before {
  content: "";
  width: 1px;
  height: 9px;
  position: absolute;
  top: -4px;
}

.cross:after {
  content: "";
  width: 9px;
  height: 1px;
  position: absolute;
  left: -4px;
}
</style>
