<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-6 py-8">

      <!-- Back to public listing -->
      <button
        @click="$router.back()"
        class="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors duration-150 mb-6 group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Back
      </button>

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
          <div class="flex items-start gap-4 w-full">
            <div class="w-14 h-14 rounded-xl flex-shrink-0 shadow-sm" :style="{ background: accentGradient }" />
            <div class="flex flex-wrap gap-4 items-start w-full justify-between">
              <div>
                <div class="flex items-center gap-2.5 flex-wrap">
                  <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ collection.title }}</h1>
                  <!-- Always public on this route -->
                  <span class="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-current" />
                    {{ $t('collections.public') }}
                  </span>
                </div>
                <p v-if="collection.description" class="text-sm text-gray-400 mt-1 max-w-xl">
                  {{ collection.description }}
                </p>
                <p class="text-xs text-gray-400 mt-1.5">
                  <span class="font-medium text-gray-600">{{ entitiesPaging.total.value }}</span>
                  {{ entitiesPaging.total.value === 1 ? 'place' : 'places' }}
                  · Created {{ formatDate(collection.createdAt,locale) }}
                </p>

                <!-- Share URL -->
                <Sharer :url="shareUrl" />
              </div>
              <div>

                <!-- Guest badge + CTA -->
                <div class="flex flex-col   gap-2 flex-shrink-0">
                  <div class="flex items-center gap-1.5 text-xs text-gray-400 bg-white border border-gray-200 px-3 py-1.5 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    Viewing as guest
                  </div>
                  <NuxtLink
                    to="/signup"
                    class="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors duration-150"
                  >
                    Sign up to create your own →
                  </NuxtLink>
                </div>

              </div>
            </div>
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
        <p class="text-sm font-medium text-gray-700">No places in this collection yet</p>
      </div>

      <!-- Entity grid — always read-only (isPublicView=true) -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <EntityCard
          v-for="entity in entities"
          :key="entity.id"
          :entity="entity"
          :is-public-view="true"
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { push } from 'notivue'
import { useCollections } from '~/composables/useCollections'
import Pagination from '~/components/Pagination.vue'
import Sharer from '~/components/Sharer.vue'
import { formatDate, titleToHue } from "~/utils"

const route = useRoute()
const { locale } = useI18n()
const collectionId = route.params.collectionId as string

const {
  collection, isFetching, getCollection,
  entities, isFetchingEntities, getCollectionEntities,
  entitiesPaging,
} = useCollections()

// ── Accent ────────────────────────────────────────────────

const hue = computed(() => titleToHue(collection.value?.title ?? ''))
const accentGradient = computed(() =>
  `linear-gradient(135deg, hsl(${hue.value}, 70%, 55%), hsl(${(hue.value + 40) % 360}, 65%, 60%))`
)

//  Share URL
const shareUrl = computed(() =>
  typeof window !== 'undefined'
    ? `${window.location.origin}/public/collection/${collectionId}`
    : `/public/collection/${collectionId}`
)


onMounted(() => {
  getCollection(collectionId)
  getCollectionEntities(collectionId)
})

onUnmounted(() => clearTimeout(copyTimeout))
</script>
