<script setup lang="ts">
import type { Environment, Project, Team, TokenPermission, TokenWithSecret } from '@types'

type ScopeOption = {
  label: string
  value: number
  hint?: string
}

const emits = defineEmits(['create'])

const open = ref(false)
const tokenName = ref('')
const expiresIn = ref<string>('2592000')
const permissions = ref<TokenPermission[]>(['read', 'write'])

const restrictionsOpen = ref(false)
const selectedTeamIds = ref<number[]>([])
const selectedProjectIds = ref<number[]>([])
const selectedEnvironmentIds = ref<number[]>([])
const allowedCidrs = ref<string[]>([])
const cidrDraft = ref('')

const loading = ref(false)
const teamsLoading = ref(false)
const childLoading = ref(false)

const teams = ref<Team[]>([])
const projectsByTeam = ref<Record<number, Project[]>>({})
const envsByTeam = ref<Record<number, Environment[]>>({})

const createdToken = ref<TokenWithSecret | null>(null)

const expiryOptions = [
  { value: '3600', label: '1 hour' },
  { value: '86400', label: '1 day' },
  { value: '2592000', label: '30 days' },
  { value: '7776000', label: '90 days' },
  { value: '31536000', label: '1 year' },
  { value: '0', label: 'Never (not recommended)' },
]

const permissionOptions = [
  { value: 'read', label: 'read' },
  { value: 'write', label: 'write' },
]

const teamOptions = computed<ScopeOption[]>(() =>
  teams.value.map(team => ({ label: team.name, value: team.id, hint: team.slug }))
)

const projectOptions = computed<ScopeOption[]>(() => {
  const scope = selectedTeamIds.value.length ? selectedTeamIds.value : teams.value.map(t => t.id)
  const out: ScopeOption[] = []
  for (const teamId of scope) {
    const team = teams.value.find(t => t.id === teamId)
    const list = projectsByTeam.value[teamId] ?? []
    for (const project of list) {
      out.push({ label: project.name, value: project.id, hint: team?.slug })
    }
  }
  return out
})

const environmentOptions = computed<ScopeOption[]>(() => {
  const scope = selectedTeamIds.value.length ? selectedTeamIds.value : teams.value.map(t => t.id)
  const out: ScopeOption[] = []
  for (const teamId of scope) {
    const team = teams.value.find(t => t.id === teamId)
    const list = envsByTeam.value[teamId] ?? []
    for (const env of list) {
      out.push({ label: env.name, value: env.id, hint: team?.slug })
    }
  }
  return out
})

const restrictionSummary = computed(() => {
  const parts: string[] = []
  if (selectedTeamIds.value.length) parts.push(`${selectedTeamIds.value.length} team(s)`)
  if (selectedProjectIds.value.length) parts.push(`${selectedProjectIds.value.length} project(s)`)
  if (selectedEnvironmentIds.value.length) parts.push(`${selectedEnvironmentIds.value.length} environment(s)`)
  if (allowedCidrs.value.length) parts.push(`${allowedCidrs.value.length} CIDR(s)`)
  return parts.length ? parts.join(' · ') : 'None — token can access everything you can'
})

const cidrPattern = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}\/(?:3[0-2]|[12]?\d))$|^(?:[A-Fa-f0-9:]+)\/(?:12[0-8]|1[01]\d|[1-9]?\d)$/
const cidrDraftValid = computed(() => !cidrDraft.value || cidrPattern.test(cidrDraft.value.trim()))

async function loadTeams() {
  if (teams.value.length) return
  teamsLoading.value = true
  try {
    teams.value = await $fetch<Team[]>('/api/teams')
  } catch {
    toast.error('Failed to load teams')
  } finally {
    teamsLoading.value = false
  }
}

async function loadTeamChildren(teamId: number) {
  const team = teams.value.find(t => t.id === teamId)
  if (!team) return
  if (projectsByTeam.value[teamId] && envsByTeam.value[teamId]) return

  childLoading.value = true
  try {
    const [projects, envs] = await Promise.all([
      projectsByTeam.value[teamId]
        ? Promise.resolve(projectsByTeam.value[teamId]!)
        : $fetch<Project[]>(`/api/teams/${team.slug}/projects`),
      envsByTeam.value[teamId]
        ? Promise.resolve(envsByTeam.value[teamId]!)
        : $fetch<Environment[]>(`/api/teams/${team.slug}/environments`),
    ])
    projectsByTeam.value[teamId] = projects
    envsByTeam.value[teamId] = envs
  } catch {
    toast.error(`Failed to load resources for ${team.name}`)
  } finally {
    childLoading.value = false
  }
}

