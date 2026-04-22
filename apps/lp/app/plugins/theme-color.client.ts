import colors from 'tailwindcss/colors'

export default defineNuxtPlugin(() => {
  const appConfig = useAppConfig()
  const colorMode = useColorMode()

  const neutral = (appConfig.ui as { colors?: { neutral?: string } })?.colors?.neutral ?? 'neutral'
  const color = computed(() =>
    colorMode.value === 'dark'
      ? (colors as Record<string, Record<string, string>>)[neutral]?.[950] ?? 'black'
      : 'white',
  )

  useHead({
    meta: [{ key: 'theme-color', name: 'theme-color', content: color },],
  })
})
