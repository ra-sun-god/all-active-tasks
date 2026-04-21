import { ref, shallowRef, readonly } from 'vue'
import type { Entity } from '~/types'
import { usePagination  } from './usePagination'
import { useApi } from './useApi'

export function useEntities() {
  const api = useApi()
  const entityList = shallowRef<Entity[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const paging = usePagination(12)

  const fetchEntityList = async () => {
    isLoading.value = true
    error.value = null
    try {
      const data = await api<{ entities: Entity[]; total: number }>(
        `/entities`,
        { query: { limit: paging.limit.value, offset: paging.offset.value } }
      )
      entityList.value = data?.entities ?? []
      paging.total.value = data?.total ?? 0
    } catch (err: any) {
      error.value = err?.data?.message || 'Failed to fetch entities'
      entityList.value = []
    } finally {
      isLoading.value = false
    }
  }

  return {
    entityList,
    isLoading: readonly(isLoading),
    error: readonly(error),
    paging,
    fetchEntityList,
  }
}
