<script setup lang="ts">
defineProps({
  primaryColor: {
    type: String,
    default: '#ececec'
  },
  opacity: {
    type: [String, Number],
    default: null
  },
  groupOpacity: {
    type: [String, Number],
    default: '0.15'
  },
  useDefaultOpacity: {
    type: Boolean,
    default: true
  }
})
</script>

<template>
  <svg
    class="absolute top-0 inset-x-0 pointer-events-none"
    :class="{ 'opacity-30 dark:opacity-100': useDefaultOpacity }"
    :style="{ opacity: opacity }"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 1017 181"
  >
    <g :opacity="groupOpacity">
      <mask id="c" fill="#fff"><path d="M0 0h1017v181H0V0Z" /></mask>
      <path fill="url(#a)" fill-opacity=".5" d="M0 0h1017v181H0V0Z" />
      <path fill="url(#b)" d="M0 2h1017v-4H0v4Z" mask="url(#c)" />
    </g>
    <defs>
      <radialGradient
        id="a"
        cx="0"
        cy="0"
        r="1"
        gradientTransform="rotate(90.177 244.7795736 263.4645037) scale(161.501 509.002)"
        gradientUnits="userSpaceOnUse"
      >
        <stop :stop-color="primaryColor" />
        <stop offset="1" :stop-color="primaryColor" stop-opacity="0" />
      </radialGradient>
      <linearGradient
        id="b"
        x1="10.9784"
        x2="1017"
        y1="91"
        y2="90.502"
        gradientUnits="userSpaceOnUse"
      >
        <stop :stop-color="primaryColor" stop-opacity="0" />
        <stop offset=".395" :stop-color="primaryColor" />
        <stop offset="1" :stop-color="primaryColor" stop-opacity="0" />
      </linearGradient>
    </defs>
  </svg>
</template>
