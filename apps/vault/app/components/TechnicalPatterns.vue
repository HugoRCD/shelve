<script setup lang="ts">
import { onMounted, ref } from 'vue'

const patterns = ref<Array<{ id: string, x: number, y: number }>>([])
const hashStrings = ref<Array<{ text: string, x: number, y: number, rotation: number }>>([])
const binaryStrings = ref<Array<{ text: string, x: number, y: number, opacity: number }>>([])

const cryptoLabels = [
  'H1',
  'H2',
  'DS22',
  'FE2',
  'BE',
  'DK03',
  'DB15',
  'KN0',
  'IX60',
  'CL20',
  'TB12',
  'AES256',
  'SHA512',
  'ECDSA',
  'RSA2048',
  'HMAC',
  'PBKDF2',
  'BCRYPT',
  'SCRYPT',
  '0x7F3A',
  '0x9B2C',
  '0x4E8D',
  '0x1F5A',
  '0x8C3E',
  '0x2D7B',
  '0x6A9F',
  '0x3C1E'
]

const generateHashString = () => {
  const chars = '0123456789abcdef'
  return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const generateBinaryString = () => {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 2)).join('')
}

function initializePatterns() {
  const centerX = 50
  const centerY = 50
  const margin = 25

  const newPatterns: Array<{ id: string, x: number, y: number }> = []
  cryptoLabels.forEach((label, index) => {
    let x, y
    let attempts = 0
    do {
      const edgeZone = 40
      if (Math.random() < 0.5) {
        x = Math.random() * 100
        if (Math.random() < 0.5) {
          y = Math.random() < 0.7
            ? Math.random() * edgeZone
            : edgeZone + Math.random() * (centerY - margin - edgeZone)
        } else {
          y = Math.random() < 0.7
            ? (100 - edgeZone) + Math.random() * edgeZone
            : (centerY + margin) + Math.random() * (100 - centerY - margin - edgeZone)
        }
      } else {
        if (Math.random() < 0.5) {
          x = Math.random() < 0.7
            ? Math.random() * edgeZone
            : edgeZone + Math.random() * (centerX - margin - edgeZone)
        } else {
          x = Math.random() < 0.7
            ? (100 - edgeZone) + Math.random() * edgeZone
            : (centerX + margin) + Math.random() * (100 - centerX - margin - edgeZone)
        }
        y = Math.random() * 100
      }
      attempts++
    } while (
      attempts < 50 &&
      (Math.abs(x - centerX) < margin || Math.abs(y - centerY) < margin)
    )

    newPatterns.push({ id: label, x, y })
  })

  patterns.value = newPatterns

  hashStrings.value = Array.from({ length: 6 }, () => {
    let x, y
    let attempts = 0
    const edgeZone = 35
    do {
      if (Math.random() < 0.8) {
        x = Math.random() < 0.5
          ? Math.random() * edgeZone
          : (100 - edgeZone) + Math.random() * edgeZone
        y = Math.random() * 100
      } else {
        x = Math.random() * 100
        y = Math.random() < 0.5
          ? Math.random() * edgeZone
          : (100 - edgeZone) + Math.random() * edgeZone
      }
      attempts++
    } while (
      attempts < 50 &&
      (Math.abs(x - centerX) < margin || Math.abs(y - centerY) < margin)
    )

    return {
      text: generateHashString(),
      x,
      y,
      rotation: (Math.random() - 0.5) * 15
    }
  })

  binaryStrings.value = Array.from({ length: 4 }, () => {
    let x, y
    let attempts = 0
    const edgeZone = 35
    do {
      if (Math.random() < 0.8) {
        x = Math.random() < 0.5
          ? Math.random() * edgeZone
          : (100 - edgeZone) + Math.random() * edgeZone
        y = Math.random() * 100
      } else {
        x = Math.random() * 100
        y = Math.random() < 0.5
          ? Math.random() * edgeZone
          : (100 - edgeZone) + Math.random() * edgeZone
      }
      attempts++
    } while (
      attempts < 50 &&
      (Math.abs(x - centerX) < margin || Math.abs(y - centerY) < margin)
    )

    return {
      text: generateBinaryString(),
      x,
      y,
      opacity: 0.03 + Math.random() * 0.05
    }
  })
}

onMounted(() => {
  initializePatterns()
})

const connections = computed(() => {
  const conns: Array<{ from: { x: number, y: number }, to: { x: number, y: number } }> = []
  const nodeCount = patterns.value.length

  if (nodeCount === 0) return conns

  for (let i = 0; i < Math.min(6, nodeCount); i++) {
    const fromIndex = Math.floor(Math.random() * nodeCount)
    const toIndex = Math.floor(Math.random() * nodeCount)
    if (fromIndex !== toIndex && patterns.value[fromIndex] && patterns.value[toIndex]) {
      conns.push({
        from: patterns.value[fromIndex],
        to: patterns.value[toIndex]
      })
    }
  }

  return conns
})
</script>

