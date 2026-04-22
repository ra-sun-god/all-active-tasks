<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-6 py-8">

      <!-- Back -->
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors duration-150 mb-6 group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Collections
      </NuxtLink>

      <!-- Header skeleton -->
      <div v-if="isFetching && !collection" class="mb-8 space-y-3">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl bg-gray-200 animate-pulse" />
          <div class="space-y-2 flex-1">
            <div class="h-6 w-52 bg-gray-200 rounded-lg animate-pulse" />
            <div class="h-3.5 w-72 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <!-- Collection header -->
      <div v-else-if="collection" class="mb-8">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-xl flex-shrink-0 shadow-sm" :style="{ background: accentGradient }" />
            <div>
              <div class="flex items-center gap-2.5 flex-wrap">
                <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ collection.title }}</h1>
                <span
                  class="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full border"
                  :class="collection.isPublic ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-current" />
                  {{ collection.isPublic ? $t('collections.public') : $t('collections.private') }}
                </span>
              </div>
              <p v-if="collection.description" class="text-sm text-gray-400 mt-1 max-w-xl">{{ collection.description }}</p>
              <p class="text-xs text-gray-400 mt-1.5">
                <span class="font-medium text-gray-600">{{ entitiesPaging.total.value }}</span>
                {{ entitiesPaging.total.value === 1 ? 'place' : 'places' }}
                · Created {{ formatDate(collection.createdAt, locale) }}
              </p>

              <!-- Share URL — only for public collections -->
              <div v-if="collection.isPublic" class="flex items-center gap-2 mt-3">
                <div class="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-500 max-w-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  <span class="truncate font-mono">{{ shareUrl }}</span>
                </div>
                <button
                  @click="copyShareUrl"
                  class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors duration-150"
                  :class="copied
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'"
                >
                  <svg v-if="copied" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  {{ copied ? 'Copied!' : 'Copy link' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Owner-only actions -->
          <div v-if="isOwner" class="flex gap-2 flex-shrink-0">
            <button
              @click="showEditModal = true"
              class="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white px-4 py-2 rounded-lg transition-colors duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
            <button
              @click="handleDelete"
              class="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 border border-red-100 hover:border-red-200 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
              Delete
            </button>
          </div>

          <!-- Visitor badge for public collections viewed by non-owners -->
          <div v-else-if="collection.isPublic" class="flex items-center gap-1.5 text-xs text-gray-400 bg-white border border-gray-200 px-3 py-1.5 rounded-lg flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            Viewing as guest
          </div>
        </div>
        <div class="h-px bg-gray-100 mt-6" />
      </div>

      <!-- Entity grid loading -->
      <div v-if="isFetchingEntities" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="n in 8" :key="n" class="bg-white border border-gray-100 rounded-xl overflow-hidden animate-pulse">
          <div class="aspect-[4/3] bg-gray-100" />
          <div class="p-4 space-y-2.5">
            <div class="h-4 bg-gray-100 rounded w-3/4" />
            <div class="h-3 bg-gray-50 rounded w-1/2" />
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="!entities.length" class="flex flex-col items-center justify-center py-24 gap-4">
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center" :style="{ background: accentGradient }">
          <svg class="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div class="text-center">
          <p class="text-sm font-medium text-gray-700">No places yet</p>
          <p v-if="isOwner" class="text-xs text-gray-400 mt-1">Browse places and save them to this collection</p>
        </div>
        <NuxtLink v-if="isOwner" to="/places" class="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-150">
          Browse places
        </NuxtLink>
      </div>

      <!-- Entity grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <EntityCard
          v-for="entity in entities"
          :key="entity.id"
          :entity="entity"
          :is-public-view="!isOwner"
          @remove="handleRemove"
        />
      </div>

      <!-- Pagination -->
      <Pagination
        v-if="!isFetchingEntities && entitiesPaging.totalPages.value > 1"
        class="mt-10"
        :current-page="entitiesPaging.currentPage.value"
        :total-pages="entitiesPaging.totalPages.value"
        :has-next="entitiesPaging.hasNext.value"
        :has-prev="entitiesPaging.hasPrev.value"
        @go="(page: number) => entitiesPaging.goToPage(page, () => getCollectionEntities(collectionId))"
        @next="entitiesPaging.nextPage(() => getCollectionEntities(collectionId))"
        @prev="entitiesPaging.prevPage(() => getCollectionEntities(collectionId))"
      />
    </div>

    <CollectionModal
      :open="showEditModal"
      :collection="collection"
      @close="showEditModal = false"
      @submit="handleEditSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Swal from 'sweetalert2'
import { useCollections } from '~/composables/useCollections'
import { useAuth } from '~/composables/useAuth'
import Pagination from '~/components/Pagination.vue'
import { push } from 'notivue'
import { formatDate } from '~/utils'

const route = useRoute()
const router = useRouter()
const { locale } = useI18n()
const collectionId = route.params.id as string

const {
  collection, isFetching, getCollection,
  updateCollection, deleteCollection, processingError,
  entities, isFetchingEntities, getCollectionEntities,
  entitiesPaging, removeEntityFromList, removeFromCollection,
} = useCollections()

// ── Ownership check ───────────────────────────────────────
const { user } = useAuth()
const isOwner = computed(() =>
  !!user.value && !!collection.value && (collection.value as any).userId === user.value.id
)

// ── Share URL ─────────────────────────────────────────────
const shareUrl = computed(() =>
  typeof window !== 'undefined'
    ? `${window.location.origin}/collections/${collectionId}`
    : `/collections/${collectionId}`
)

const copied = ref(false)
let copyTimeout: ReturnType<typeof setTimeout>

async function copyShareUrl() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    clearTimeout(copyTimeout)
    copyTimeout = setTimeout(() => { copied.value = false }, 2000)
  } catch {
    push.error('Could not copy link')
  }
}

