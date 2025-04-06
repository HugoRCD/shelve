<script setup lang="ts">
import colors from 'tailwindcss/colors'

const { title: appTitle, link, description: appDescription, ogImage } = useAppConfig()

const {
  title,
  description,
  defaultOgImage = true,
  titleTemplate
} = defineProps<{
  defaultOgImage?: boolean,
  title?: string,
  titleTemplate?: string,
  description?: string,
}>()

const appConfig = useAppConfig()
const colorMode = useColorMode()
const color = computed(() => colorMode.value === 'dark' ? (colors as any)[appConfig.ui.colors.neutral][950] : 'white')

useHead({
  title: title || appTitle,
  titleTemplate: titleTemplate || `%s | ${appTitle}`,
  link: link,
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ]
})

const seoMetadata = ref({
  title: title || appTitle,
  description: description || appDescription,
  author: 'Hugo Richard',
  twitterCreator: '@HugoRCD__',
  twitterTitle: title || appTitle,
  twitterDescription: description || appDescription,
  twitterCard: 'summary_large_image',
  ogUrl: 'https://shelve.cloud',
  ogSiteName: title || appTitle,
  ogTitle: title || appTitle,
  ogDescription: description || appDescription,
})

if (defaultOgImage) {
  seoMetadata.value.twitterImage = ogImage
  seoMetadata.value.ogImage = ogImage
}

useSeoMeta(seoMetadata.value)
</script>

<template>
  <div>
    <div style="width: 0; height: 0; position: absolute; overflow: hidden;">
      <svg aria-hidden="true"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="6.3" numOctaves="6" stitchTiles="stitch" /></filter></svg><svg
        width="24"
        height="24"
        viewBox="0 0 26 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style="width: 0; height: 0;"
      >
        <clipPath id="symbol-clip"><path fill-rule="evenodd" clip-rule="evenodd" d="M13 26C20.1797 26 26 20.1797 26 13C26 5.8203 20.1797 0 13 0C5.8203 0 0 5.8203 0 13C0 13.1005 0.00114086 13.2008 0.00341035 13.3007C6.19265 14.5586 10.9974 19.6274 11.8612 25.9508C12.2365 25.9834 12.6163 26 13 26Z" /></clipPath><clipPath id="symbol-flat-clip"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 21.6255C4.71779 19.1857 5.7265 16.2106 5.7265 13C5.7265 9.78937 4.71779 6.81433 3 4.37452C5.38146 1.69104 8.8565 0 12.7265 0C19.9062 0 25.7265 5.8203 25.7265 13C25.7265 20.1797 19.9062 26 12.7265 26C8.8565 26 5.38146 24.309 3 21.6255Z" /></clipPath>
      </svg><svg>
        <defs>
          <linearGradient
            id="graphEmptyGradient"
            x1="9"
            y1="0"
            x2="9"
            y2="117"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="white" stop-opacity="0" /><stop offset="0.170717" stop-color="white" stop-opacity="0.33" /><stop offset="1" stop-color="white" />
          </linearGradient>
        </defs><defs>
          <linearGradient
            id="graphEmptyGradientNegative"
            x1="9"
            y1="0"
            x2="9"
            y2="117"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="white" /><stop offset="0.170717" stop-color="white" stop-opacity="0.33" /><stop offset="1" stop-color="white" stop-opacity="0" />
          </linearGradient>
        </defs><defs>
          <linearGradient
            id="graphDefault"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#B3AEF5" /><stop offset="43%" stop-color="#D7CBE7" /><stop offset="65%" stop-color="#E5C8C8" /><stop offset="100%" stop-color="#ECBDAA" />
          </linearGradient>
        </defs><defs><linearGradient id="sparkDefault" x1="0%" y1="0%" x2="100%" y2="0%"><stop stop-color="#B3AEF5" /><stop offset="43%" stop-color="#D7CBE7" /><stop offset="65%" stop-color="#E5C8C8" /><stop offset="100%" stop-color="#ECBDAA" /></linearGradient></defs><defs><linearGradient id="sparkAreaDefault" x1="0%" y1="0%" x2="0%" y2="100%"><stop stop-color="rgba(230, 197, 195, 0.2)" /><stop offset="100%" stop-color="rgba(230, 197, 195, 0)" /></linearGradient></defs><defs><linearGradient id="sparkIdea" x1="0%" y1="0%" x2="100%" y2="0%"><stop stop-color="#1964BB" /><stop offset="1" stop-color="#55BBF7" /></linearGradient></defs><defs><linearGradient id="sparkPositive" x1="0%" y1="0%" x2="0%" y2="100%"><stop stop-color="#4EBE96" /><stop offset="0.352563" stop-color="#44B48C" /><stop offset="0.598296" stop-color="#3DC1B9" /><stop offset="1" stop-color="#3EC6D9" /></linearGradient></defs><defs><linearGradient id="sparkPositiveArea" x1="0%" y1="0%" x2="0%" y2="100%"><stop stop-color="#4EBE96" stop-opacity="0.23" /><stop offset="1" stop-color="#4EBE96" stop-opacity="0" /></linearGradient></defs><defs><linearGradient id="sparkNegative" x1="0%" y1="0%" x2="0%" y2="100%"><stop stop-color="#D84F68" /><stop offset="1" stop-color="#9F2A4D" /></linearGradient></defs><defs><linearGradient id="sparkNegativeArea" x1="0%" y1="0%" x2="0%" y2="100%"><stop stop-color="#FF5C5C" stop-opacity="0.23" /><stop offset="1" stop-color="#FF5C5C" stop-opacity="0" /></linearGradient></defs>
      </svg>
    </div>
  </div>
</template>
