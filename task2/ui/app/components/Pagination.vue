<template>
  <div v-if="totalPages > 1" class="flex justify-center items-center gap-1.5">

    <!-- Prev -->
    <button
      :disabled="!hasPrev"
      @click="emit('prev')"
      class="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all duration-150"
      :class="hasPrev
        ? 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
        : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'"
    >
      ← Prev
    </button>

    <!-- Windowed page buttons -->
    <template v-for="item in windowedPages" :key="item.key">
      <!-- Ellipsis -->
      <span v-if="item.type === 'ellipsis'" class="px-1 text-gray-400 text-sm select-none">
        ···
      </span>
      <!-- Page button -->
      <button
        v-else
        @click="emit('go', item.page!)"
        class="min-w-[36px] px-3 py-1.5 text-sm font-medium rounded-lg border transition-all duration-150"
        :class="currentPage === item.page
          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-200'
          : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'"
      >
        {{ item.page }}
      </button>
    </template>

    <!-- Next -->
    <button
      :disabled="!hasNext"
      @click="emit('next')"
      class="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all duration-150"
      :class="hasNext
        ? 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
        : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'"
    >
      Next →
    </button>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}>()

const emit = defineEmits<{
  (e: 'go', page: number): void
  (e: 'next'): void
  (e: 'prev'): void
}>()

type PageItem =
  | { type: 'page'; page: number; key: string }
  | { type: 'ellipsis'; key: string }

/**
 * Strategy:
 * - Always show first and last page
 * - Show a window of ±2 around the current page
 * - Replace gaps of more than 1 page with an ellipsis
 * - If total ≤ 7 pages just show all of them — no ellipsis needed
 */
const windowedPages = computed<PageItem[]>(() => {
  const total = props.totalPages
  const current = props.currentPage

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => ({
      type: 'page' as const,
      page: i + 1,
      key: `p${i + 1}`,
    }))
  }

  const visibleSet = new Set<number>()
  visibleSet.add(1)
  visibleSet.add(total)
  for (let p = Math.max(2, current - 2); p <= Math.min(total - 1, current + 2); p++) {
    visibleSet.add(p)
  }

  const sorted = Array.from(visibleSet).sort((a, b) => a - b)
  const items: PageItem[] = []

  for (let i = 0; i < sorted.length; i++) {
    const page = sorted[i] as number;
    const prev = sorted[i - 1]

    if (prev !== undefined && page - prev > 1) {
      items.push({ type: 'ellipsis', key: `ellipsis-${prev}-${page}` })
    }
    items.push({ type: 'page', page, key: `p${page}` })
  }

  return items
})
</script>
