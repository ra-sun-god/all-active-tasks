<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-6 py-8">

      <!-- Header -->
      <div class="flex items-start justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Places</h1>
          <p class="text-sm text-gray-400 mt-0.5">Discover and save places to your collections</p>
        </div>
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 bg-white px-4 py-2 rounded-lg transition-colors duration-150"
        >
          My Collections
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </NuxtLink>
      </div>

      <!-- Loading skeleton -->
      <div v-if="entitiesLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="n in 12" :key="n" class="bg-white border border-gray-100 rounded-xl overflow-hidden animate-pulse">
          <div class="aspect-[4/3] bg-gray-100" />
          <div class="p-4 space-y-2.5">
            <div class="h-4 bg-gray-100 rounded w-3/4" />
            <div class="h-3 bg-gray-50 rounded w-1/2" />
            <div class="h-8 bg-gray-100 rounded-lg mt-3" />
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="entityList.length === 0" class="flex flex-col items-center justify-center py-24 gap-4">
        <div class="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">🗺️</div>
        <div class="text-center">
          <p class="text-sm font-medium text-gray-700">No places found</p>
          <p class="text-xs text-gray-400 mt-1">Check back soon for new content</p>
        </div>
      </div>

      <!-- Entity grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="entity in entityList"
          :key="entity.id"
          class="group bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/8 hover:border-gray-300 flex flex-col"
        >
          <!-- Image -->
          <div class="aspect-[4/3] overflow-hidden bg-gray-100 relative flex-shrink-0">
            <img
              v-if="entity.imageUrl && !failedImages.has(entity.id)"
              :src="entity.imageUrl"
              :alt="entity.name"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              @error="failedImages.add(entity.id)"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-4xl font-black text-white/50 select-none"
              :style="{ background: `linear-gradient(135deg, hsl(${entityHue(entity.id)}, 55%, 72%), hsl(${(entityHue(entity.id) + 40) % 360}, 50%, 65%))` }"
            >
              {{ entity.name?.charAt(0)?.toUpperCase() }}
            </div>

            <!-- "Saved" badge overlay — shown when entity is in ≥1 collection -->
            <div
              v-if="entity.userCollections?.length"
              class="absolute top-2 right-2 inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-emerald-600 text-[10px] font-semibold px-2 py-1 rounded-full border border-emerald-100 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              Saved
            </div>
          </div>

          <!-- Body -->
          <div class="p-4 flex flex-col gap-2 flex-1">
            <div>
              <h3 class="text-sm font-bold text-gray-900 leading-snug tracking-tight line-clamp-1">{{ entity.name }}</h3>
              <p v-if="entity.description" class="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{{ entity.description }}</p>
            </div>

            <!-- Collections this entity is already in -->
            <div v-if="entity.userCollections?.length" class="flex flex-wrap gap-1">
              <span
                v-for="col in entity.userCollections"
                :key="col.id"
                class="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md border"
                :style="{
                  background: `hsl(${titleToHue(col.title)}, 60%, 97%)`,
                  borderColor: `hsl(${titleToHue(col.title)}, 50%, 88%)`,
                  color: `hsl(${titleToHue(col.title)}, 55%, 42%)`
                }"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                {{ col.title }}
              </span>
            </div>

            <!-- Save to collection -->
            <div class="relative mt-auto pt-3 border-t border-gray-100" @click.stop>
              <button
                @click="toggleDropdown(entity.id)"
                class="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-colors duration-150"
                :class="openDropdownId === entity.id
                  ? 'bg-indigo-600 text-white'
                  : entity.userCollections?.length
                    ? 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'"
              >
                <!-- Bookmark icon: filled if saved, outline if not -->
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" :fill="entity.userCollections?.length ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                {{ entity.userCollections?.length ? 'Save to another' : 'Save to collection' }}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-3 h-3 ml-auto transition-transform duration-150"
                  :class="openDropdownId === entity.id ? 'rotate-180' : ''"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                >
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>

              <!-- Dropdown -->
              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 translate-y-1 scale-95"
                enter-to-class="opacity-100 translate-y-0 scale-100"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 translate-y-0 scale-100"
                leave-to-class="opacity-0 translate-y-1 scale-95"
              >
                <div
                  v-if="openDropdownId === entity.id"
                  class="absolute left-0 right-0 bottom-full mb-1.5 bg-white border border-gray-200 rounded-xl shadow-xl shadow-black/10 z-30 overflow-hidden"
                >
                  <div v-if="collectionsLoading" class="px-4 py-3 text-xs text-gray-400 text-center">
                    Loading collections...
                  </div>

                  <template v-else>
                    <!-- Step 2: note input -->
                    <template v-if="noteStep.entityId === entity.id && noteStep.collectionId">
                      <div class="p-3 space-y-2.5">
                        <div class="flex items-center gap-2">
                          <button @click="clearNoteStep" class="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M19 12H5M12 5l-7 7 7 7"/>
                            </svg>
                          </button>
                          <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ background: collectionAccent(noteStep.collectionTitle) }" />
                          <span class="text-xs font-semibold text-gray-800 truncate">{{ noteStep.collectionTitle }}</span>
                        </div>
                        <textarea
                          v-model="noteStep.note"
                          placeholder="Add a note… (optional)"
                          rows="2"
                          autofocus
                          class="w-full text-xs text-gray-800 placeholder:text-gray-400 border border-gray-200 rounded-lg px-2.5 py-2 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none transition-all duration-150"
                        />
                        <div class="flex gap-1.5">
                          <button
                            @click="clearNoteStep"
                            class="flex-1 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                          >
                            Cancel
                          </button>
                          <button
                            @click="confirmSave(entity)"
                            :disabled="savingMap[entity.id] != null"
                            class="flex-1 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-150 disabled:opacity-60 inline-flex items-center justify-center gap-1.5"
                          >
                            <svg v-if="savingMap[entity.id]" class="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                            {{ savingMap[entity.id] ? 'Saving…' : 'Save' }}
                          </button>
                        </div>
                      </div>
                    </template>

                    <!-- Step 1: pick a collection -->
                    <template v-else>
                      <ul v-if="collections.length > 0" class="py-1.5 max-h-48 overflow-y-auto">
                        <li v-for="col in collections" :key="col.id">
                          <button
                            @click="!isInCollection(entity, col.id) && selectCollection(entity.id, col.id, col.title)"
                            class="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors duration-100 group/item"
                            :class="isInCollection(entity, col.id)
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-indigo-50 cursor-pointer'"
                            :disabled="isInCollection(entity, col.id)"
                          >
                            <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ background: collectionAccent(col.title) }" />
                            <span
                              class="flex-1 text-xs font-medium truncate"
                              :class="isInCollection(entity, col.id) ? 'text-gray-400' : 'text-gray-800 group-hover/item:text-indigo-700'"
                            >
                              {{ col.title }}
                            </span>
                            <!-- Already added checkmark -->
                            <svg v-if="isInCollection(entity, col.id)" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M20 6 9 17l-5-5"/>
                            </svg>
                            <!--<span v-else class="text-[10px] text-gray-400 flex-shrink-0">{{ col.entities?.length ?? 0 }}</span>-->
                          </button>
                        </li>
                      </ul>
                      <div v-else class="px-4 pt-3 pb-1 text-center">
                        <p class="text-xs text-gray-400">No collections yet</p>
                      </div>

                      <div class="border-t border-gray-100 p-1.5">
                        <button
                          @click="openCreateCollection(entity.id)"
                          class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors duration-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 5v14M5 12h14"/>
                          </svg>
                          New collection
                        </button>
                      </div>
                    </template>
                  </template>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <Pagination
        v-if="!entitiesLoading"
        class="mt-10"
        :current-page="paging.currentPage.value"
        :total-pages="paging.totalPages.value"
        :has-next="paging.hasNext.value"
        :has-prev="paging.hasPrev.value"
        @go="(page:number) => paging.goToPage(page, fetchEntityList)"
        @next="paging.nextPage(fetchEntityList)"
        @prev="paging.prevPage(fetchEntityList)"
      />
    </div>
  </div>

  <!-- Collection creation modal -->
  <CollectionModal
    :open="showCollectionModal"
    :collection="null"
    @close="showCollectionModal = false"
    @submit="handleCreateCollection"
  />
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useEntities } from '~/composables/useEntities'
import { useCollections } from '~/composables/useCollections'
import type { Entity } from '~/types'
import { push } from 'notivue'
import Pagination from '~/components/Pagination.vue'


