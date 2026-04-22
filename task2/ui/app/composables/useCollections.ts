import { ref, shallowRef, computed, readonly } from 'vue'
import type { Collection, Entity } from '~/types'
import { usePagination } from "./usePagination"


export function useCollections() {
  const api = useApi()

  // ── Collection list
  const collections = shallowRef<Collection[]>([])
  const isFetching = ref(false)
  const fetchingError = ref<string | null>(null)

  const listPaging = usePagination(20)

  const fetchCollections = async () => {
    isFetching.value = true
    fetchingError.value = null
    try {
      const data = await api<{ collections: Collection[]; total: number }>('/collections', {
        query: { limit: listPaging.limit.value, offset: listPaging.offset.value },
      })
      collections.value = data?.collections ?? []
      listPaging.total.value = data?.total ?? 0
    } catch (err: any) {
      fetchingError.value = err?.data?.message || 'Failed to fetch collections'
      collections.value = []
    } finally {
      isFetching.value = false
    }
  }

  const updateCollectionsInPlace = (id: string, data: Collection) => {
    const index = collections.value.findIndex((c) => c.id === id)
    if (index !== -1) {
      collections.value = collections.value.with(index, data)
    } else {
      collections.value = [data, ...collections.value]
    }
  }

  const publicCollections = shallowRef<Collection[]>([])
  const publicListPaging = usePagination(20)
  const isFetchingPublic = ref(false)

  const fetchPublicCollections = async (userId: string) => {
    isFetchingPublic.value = true
    fetchingError.value = null
    try {
      const data = await api<{ collections: Collection[]; total: number }>(
        `/collections/public/${userId}`,
        { query: { limit: publicListPaging.limit.value, offset: publicListPaging.offset.value } }
      )
      publicCollections.value = data?.collections ?? []
      publicListPaging.total.value = data?.total ?? 0
    } catch (err: any) {
      fetchingError.value = err?.data?.message || 'Failed to fetch public collections'
      publicCollections.value = []
    } finally {
      isFetchingPublic.value = false
    }
  }


  const collection = ref<Collection | null>(null)
  const isProcessing = ref(false)
  const processingError = ref<string | null>(null)

  const getCollection = async (id: string) => {
    isFetching.value = true
    fetchingError.value = null
    try {
      collection.value = await api<Collection>(`/collections/${id}`)
      return collection.value
    } catch (err: any) {
      fetchingError.value = err?.data?.message || 'Failed to fetch collection'
      throw err
    } finally {
      isFetching.value = false
    }
  }

  const createCollection = async (title: string, description?: string, isPublic = false) => {
    isProcessing.value = true
    processingError.value = null
    try {

      const newData = await api<Collection>('/collections', {
        method: 'POST',
        body: { title, description, isPublic },
      })

       await updateCollectionsInPlace(newData.id, newData)

      collection.value = newData;

      return newData;
    } catch (err: any) {
      processingError.value = err?.data?.message || 'Failed to create collection'
      throw err
    } finally {
      isProcessing.value = false
    }
  }

  const updateCollection = async (
    id: string,
    payload: Partial<Pick<Collection, 'title' | 'description' | 'isPublic'>>
  ) => {
    isProcessing.value = true
    processingError.value = null
    try {

      const newData = await api<Collection>(`/collections/${id}`, {
        method: 'PATCH',
        body: payload,
      })

      collection.value = newData;

      await updateCollectionsInPlace(newData.id, newData)

      return newData
    } catch (err: any) {
      processingError.value = err?.data?.message || 'Failed to update collection'
      throw err
    } finally {
      isProcessing.value = false
    }
  }

  const deleteCollection = async (id: string) => {
    isProcessing.value = true
    processingError.value = null
    try {
      await api(`/collections/${id}`, { method: 'DELETE' })
      collection.value = null
      collections.value = collections.value.filter((c) => c.id !== id)
    } catch (err: any) {
      processingError.value = err?.data?.message || 'Failed to delete collection'
      throw err
    } finally {
      isProcessing.value = false
    }
  }

  // ── Collection entities (paginated)
  const entities = shallowRef<Entity[]>([])
  const isFetchingEntities = ref(false)
  const entitiesPaging = usePagination(20)

  const getCollectionEntities = async (collectionId: string) => {
    isFetchingEntities.value = true
    fetchingError.value = null
    try {
      const data = await api<{ entities: Entity[]; total: number }>(
        `/collections/${collectionId}/entities`,
        { query: { limit: entitiesPaging.limit.value, offset: entitiesPaging.offset.value } }
      )
      entities.value = data?.entities ?? []
      entitiesPaging.total.value = data?.total ?? 0
    } catch (err: any) {
      fetchingError.value = err?.data?.message || 'Failed to fetch collection entities'
      entities.value = []
    } finally {
      isFetchingEntities.value = false
    }
  }

  const removeEntityFromList = (entityId: string) => {
    entities.value = entities.value.filter((e) => e.id !== entityId)
    if (entitiesPaging.total.value > 0) entitiesPaging.total.value--
  }

  // ── Entity mutationsprocessingError
  const addToCollection = async (collectionId: string, entityId: string, note?: string) => {
    isProcessing.value = true
    processingError.value = null
    try {
      await api(`/collections/${collectionId}/entities`, {
        method: 'POST',
        body: { entityId, ...(note ? { note } : {}) },
      })
    } catch (err: any) {
      processingError.value = err?.data?.message || 'Failed to add entity'
      throw err
    } finally {
      isProcessing.value = false
    }
  }

  const removeFromCollection = async (collectionId: string, entityId: string) => {
    isProcessing.value = true
    processingError.value = null
    try {
      await api(`/collections/${collectionId}/entities/${entityId}`, {
        method: 'DELETE',
      })
    } catch (err: any) {
      processingError.value = err?.data?.message || 'Failed to remove entity'
      throw err
    } finally {
      isProcessing.value = false
    }
  }

  return {
    // ── public collections
    publicCollections,
    isFetchingPublic: readonly(isFetchingPublic),
    fetchPublicCollections,
    publicListPaging,

    // ── collection list
    collections,
    isFetching: readonly(isFetching),
    fetchingError: readonly(fetchingError),
    fetchCollections,
    updateCollectionsInPlace,
    // list pagination — call goToPage(n, fetchCollections)
    listPaging,

    // ── single collection
    collection: readonly(collection),
    isProcessing: readonly(isProcessing),
    processingError: readonly(processingError),
    getCollection,
    createCollection,
    updateCollection,
    deleteCollection,

    // ── collection entities
    entities: readonly(entities),
    isFetchingEntities: readonly(isFetchingEntities),
    getCollectionEntities,
    removeEntityFromList,
    // entities pagination — call goToPage(n, () => getCollectionEntities(id))
    entitiesPaging,

    // ── entity mutations
    addToCollection,
    removeFromCollection,
  }
}
