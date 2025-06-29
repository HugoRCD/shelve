<script setup lang="ts">
import type { Project } from '@types'
import { motion } from 'motion-v'

interface Props {
  project: Project
}

const props = defineProps<Props>()
const emit = defineEmits<{
  updated: [project: Project]
}>()

const { getIntegrations } = useIntegrations()
const { 
  loading: vercelLoading,
  initialLoading,
  projects: vercelProjects, 
  fetchVercelProjects, 
  linkProjectToVercel, 
  unlinkProjectFromVercel,
  getLinkedVercelProject,
  isProjectLinked,
  getFrameworkIcon
} = useVercelProjects()

const showSelector = ref(false)
const linking = ref(false)
const currentProject = ref(props.project)
const searchQuery = ref('')

watch(() => props.project, (newProject) => {
  currentProject.value = newProject
}, { immediate: true })

const { data: vercelIntegrations } = await useAsyncData('vercel-integrations', () => 
  getIntegrations('vercel')
)

const hasVercelIntegration = computed(() => 
  vercelIntegrations.value && vercelIntegrations.value.length > 0
)

const linkedVercelProject = computed(() => getLinkedVercelProject(currentProject.value))
const isLinked = computed(() => isProjectLinked(currentProject.value))

const isLoadingState = computed(() => {
  return hasVercelIntegration.value && currentProject.value.vercelProjectId && initialLoading.value
})

const filteredProjects = computed(() => {
  if (!searchQuery.value) return vercelProjects.value
  const query = searchQuery.value.toLowerCase()
  return vercelProjects.value.filter(project => 
    project.name.toLowerCase().includes(query)
  )
})

async function loadVercelProjects() {
  if (hasVercelIntegration.value && vercelProjects.value.length === 0) {
    await fetchVercelProjects()
  }
}

async function handleLinkProject(vercelProjectId: string) {
  linking.value = true
  try {
    const updatedProject = await linkProjectToVercel(currentProject.value.id, vercelProjectId)
    if (updatedProject) {
      currentProject.value = updatedProject
      showSelector.value = false
      searchQuery.value = ''
      emit('updated', updatedProject)
    }
  } finally {
    linking.value = false
  }
}