watch(selectedTeamIds, async (next, prev) => {
  const added = next.filter(id => !prev?.includes(id))
  await Promise.all(added.map(loadTeamChildren))

  const validProjects = new Set(
    next.flatMap(id => (projectsByTeam.value[id] ?? []).map(p => p.id))
  )
  selectedProjectIds.value = selectedProjectIds.value.filter(id => validProjects.has(id))

  const validEnvs = new Set(
    next.flatMap(id => (envsByTeam.value[id] ?? []).map(e => e.id))
  )
  selectedEnvironmentIds.value = selectedEnvironmentIds.value.filter(id => validEnvs.has(id))
})

watch(open, async (value) => {
  if (!value) return
  await loadTeams()
  if (selectedTeamIds.value.length) {
    await Promise.all(selectedTeamIds.value.map(loadTeamChildren))
  } else {
    await Promise.all(teams.value.map(t => loadTeamChildren(t.id)))
  }
})

function addCidr() {
  const value = cidrDraft.value.trim()
  if (!value) return
  if (!cidrPattern.test(value)) {
    toast.error('Invalid CIDR (e.g. 203.0.113.0/24 or 2001:db8::/32)')
    return
  }
  if (allowedCidrs.value.includes(value)) {
    cidrDraft.value = ''
    return
  }
  allowedCidrs.value.push(value)
  cidrDraft.value = ''
}

function removeCidr(value: string) {
  allowedCidrs.value = allowedCidrs.value.filter(c => c !== value)
}

function resetForm() {
  tokenName.value = ''
  expiresIn.value = '2592000'
  permissions.value = ['read', 'write']
  selectedTeamIds.value = []
  selectedProjectIds.value = []
  selectedEnvironmentIds.value = []
  allowedCidrs.value = []
  cidrDraft.value = ''
  restrictionsOpen.value = false
}

async function createToken() {
  if (!tokenName.value.trim()) {
    toast.error('Token name is required')
    return
  }
  if (!permissions.value.length) {
    toast.error('Pick at least one permission')
    return
  }

  loading.value = true
  try {
    const expiresInNum = expiresIn.value === '0' ? null : Number(expiresIn.value)
    const scopes: Record<string, unknown> = { permissions: permissions.value }
    if (selectedTeamIds.value.length) scopes.teamIds = selectedTeamIds.value
    if (selectedProjectIds.value.length) scopes.projectIds = selectedProjectIds.value
    if (selectedEnvironmentIds.value.length) scopes.environmentIds = selectedEnvironmentIds.value

    const created = await $fetch<TokenWithSecret>('/api/tokens', {
      method: 'POST',
      body: {
        name: tokenName.value.trim(),
        expiresIn: expiresInNum,
        scopes,
        allowedCidrs: allowedCidrs.value.length ? allowedCidrs.value : undefined,
      },
    })
    createdToken.value = created
    emits('create')
    toast.success('Token created — copy it now, you will not see it again.')
  } catch (error: any) {
    const message = error?.data?.message ?? error?.statusMessage ?? 'Failed to create token'
    toast.error(message)
  }
  loading.value = false
}

function copyToken() {
  if (!createdToken.value) return
  navigator.clipboard.writeText(createdToken.value.token)
  toast.success('Token copied to clipboard')
}