// ── Accent ────────────────────────────────────────────────
function titleToHue(title: string): number {
  let hash = 0
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}
const hue = computed(() => titleToHue(collection.value?.title ?? ''))
const accentGradient = computed(() =>
  `linear-gradient(135deg, hsl(${hue.value}, 70%, 55%), hsl(${(hue.value + 40) % 360}, 65%, 60%))`
)

// ── Edit ──────────────────────────────────────────────────
const showEditModal = ref(false)
async function handleEditSubmit(data: { title: string; description?: string; isPublic: boolean }) {
  await updateCollection(collectionId, data)
  showEditModal.value = false
}

// ── Delete ────────────────────────────────────────────────
async function handleDelete() {
  const result = await Swal.fire({
    title: $t('common.confirm_delete'), text: $t('common.delete_collection'),
    showConfirmButton: true, showCancelButton: true, confirmButtonText: $t('common.confirm'),
  })
  if (result.isConfirmed) {
    await deleteCollection(collectionId)
    router.push('/')
  }
}

// ── Remove entity ─────────────────────────────────────────
async function handleRemove(entityId: string) {
  const result = await Swal.fire({
    title: 'Remove place?', text: 'This will remove the place from this collection.',
    showConfirmButton: true, showCancelButton: true, confirmButtonText: 'Remove',
  })
  if (result.isConfirmed) {
    await removeFromCollection(collectionId, entityId)
    removeEntityFromList(entityId)
    if (entities.value.length === 0 && entitiesPaging.currentPage.value > 1) {
      entitiesPaging.goToPage(entitiesPaging.currentPage.value - 1, () => getCollectionEntities(collectionId))
    }
  }
}


watch(processingError, (err) => { if (err && err !== '') push.error(err) })

onMounted(() => {
  getCollection(collectionId)
  getCollectionEntities(collectionId)
})

onUnmounted(() => clearTimeout(copyTimeout))
</script>