// ── Entities ──────────────────────────────────────────────
const {
  entityList,
  isLoading: entitiesLoading,
  paging,
  fetchEntityList,
} = useEntities()

// ── Collections ───────────────────────────────────────────
const {
  collections,
  isFetching: collectionsLoading,
  fetchCollections,
  updateCollectionsInPlace,
  addToCollection,
  createCollection
} = useCollections()


// ── Image fallback ────────────────────────────────────────
const failedImages = reactive(new Set<string>())

function entityHue(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 360
}

// ── Already-in-collection check ───────────────────────────
function isInCollection(entity: Entity, collectionId: string): boolean {
  return entity.userCollections?.some(c => c.id === collectionId) ?? false
}

// ── Dropdown state ────────────────────────────────────────
const openDropdownId = ref<string | null>(null)
const savingMap = reactive<Record<string, string>>({})

function toggleDropdown(entityId: string) {
  if (openDropdownId.value === entityId) {
    openDropdownId.value = null
    clearNoteStep()
  } else {
    openDropdownId.value = entityId
    clearNoteStep()
  }
}

function handleOutsideClick() {
  if (openDropdownId.value) {
    openDropdownId.value = null
    clearNoteStep()
  }
}

// ── Note step ─────────────────────────────────────────────
const noteStep = reactive({
  entityId: null as string | null,
  collectionId: null as string | null,
  collectionTitle: '',
  note: '',
})

