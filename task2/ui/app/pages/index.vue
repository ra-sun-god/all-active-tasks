<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-6 py-8">

      <!-- Header -->
      <div class="flex justify-between items-center mb-0">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">
            {{ $t('collections.myCollections') }}
          </h1>
          <p v-if="!collectionsLoading && collectionList.length > 0" class="text-sm text-gray-400 mt-0.5">
            {{ collectionList.length }} collection{{ collectionList.length === 1 ? '' : 's' }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="createNewCollection"
            class="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-150 shadow-sm shadow-indigo-200"
          >
            <span class="text-base leading-none">+</span>
            {{ $t('collections.new') }}
          </button>

          <NuxtLink
            to="/places"
            class="text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white px-4 py-2 rounded-lg transition-colors duration-150"
          >
            <span class="text-gray-400">{{ $t('common.places') }}</span>
          </NuxtLink>

          <button
            @click.prevent="logout"
            class="text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white px-4 py-2 rounded-lg transition-colors duration-150"
          >
            <span v-if="!loading">{{ $t('auth.logoutBtn') }}</span>
            <span v-else class="text-gray-400">{{ $t('common.loading') }}</span>
          </button>

          <LangSwitch />
        </div>
      </div>
      <div>
        <div class="flex items-center gap-2 mb-8">
          <Sharer :url="shareUrl" />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="collectionsLoading" class="flex flex-col items-center justify-center py-24 gap-3">
        <div class="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p class="text-sm text-gray-400">{{ $t('common.loading') }}</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="collectionList.length === 0" class="flex flex-col items-center justify-center py-24 gap-4">
        <div class="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">
          🗂️
        </div>
        <div class="text-center">
          <p class="text-sm font-medium text-gray-700">{{ $t('collections.noCollections') }}</p>
          <p class="text-xs text-gray-400 mt-1">Create your first collection to get started</p>
        </div>
        <button
          @click="createNewCollection"
          class="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-150"
        >
          <span class="text-base leading-none">+</span>
          {{ $t('collections.new') }}
        </button>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <CollectionCard
          v-for="col in collectionList"
          :key="col.id"
          :collection="col"
          @click="() => {}"
          @edit="editCollection"
          @delete="handleDelete"
        />
      </div>

      <!-- Pagination -->
      <Pagination
        v-if="!collectionsLoading && listPaging.totalPages.value > 1"
        class="mt-10"
        :current-page="listPaging.currentPage.value"
        :total-pages="listPaging.totalPages.value"
        :has-next="listPaging.hasNext.value"
        :has-prev="listPaging.hasPrev.value"
        @go="(page: number) => listPaging.goToPage(page, fetchCollectionList)"
        @next="listPaging.nextPage(fetchCollectionList)"
        @prev="listPaging.prevPage(fetchCollectionList)"
      />

    </div>

    <!-- Modal -->
    <CollectionModal
      :open="showModal"
      :collection="selected"
      @close="handleModalClose"
      @submit="handleSubmit"
      :key="showModal.toString()"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CollectionModal from '../components/CollectionModal.vue'
import Pagination from '../components/Pagination.vue'
import { useCollections } from '../composables/useCollections'
import { useAuth } from '../composables/useAuth'
import type { Collection } from '~/types'
import Swal from 'sweetalert2'
import { push } from 'notivue'
import Sharer from '~/components/Sharer.vue'

const {
  collections: collectionList,
  isFetching: collectionsLoading,
  fetchCollections: fetchCollectionList,
  updateCollectionsInPlace: updateCollectionInPlace,
  listPaging,
  createCollection,
  updateCollection,
  deleteCollection,
  processingError: collectionOpError,
} = useCollections()

const { user } = useAuth()

const { logout, loading } = useAuth()
const showModal = ref(false)
const selected = ref<Collection | null>(null)


const shareUrl = computed(() =>
  (typeof window !== 'undefined' && user.value != null)
    ? `${window.location.origin}/public/${user.value.id}`
    : ``
)

onMounted(() => fetchCollectionList())

watch(collectionOpError, (err) => {
  if (err && err !== '') push.error(err)
})

function createNewCollection() {
  selected.value = null
  showModal.value = true
}

function editCollection(col: Collection) {
  selected.value = col
  showModal.value = true
}

function handleModalClose() {
  showModal.value = false
  selected.value = null
}

async function handleSubmit(data: any) {
  if (selected.value) {
    updateCollection(selected.value.id, data).then(newData => {
      if(newData != null){
        updateCollectionInPlace(newData.id, newData)
      }
    })
  } else {
    await createCollection(data.title, data.description, data.isPublic)
  }
  handleModalClose()
}

async function handleDelete(id: string) {
  const response = await Swal.fire({
    title: $t('common.confirm_delete'),
    text: $t('common.delete_collection'),
    showConfirmButton: true,
    showCancelButton: true,
    confirmButtonText: $t('common.confirm')
  })

  if (response.isConfirmed) {
    await deleteCollection(id)
  }
}
</script>