async function handleUnlinkProject() {
  linking.value = true
  try {
    const updatedProject = await unlinkProjectFromVercel(currentProject.value.id)
    if (updatedProject) {
      currentProject.value = updatedProject
      emit('updated', updatedProject)
    }
  } finally {
    linking.value = false
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString()
}

function openSelector() {
  showSelector.value = true
  searchQuery.value = ''
  loadVercelProjects()
}

onMounted(() => {
  if (hasVercelIntegration.value) {
    loadVercelProjects()
  }
})
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UIcon name="i-simple-icons-vercel" class="size-4" />
        <span class="text-sm font-medium">Vercel</span>
      </div>
      
      <UButton
        v-if="!hasVercelIntegration"
        to="/user/integrations"
        size="xs"
        variant="outline"
        icon="i-lucide-plus"
        label="Connect"
      />
    </div>

    <motion.div
      v-if="!hasVercelIntegration"
      :initial="{ opacity: 0, y: 4 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.3, ease: 'easeOut' }"
      class="border border-default rounded-lg p-4"
    >
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-info" class="size-4 text-muted flex-shrink-0" />
        <div>
          <p class="text-sm text-highlighted">
            Connect Vercel to sync variables
          </p>
          <p class="text-xs text-muted">
            Automatically sync environment variables with your projects
          </p>
        </div>
      </div>
    </motion.div>

    <motion.div
      v-else-if="isLoadingState"
      :initial="{ opacity: 0, y: 4 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.3, ease: 'easeOut' }"
      class="border border-default rounded-lg p-4"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <USkeleton class="size-8 rounded-lg" />
          <div class="space-y-1">
            <USkeleton class="h-4 w-24" />
            <USkeleton class="h-3 w-20" />
          </div>
        </div>
        <USkeleton class="size-6" />
      </div>
    </motion.div>

    <motion.div
      v-else-if="isLinked"
      :initial="{ opacity: 0, scale: 0.95 }"
      :animate="{ opacity: 1, scale: 1 }"
      :transition="{ duration: 0.4, ease: 'easeOut' }"
      class="bg-success/5 border border-success/20 rounded-lg p-4"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="size-8 bg-success/10 rounded-lg flex items-center justify-center">
            <UIcon :name="getFrameworkIcon(linkedVercelProject?.framework)" class="size-4 text-success" />
          </div>
          <div>
            <p class="text-sm font-medium">
              {{ linkedVercelProject?.name }}
            </p>
            <p class="text-xs text-muted">
              <span v-if="linkedVercelProject?.framework" class="capitalize">{{ linkedVercelProject.framework }}</span>
              <span v-if="linkedVercelProject?.framework"> • </span>
              {{ formatDate(linkedVercelProject?.createdAt || 0) }}
            </p>
          </div>
        </div>
        
        <motion.div
          :while-hover="{ scale: 1.05 }"
          :while-tap="{ scale: 0.95 }"
          :transition="{ duration: 0.15 }"
        >
          <UButton
            size="xs"
            variant="ghost"
            icon="i-lucide-x"
            :loading="linking"
            :disabled="linking"
            @click="handleUnlinkProject"
          />
        </motion.div>
      </div>
    </motion.div>

    <motion.div
      v-else-if="hasVercelIntegration"
      :initial="{ opacity: 0, y: 4 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.3, ease: 'easeOut' }"
    >
      <motion.div 
        class="border border-default rounded-lg p-4 cursor-pointer hover:border-muted"
        @click="openSelector"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="size-8 bg-muted/50 rounded-lg flex items-center justify-center">
              <UIcon name="i-lucide-link-2" class="size-4 text-muted" />
            </div>
            <div>
              <p class="text-sm font-medium">
                Link with Vercel
              </p>
              <p class="text-xs text-muted">
                Sync environment variables
              </p>
            </div>
          </div>
          
          <UIcon name="i-lucide-arrow-right" class="size-4 text-muted" />
        </div>
      </motion.div>

      <UModal v-model:open="showSelector">
        <template #content>
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon name="i-simple-icons-vercel" class="size-4" />
                  <h3 class="font-semibold">
                    Link Vercel Project
                  </h3>
                </div>
                <UButton
                  variant="ghost"
                  icon="i-lucide-x"
                  size="xs"
                  @click="showSelector = false"
                />
              </div>
            </template>

            <div class="space-y-4">
              <p class="text-sm text-muted">
                Select which Vercel project to link with <span class="font-medium">{{ currentProject.name }}</span>
              </p>

              <UInput
                v-model="searchQuery"
                placeholder="Search projects..."
                icon="i-lucide-search"
                size="sm"
                :disabled="vercelLoading"
              />

              <motion.div 
                v-if="vercelLoading"
                :initial="{ opacity: 0 }"
                :animate="{ opacity: 1 }"
                class="flex items-center justify-center py-12"
              >
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-loader-2" class="size-4 animate-spin text-muted" />
                  <span class="text-sm text-muted">Loading projects...</span>
                </div>
              </motion.div>

              <motion.div 
                v-else-if="!vercelProjects.length"
                :initial="{ opacity: 0, y: 8 }"
                :animate="{ opacity: 1, y: 0 }"
                class="text-center py-12"
              >
                <UIcon name="i-lucide-inbox" class="size-8 text-muted mx-auto mb-3" />
                <p class="text-sm font-medium">
                  No projects found
                </p>
                <p class="text-xs text-muted">
                  Create a project in your Vercel dashboard first
                </p>
              </motion.div>

              <motion.div 
                v-else-if="!filteredProjects.length"
                :initial="{ opacity: 0, y: 8 }"
                :animate="{ opacity: 1, y: 0 }"
                class="text-center py-8"
              >
                <UIcon name="i-lucide-search-x" class="size-6 text-muted mx-auto mb-2" />
                <p class="text-sm text-muted">
                  No projects match your search
                </p>
              </motion.div>

              <div v-else class="space-y-2 max-h-80 overflow-y-auto">
                <motion.button
                  v-for="(vercelProject, index) in filteredProjects"
                  :key="vercelProject.id"
                  :initial="{ opacity: 0, y: 8 }"
                  :animate="{ opacity: 1, y: 0 }"
                  :transition="{ delay: index * 0.03, duration: 0.2 }"
                  class="w-full text-left p-3 border border-default rounded-lg hover:bg-muted/30 transition-colors duration-150"
                  :class="{ 'opacity-50 cursor-not-allowed': linking }"
                  :disabled="linking"
                  @click="handleLinkProject(vercelProject.id)"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <UIcon :name="getFrameworkIcon(vercelProject.framework)" />
                      <div>
                        <p class="font-medium text-sm">
                          {{ vercelProject.name }}
                        </p>
                        <p class="text-xs text-muted">
                          <span v-if="vercelProject.framework" class="capitalize">{{ vercelProject.framework }}</span>
                          <span v-if="vercelProject.framework"> • </span>
                          {{ formatDate(vercelProject.createdAt) }}
                        </p>
                      </div>
                    </div>
                    
                    <UIcon
                      v-if="linking"
                      name="i-lucide-loader-2"
                      class="size-4 animate-spin text-muted"
                    />
                    <UIcon
                      v-else
                      name="i-lucide-arrow-right"
                      class="size-4 text-muted"
                    />
                  </div>
                </motion.button>
              </div>
            </div>
          </UCard>
        </template>
      </UModal>
    </motion.div>
  </div>
</template> 