function selectCollection(entityId: string, collectionId: string, collectionTitle: string) {
  noteStep.entityId = entityId
  noteStep.collectionId = collectionId
  noteStep.collectionTitle = collectionTitle
  noteStep.note = ''
}

function clearNoteStep() {
  noteStep.entityId = null
  noteStep.collectionId = null
  noteStep.collectionTitle = ''
  noteStep.note = ''
}

async function confirmSave(entity: Entity) {
  if (!noteStep.collectionId) return
  const collectionId = noteStep.collectionId
  const note = noteStep.note.trim() || undefined

  savingMap[entity.id] = collectionId
  try {
    await addToCollection(collectionId, entity.id, note)
    // Optimistically update userCollections so the UI reflects the save immediately
    if (!entity.userCollections) entity.userCollections = []
    entity.userCollections.push({ id: collectionId, title: noteStep.collectionTitle })
    push.success('Saved to collection!')
    openDropdownId.value = null
    clearNoteStep()
  } catch {
    push.error('Failed to save — please try again')
  } finally {
    delete savingMap[entity.id]
  }
}

// ── New collection flow ───────────────────────────────────
const showCollectionModal = ref(false)
const pendingEntityId = ref<string | null>(null)

function openCreateCollection(entityId: string) {
  pendingEntityId.value = entityId
  openDropdownId.value = null
  clearNoteStep()
  showCollectionModal.value = true
}

async function handleCreateCollection(data: { title: string; description?: string; isPublic: boolean }) {
  try {
    const newCollection = await createCollection(data.title, data.description, data.isPublic)
    updateCollectionsInPlace(newCollection!.id, newCollection!)
    if (pendingEntityId.value) {
      openDropdownId.value = pendingEntityId.value
      selectCollection(pendingEntityId.value, newCollection!.id, newCollection!.title)
    }
  } catch {
    push.error('Failed to create collection')
  } finally {
    showCollectionModal.value = false
    pendingEntityId.value = null
  }
}

// ── Accent colours ────────────────────────────────────────
function titleToHue(title: string = ""): number {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 360
}

function collectionAccent(title: string) {
  return `hsl(${titleToHue(title)}, 65%, 52%)`
}

// ── Init ──────────────────────────────────────────────────
onMounted(() => {
  fetchEntityList()
  fetchCollections()
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>