function dismissCreated() {
  createdToken.value = null
  resetForm()
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Create a token"
    description="Generate a CLI/API token, optionally restricted to specific teams, projects, environments, or IP ranges."
    :ui="{ content: 'sm:max-w-xl' }"
  >
    <CustomButton size="sm" label="Create token" />

    <template #body>
      <div v-if="!createdToken" class="flex flex-col gap-5">
        <div class="flex flex-col gap-3">
          <UFormField label="Name" required>
            <UInput v-model="tokenName" placeholder="My CI token" class="w-full" autofocus />
          </UFormField>

          <UFormField label="Expiry">
            <USelect v-model="expiresIn" :items="expiryOptions" class="w-full" />
          </UFormField>

          <UFormField label="Permissions" hint="What this token can do">
            <UCheckboxGroup v-model="permissions" :items="permissionOptions" orientation="horizontal" />
          </UFormField>
        </div>

        <Separator />

        <UCollapsible v-model:open="restrictionsOpen">
          <button
            type="button"
            class="flex w-full items-center justify-between rounded-md px-1 py-2 text-left hover:bg-elevated/40"
          >
            <div class="flex flex-col">
              <span class="text-sm font-medium">Restrictions</span>
              <span class="text-xs text-muted">{{ restrictionSummary }}</span>
            </div>
            <UIcon
              name="lucide:chevron-down"
              class="size-4 text-muted transition-transform"
              :class="{ 'rotate-180': restrictionsOpen }"
            />
          </button>

          <template #content>
            <div class="flex flex-col gap-3 pt-3">
              <UFormField
                label="Teams"
                hint="Empty = all teams you belong to"
              >
                <USelectMenu
                  v-model="selectedTeamIds"
                  multiple
                  :items="teamOptions"
                  value-key="value"
                  :loading="teamsLoading"
                  placeholder="All teams"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Projects"
                hint="Empty = all projects in the selected teams"
              >
                <USelectMenu
                  v-model="selectedProjectIds"
                  multiple
                  :items="projectOptions"
                  value-key="value"
                  :loading="childLoading"
                  :disabled="!projectOptions.length"
                  placeholder="All projects"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Environments"
                hint="Empty = all environments in the selected teams"
              >
                <USelectMenu
                  v-model="selectedEnvironmentIds"
                  multiple
                  :items="environmentOptions"
                  value-key="value"
                  :loading="childLoading"
                  :disabled="!environmentOptions.length"
                  placeholder="All environments"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="IP allowlist"
                hint="CIDR ranges allowed to use this token (IPv4 or IPv6). Empty = any IP."
                :error="cidrDraft && !cidrDraftValid ? 'Invalid CIDR notation' : undefined"
              >
                <div class="flex gap-2">
                  <UInput
                    v-model="cidrDraft"
                    placeholder="203.0.113.0/24"
                    class="flex-1"
                    :color="cidrDraft && !cidrDraftValid ? 'error' : undefined"
                    @keydown.enter.prevent="addCidr"
                  />
                  <UButton
                    icon="lucide:plus"
                    variant="soft"
                    :disabled="!cidrDraft || !cidrDraftValid"
                    @click="addCidr"
                  />
                </div>
                <div v-if="allowedCidrs.length" class="mt-2 flex flex-wrap gap-1.5">
                  <UBadge
                    v-for="cidr in allowedCidrs"
                    :key="cidr"
                    color="neutral"
                    variant="subtle"
                    class="font-mono"
                  >
                    {{ cidr }}
                    <button
                      type="button"
                      class="ml-1.5 text-muted hover:text-default"
                      @click="removeCidr(cidr)"
                    >
                      <UIcon name="lucide:x" class="size-3" />
                    </button>
                  </UBadge>
                </div>
              </UFormField>
            </div>
          </template>
        </UCollapsible>

        <UAlert
          v-if="!selectedTeamIds.length && !selectedProjectIds.length && !selectedEnvironmentIds.length && !allowedCidrs.length"
          icon="lucide:info"
          color="neutral"
          variant="soft"
          title="Unscoped token"
          description="This token will be able to access every team, project, and environment you have access to. Add restrictions for tighter blast radius."
        />
      </div>

      <div v-else class="flex flex-col gap-3">
        <UAlert
          icon="lucide:shield-alert"
          color="warning"
          variant="soft"
          title="Save this token now"
          description="This is the only time the secret will be shown. Store it in a safe place."
        />
        <div class="flex items-center gap-2 rounded-md border border-default bg-muted/40 p-3 font-mono text-xs break-all">
          {{ createdToken.token }}
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full items-center justify-end gap-2">
        <template v-if="!createdToken">
          <UButton variant="ghost" label="Cancel" @click="open = false" />
          <UButton
            :loading
            :disabled="!tokenName.trim() || !permissions.length"
            label="Create token"
            @click="createToken"
          />
        </template>
        <template v-else>
          <UButton variant="ghost" label="Done" @click="dismissCreated" />
          <UButton icon="lucide:copy" label="Copy" @click="copyToken" />
        </template>
      </div>
    </template>
  </UModal>
</template>
