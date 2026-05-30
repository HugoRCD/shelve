import type { AuditActorType, AuditLogEntry, AuditLogResponse } from '@types'
import { useDebounceFn } from '@vueuse/core'

export type AuditLogFilters = {
  action: string | undefined
  actorType: AuditActorType | undefined
  projectId: number | undefined
}

export function useAuditLogs(teamSlug: Ref<string> | ComputedRef<string>) {
  const logs = ref<AuditLogEntry[]>([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const cursor = ref<number | null>(null)
  const hasMore = ref(false)
  const total = ref(0)
  let requestId = 0

  const filters = reactive<AuditLogFilters>({
    action: undefined,
    actorType: undefined,
    projectId: undefined,
  })

  async function fetchLogs(reset = false) {
    const currentRequestId = ++requestId

    if (reset) {
      loading.value = true
      cursor.value = null
    } else {
      loadingMore.value = true
    }

    try {
      const query: Record<string, string | number> = { limit: 50 }
      if (filters.action) query.action = filters.action
      if (filters.actorType) query.actorType = filters.actorType
      if (filters.projectId) query.projectId = filters.projectId
      if (!reset && cursor.value) query.cursor = cursor.value

      const res = await $fetch<AuditLogResponse>(
        `/api/teams/${toValue(teamSlug)}/audit-logs`,
        { query },
      )

      if (currentRequestId !== requestId) return

      logs.value = reset ? res.logs : [...logs.value, ...res.logs]
      cursor.value = res.nextCursor
      hasMore.value = res.nextCursor !== null
      total.value = res.total
    } catch {
      if (currentRequestId === requestId) {
        toast.error('Failed to fetch audit logs')
      }
    } finally {
      if (currentRequestId === requestId) {
        loading.value = false
        loadingMore.value = false
      }
    }
  }

  const refetch = useDebounceFn(() => fetchLogs(true), 300)

  watch(filters, () => refetch(), { deep: true })
  watch(teamSlug, () => fetchLogs(true))

  onMounted(() => fetchLogs(true))

  return {
    logs,
    loading,
    loadingMore,
    hasMore,
    total,
    filters,
    fetchLogs,
  }
}