<template>
  <div class="fixed inset-0 -z-1 pointer-events-none overflow-hidden opacity-80">
    <svg class="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="0.5" />
        </pattern>

        <filter id="glow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="100%" height="100%" fill="url(#grid)" />

      <g opacity="0.08">
        <template v-for="(hash, index) in hashStrings" :key="`hash-${index}`">
          <text
            :x="`${hash.x}%`"
            :y="`${hash.y}%`"
            :transform="`rotate(${hash.rotation}, ${hash.x}%, ${hash.y}%)`"
            fill="rgba(255,255,255,0.5)"
            font-size="8"
            font-family="monospace"
            font-weight="400"
            opacity="0.25"
          >
            {{ hash.text }}
          </text>
        </template>
      </g>

      <g opacity="0.04">
        <template v-for="(binary, index) in binaryStrings" :key="`binary-${index}`">
          <text
            :x="`${binary.x}%`"
            :y="`${binary.y}%`"
            fill="rgba(255,255,255,0.15)"
            font-size="6"
            font-family="monospace"
            :opacity="binary.opacity"
          >
            {{ binary.text }}
          </text>
        </template>
      </g>

      <g opacity="0.05">
        <template v-for="(conn, index) in connections" :key="`conn-${index}`">
          <path
            :d="`M ${conn.from.x}% ${conn.from.y}% L ${conn.to.x}% ${conn.to.y}%`"
            stroke="rgba(255,255,255,0.4)"
            stroke-width="1"
            fill="none"
            stroke-dasharray="2,3"
          />
        </template>
      </g>

      <g opacity="0.04">
        <path
          d="M 10% 20% Q 25% 10% 40% 20%"
          stroke="rgba(255,255,255,0.5)"
          stroke-width="1.5"
          fill="none"
        />
        <path
          d="M 60% 25% Q 75% 15% 90% 25%"
          stroke="rgba(255,255,255,0.5)"
          stroke-width="1.5"
          fill="none"
        />
        <path
          d="M 15% 75% Q 30% 65% 45% 75%"
          stroke="rgba(255,255,255,0.5)"
          stroke-width="1.5"
          fill="none"
        />
        <path
          d="M 55% 80% Q 70% 70% 85% 80%"
          stroke="rgba(255,255,255,0.5)"
          stroke-width="1.5"
          fill="none"
        />
      </g>

      <g opacity="0.12">
        <template v-for="pattern in patterns" :key="pattern.id">
          <circle
            :cx="`${pattern.x}%`"
            :cy="`${pattern.y}%`"
            r="2.5"
            fill="rgba(255,255,255,0.6)"
            filter="url(#glow)"
          />
          <text
            :x="`${pattern.x}%`"
            :y="`${pattern.y}%`"
            dy="-8"
            fill="rgba(255,255,255,0.4)"
            font-size="9"
            font-family="monospace"
            text-anchor="middle"
            font-weight="500"
            opacity="0.5"
          >
            {{ pattern.id }}
          </text>
        </template>
      </g>

      <g opacity="0.06">
        <text
          x="12%"
          y="15%"
          fill="rgba(255,255,255,0.25)"
          font-size="7"
          font-family="monospace"
        >
          0xAB3F
        </text>
        <text
          x="88%"
          y="18%"
          fill="rgba(255,255,255,0.25)"
          font-size="7"
          font-family="monospace"
        >
          0x7E2D
        </text>
        <text
          x="8%"
          y="88%"
          fill="rgba(255,255,255,0.25)"
          font-size="7"
          font-family="monospace"
        >
          0x4C9A
        </text>
        <text
          x="92%"
          y="92%"
          fill="rgba(255,255,255,0.25)"
          font-size="7"
          font-family="monospace"
        >
          0x1F8E
        </text>

        <text
          x="18%"
          y="12%"
          fill="rgba(255,255,255,0.2)"
          font-size="6"
          font-family="monospace"
          opacity="0.35"
        >
          YWJjZGU=
        </text>
        <text
          x="82%"
          y="88%"
          fill="rgba(255,255,255,0.2)"
          font-size="6"
          font-family="monospace"
          opacity="0.35"
        >
          MTIzNDU=
        </text>
      </g>

      <g opacity="0.03">
        <circle cx="5%" cy="10%" r="2" fill="rgba(255,255,255,0.6)" />
        <circle cx="95%" cy="12%" r="2" fill="rgba(255,255,255,0.6)" />
        <circle cx="6%" cy="90%" r="2" fill="rgba(255,255,255,0.6)" />
        <circle cx="94%" cy="88%" r="2" fill="rgba(255,255,255,0.6)" />
      </g>

      <text
        x="92%"
        y="8%"
        fill="rgba(255,255,255,0.1)"
        font-size="11"
        font-family="monospace"
        font-weight="600"
        opacity="0.2"
      >
        2025
      </text>
    </svg>
  </div>
</template>
