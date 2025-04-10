<script setup lang="ts">
const {
  color = '#46afc8'
} = defineProps<{
  color?: string
}>()

const bloomTextEl = ref(null)

const calculateBloomColors = (baseColor: string) => {
  if (!baseColor) return null

  const lighten = (hex: string, amount: number) => {
    let r = parseInt(hex.slice(1, 3), 16)
    let g = parseInt(hex.slice(3, 5), 16)
    let b = parseInt(hex.slice(5, 7), 16)

    r = Math.min(255, r + Math.floor((255 - r) * amount))
    g = Math.min(255, g + Math.floor((255 - g) * amount))
    b = Math.min(255, b + Math.floor((255 - b) * amount))

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  return {
    base: baseColor,
    light: lighten(baseColor, 0.60),
    medium: lighten(baseColor, 0.3),
    dark: lighten(baseColor, 0.1)
  }
}

const applyBloomEffect = (el: HTMLElement | null) => {
  if (!el) return

  const text = el.textContent || ''
  el.innerHTML = ''

  if (color) {
    const colors = calculateBloomColors(color)
    if (colors) {
      el.style.setProperty('--bloom-color-base', colors.base)
      el.style.setProperty('--bloom-color-light', colors.light)
      el.style.setProperty('--bloom-color-medium', colors.medium)
      el.style.setProperty('--bloom-color-dark', colors.dark)
    }
  }

  Array.from(text).forEach((char, i) => {
    const span = document.createElement('span')
    span.className = 'bloom-char'
    span.style.setProperty('--i', i.toString())

    if (char === ' ') {
      span.innerHTML = '&nbsp;'
    } else {
      span.textContent = char
    }

    el.appendChild(span)
  })
}

onMounted(() => {
  applyBloomEffect(bloomTextEl.value)
})

watch(() => color, () => {
  applyBloomEffect(bloomTextEl.value)
})
</script>

<template>
  <div ref="bloomTextEl" class="text-(--ui-primary) text-base font-semibold [transform-style:preserve-3d]" :data-color="color">
    <slot>Generating summary...</slot>
  </div>
</template>

<style>
@import 'tailwindcss';

.bloom-char {
  @apply relative inline-block [transform-style:preserve-3d] [transform-origin:100%_50%] [letter-spacing:0.01em];
  transition: all 0.3s ease;
  animation: var(--animate-bloom);
  animation-delay: calc(var(--i, 0) * 0.05s);
}

@keyframes bloom {
  0% {
    transform: translate3D(0,0,0) scale(1) rotateY(0);
    color: var(--bloom-color-base);
    text-shadow: 0 0 0 rgba(var(--bloom-color-base), 0);
  }
  12% {
    transform: translate3D(2px,-1px,2px) scale(1.4) rotateY(6deg);
    color: var(--bloom-color-light);
  }
  15% {
    text-shadow: 0 0 1px var(--bloom-color-medium);
  }
  24% {
    transform: translate3D(0,0,0) scale(1) rotateY(0);
    color: var(--bloom-color-dark);
    opacity: 1;
  }
  36% {
    transform: translate3D(0,0,0) scale(1);
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

</style>
