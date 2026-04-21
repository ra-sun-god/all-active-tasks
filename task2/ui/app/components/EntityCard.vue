<template>
  <div class="group bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/8 hover:border-gray-300 flex flex-col">

    <!-- Image -->
    <div class="aspect-[4/3] overflow-hidden bg-gray-100 relative flex-shrink-0">
      <img
        v-if="entity.imageUrl && !imgFailed"
        :src="entity.imageUrl"
        :alt="entity.name"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        @error="imgFailed = true"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-4xl font-black text-white/50 select-none"
        :style="{ background: `linear-gradient(135deg, hsl(${hue}, 55%, 72%), hsl(${(hue + 40) % 360}, 50%, 65%))` }"
      >
        {{ entity.name?.charAt(0)?.toUpperCase() }}
      </div>

      <!-- Category badge -->
      <span class="absolute top-2 left-2 inline-flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-full capitalize">
        {{ entity.category?.replace('_', ' ') }}
      </span>
    </div>

    <!-- Body -->
    <div class="p-4 flex flex-col gap-2.5 flex-1">

      <!-- Name -->
      <h3 class="text-sm font-bold text-gray-900 leading-snug tracking-tight line-clamp-1">
        {{ entity.name }}
      </h3>

      <!-- Description -->
      <p v-if="entity.description" class="text-xs text-gray-400 leading-relaxed line-clamp-2">
        {{ entity.description }}
      </p>

      <!-- Note -->
      <div v-if="entity.note" class="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <p class="text-[11px] text-amber-700 leading-relaxed line-clamp-2">{{ entity.note }}</p>
      </div>

      <!-- Meta row -->
      <div class="flex items-center justify-between mt-auto pt-2.5 border-t border-gray-100">
        <!-- Coordinates -->
        <span class="inline-flex items-center gap-1 text-[10px] text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {{ entity.latitude?.toFixed(3) }}, {{ entity.longitude?.toFixed(3) }}
        </span>

        <!-- Added date -->
        <span class="text-[10px] text-gray-400">{{ formatDate(entity.addedAt, locale) }}</span>
      </div>
    </div>

    <!-- Remove action — slides up on hover -->
    <div
      v-if="!isPublicView"
      class="px-4 pb-3.5 opacity-0 -translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0"
    >
      <button
        @click.stop="emit('remove', entity.id)"
        class="w-full text-[11px] font-semibold py-1.5 rounded-md border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-200 transition-colors duration-150 cursor-pointer"
      >
        Remove from collection
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '#imports';
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Entity } from '~/types'

const props = withDefaults(defineProps<{
  entity: Entity
  isPublicView?: boolean
}>(), {
  isPublicView: false,
})

//console.log("entity===>", props.entity)

const emit = defineEmits<{
  (e: 'remove', id: string): void
}>()

const { locale } = useI18n()
const imgFailed = ref(false)

function idToHue(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 360
}

const hue = computed(() => idToHue(props.entity.id))


</script>
