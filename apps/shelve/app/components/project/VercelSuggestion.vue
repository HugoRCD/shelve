<script setup lang="ts">
import type { Project } from '@types'
import { motion } from 'motion-v'

interface Props {
  project: Project
}

const props = defineProps<Props>()
const emit = defineEmits<{
  linked: [project: Project]
}>()

const { getIntegrations } = useIntegrations()
const { 
  projects: vercelProjects, 
  fetchVercelProjects, 
  linkProjectToVercel,
  getFrameworkIcon,
  isProjectLinked
} = useVercelProjects()

const showSuggestion = ref(false)
const linking = ref(false)
const dismissed = ref(false)

const { data: vercelIntegrations } = await useAsyncData('vercel-integrations', () => 
  getIntegrations('vercel')
)

const hasVercelIntegration = computed(() => 
  vercelIntegrations.value && vercelIntegrations.value.length > 0
)

const bestSuggestion = computed(() => {
  if (!hasVercelIntegration.value || isProjectLinked(props.project) || vercelProjects.value.length === 0) {
    return null
  }

  let bestMatch = null
  let highestScore = 0

  for (const vercelProject of vercelProjects.value) {
    let score = 0
    const reasons = []

    const nameMatch = calculateNameSimilarity(props.project.name, vercelProject.name)
    if (nameMatch > 0.6) {
      score += nameMatch * 40
      reasons.push(`${Math.round(nameMatch * 100)}% name match`)
    }

    if (props.project.repository && vercelProject.link) {
      const repoMatch = checkRepoMatch(props.project.repository, vercelProject.link)
      if (repoMatch.isMatch) {
        score += repoMatch.score
        reasons.push(repoMatch.reason)
      }
    }

    if (score > 50 && score > highestScore) {
      highestScore = score
      bestMatch = {
        vercelProject,
        confidence: Math.min(score, 100),
        reasons
      }
    }
  }

  return bestMatch
})

function calculateNameSimilarity(name1: string, name2: string): number {
  const s1 = name1.toLowerCase().trim()
  const s2 = name2.toLowerCase().trim()
  
  if (s1 === s2) return 1.0
  
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.8
  }
  
  const words1 = s1.split(/[-_\s]+/)
  const words2 = s2.split(/[-_\s]+/)
  
  let matchingWords = 0
  for (const word1 of words1) {
    if (words2.some(word2 => word1 === word2)) {
      matchingWords++
    }
  }
  
  return matchingWords / Math.max(words1.length, words2.length)
}

function checkRepoMatch(projectRepo: string, vercelLink: string) {
  const projectMatch = projectRepo.match(/github\.com\/([^/]+)\/([^/]+)/)
  const vercelMatch = vercelLink.match(/github\.com\/([^/]+)\/([^/]+)/)
  
  if (!projectMatch || !vercelMatch) {
    return { isMatch: false, score: 0, reason: '' }
  }
  
  const [, projectOwner, projectName] = projectMatch
  const [, vercelOwner, vercelName] = vercelMatch
  const cleanProjectName = projectName?.replace(/\.git$/, '')
  const cleanVercelName = vercelName?.replace(/\.git$/, '')
  
  if (projectOwner === vercelOwner && cleanProjectName === cleanVercelName) {
    return { isMatch: true, score: 50, reason: 'Same GitHub repository' }
  }
  
  if (cleanProjectName === cleanVercelName) {
    return { isMatch: true, score: 30, reason: 'Same repository name' }
  }
  
  if (projectOwner === vercelOwner) {
    return { isMatch: true, score: 20, reason: 'Same GitHub owner' }
  }
  
  return { isMatch: false, score: 0, reason: '' }
}

async function handleAcceptSuggestion() {
  if (!bestSuggestion.value) return
  
  linking.value = true
  try {
    const updatedProject = await linkProjectToVercel(props.project.id, bestSuggestion.value.vercelProject.id)
    if (updatedProject) {
      emit('linked', updatedProject)
      showSuggestion.value = false
    }
  } finally {
    linking.value = false
  }
}

function dismissSuggestion() {
  dismissed.value = true
  showSuggestion.value = false
}

watch([hasVercelIntegration, bestSuggestion], ([hasIntegration, suggestion]) => {
  if (hasIntegration && suggestion && !dismissed.value) {
    setTimeout(() => {
      showSuggestion.value = true
    }, 1000)
  }
}, { immediate: true })

onMounted(async () => {
  if (hasVercelIntegration.value) {
    await fetchVercelProjects()
  }
})
</script>

<template>
  <motion.div
    v-if="showSuggestion && bestSuggestion"
    :initial="{ opacity: 0, x: 100, scale: 0.9 }"
    :animate="{ opacity: 1, x: 0, scale: 1 }"
    :exit="{ opacity: 0, x: 100, scale: 0.9 }"
    :transition="{ type: 'spring', duration: 0.5, bounce: 0.2 }"
    class="fixed right-6 bottom-6 z-50 w-80"
  >
    <UCard class="shadow-xl border border-default/20 bg-default/95 backdrop-blur-md">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="size-6 bg-primary/10 rounded-md flex items-center justify-center">
              <UIcon name="i-lucide-lightbulb" class="size-3 text-primary" />
            </div>
            <span class="font-semibold text-sm">Suggestion</span>
          </div>
          <UButton
            variant="ghost"
            icon="i-lucide-x"
            size="xs"
            @click="dismissSuggestion"
          />
        </div>
      </template>

      <div class="space-y-4">
        <div>
          <p class="text-sm font-medium text-highlighted mb-1">
            Link with Vercel project?
          </p>
          <p class="text-xs text-muted">
            We found a potential match for <span class="font-medium">{{ project.name }}</span>
          </p>
        </div>

        <motion.div class="bg-muted/30 border border-default rounded-lg p-3">
          <div class="flex items-center gap-3 mb-2">
            <div class="size-8 bg-success/10 rounded-lg flex items-center justify-center">
              <UIcon :name="getFrameworkIcon(bestSuggestion.vercelProject.framework)" class="size-4 text-success" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm truncate">
                {{ bestSuggestion.vercelProject.name }}
              </p>
              <p class="text-xs text-muted">
                <span v-if="bestSuggestion.vercelProject.framework" class="capitalize">
                  {{ bestSuggestion.vercelProject.framework }}
                </span>
                <span v-if="bestSuggestion.vercelProject.framework"> • </span>
                {{ Math.round(bestSuggestion.confidence) }}% match
              </p>
            </div>
          </div>
          
          <div class="text-xs text-muted">
            <span v-for="(reason, index) in bestSuggestion.reasons" :key="index">
              {{ reason }}<span v-if="index < bestSuggestion.reasons.length - 1"> • </span>
            </span>
          </div>
        </motion.div>

        <div class="flex gap-2">
          <UButton
            size="sm"
            variant="outline"
            class="flex-1"
            :loading="linking"
            label="Not now"
            @click="dismissSuggestion"
          />
          <UButton
            size="sm"
            class="flex-1"
            :loading="linking"
            :disabled="linking"
            label="Link project"
            @click="handleAcceptSuggestion"
          />
        </div>
      </div>
    </UCard>
  </motion.div>
</template> 
