<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-6 py-8">

      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <!-- Loading skeleton -->
          <div v-if="isFetchingPublic && !publicCollections.length" class="space-y-2">
            <div class="h-7 w-48 bg-gray-200 rounded-lg animate-pulse" />
            <div class="h-4 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
          <template v-else>
            <h1 class="text-2xl font-bold text-gray-900 tracking-tight">
              Public Collections
            </h1>
            <p class="text-sm text-gray-400 mt-0.5">
              {{ publicListPaging.total.value }} collection{{ publicListPaging.total.value === 1 ? '' : 's' }} shared publicly
            </p>
          </template>
        </div>

        <!-- CTA to sign up / log in -->
        <div class="flex items-center gap-2">
          <NuxtLink
            to="/login"
            class="text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white px-4 py-2 rounded-lg transition-colors duration-150"
          >
            Log in
          </NuxtLink>
          <NuxtLink
            to="/signup"
            class="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-150 shadow-sm shadow-indigo-200"
          >
            Sign up free
          </NuxtLink>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isFetchingPublic && !publicCollections.length" class="flex flex-col items-center justify-center py-24 gap-3">
        <div class="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p class="text-sm text-gray-400">{{ $t('common.loading') }}</p>
      </div>

      <!-- Empty -->
      <div v-else-if="!publicCollections.length" class="flex flex-col items-center justify-center py-24 gap-4">
        <div class="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">🗂️</div>
        <div class="text-center">
          <p class="text-sm font-medium text-gray-700">No public collections yet</p>
          <p class="text-xs text-gray-400 mt-1">This user hasn't shared any collections publicly</p>
        </div>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <CollectionCard
          v-for="col in publicCollections"
          :key="col.id"
          :collection="col"
          :is-public-view="true"
          @click="navigateTo(`/public/collection/${col.id}`)"
        />
      </div>

      <!-- Pagination -->
      <Pagination
        v-if="!isFetchingPublic && publicListPaging.totalPages.value > 1"
        class="mt-10"
        :current-page="publicListPaging.currentPage.value"
        :total-pages="publicListPaging.totalPages.value"
        :has-next="publicListPaging.hasNext.value"
        :has-prev="publicListPaging.hasPrev.value"
        @go="(page: number) => publicListPaging.goToPage(page, () => fetchPublicCollections(userId))"
        @next="publicListPaging.nextPage(() => fetchPublicCollections(userId))"
        @prev="publicListPaging.prevPage(() => fetchPublicCollections(userId))"
      />

    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useCollections } from '~/composables/useCollections'
import Pagination from '~/components/Pagination.vue'

const route = useRoute()
const userId = route.params.userId as string

const {
  publicCollections,
  isFetchingPublic,
  fetchPublicCollections,
  publicListPaging,
} = useCollections()

onMounted(() => fetchPublicCollections(userId))
</script>
