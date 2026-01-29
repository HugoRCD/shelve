<script setup lang="ts">
interface Props {
  date: Date | string
  label?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Date',
  placement: 'bottom'
})

const dateObj = computed(() => {
  return typeof props.date === 'string' ? new Date(props.date) : props.date
})

const rtf = new Intl.RelativeTimeFormat('en-US', {
  numeric: 'auto',
  style: 'short'
})

function getRelativeTime(date: Date) {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  const absDiffMs = Math.abs(diffMs)
  const seconds = Math.floor(absDiffMs / 1000)
  const minutes = Math.floor(absDiffMs / (1000 * 60))
  const hours = Math.floor(absDiffMs / (1000 * 60 * 60))
  const days = Math.floor(absDiffMs / (1000 * 60 * 60 * 24))
  const weeks = Math.floor(absDiffMs / (1000 * 60 * 60 * 24 * 7))
  const months = Math.floor(absDiffMs / (1000 * 60 * 60 * 24 * 30))
  const years = Math.floor(absDiffMs / (1000 * 60 * 60 * 24 * 365))

  const sign = diffMs >= 0 ? -1 : 1

  if (years > 0) return rtf.format(sign * years, 'year')
  if (months > 0) return rtf.format(sign * months, 'month')
  if (weeks > 0) return rtf.format(sign * weeks, 'week')
  if (days > 0) return rtf.format(sign * days, 'day')
  if (hours > 0) return rtf.format(sign * hours, 'hour')
  if (minutes > 0) return rtf.format(sign * minutes, 'minute')
  if (seconds > 10) return rtf.format(sign * seconds, 'second')

  return 'just now'
}

const relativeTime = computed(() => getRelativeTime(dateObj.value))

const formattedDate = computed(() => {
  const date = dateObj.value

  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const day = date.getDate()
  const year = date.getFullYear()

  return `${dayName}, ${month} ${day}, ${year}`
})

const formattedTime = computed(() => {
  const date = dateObj.value

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })
})

const additionalInfo = computed(() => {
  const date = dateObj.value
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const absDiffMs = Math.abs(diffMs)

  const totalSeconds = Math.floor(absDiffMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const suffix = diffMs >= 0 ? 'ago' : 'from now'
  return `${hours} hours, ${minutes} minutes, ${seconds} seconds ${suffix}`
})
</script>

<template>
  <UPopover
    arrow
    mode="hover"
    :ui="{
      content: 'min-w-80 p-0',
      panel: 'rounded-lg border border-default bg-background shadow-lg'
    }"
    :placement
  >
    <span class="text-sm cursor-pointer transition-colors font-medium text-nowrap">
      {{ relativeTime }}
    </span>

    <template #content>
      <div class="p-3">
        <div class="text-sm font-medium mb-2">
          {{ label }}
        </div>

        <div class="flex items-center justify-between gap-4">
          <div class="text-sm">
            {{ formattedDate }}
          </div>
          <div class="text-sm font-mono">
            {{ formattedTime }}
          </div>
        </div>

        <div class="mt-2 pt-2 border-t border-default">
          <div class="text-xs">
            {{ additionalInfo }}
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>
