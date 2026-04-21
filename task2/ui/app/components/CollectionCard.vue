<template>
  <AaCard
    class="group relative bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/8 hover:border-gray-300"
    @click="navigateTo(`/collections/${collection.id}`)"
  >
    <!-- 2×2 thumbnail grid -->
    <div class="grid grid-cols-2 aspect-[4/3] bg-gray-50 relative overflow-hidden">
      <!-- Accent line overlaid on top of the grid -->
      <div class="absolute top-0 inset-x-0 h-[3px] z-10" :style="{ background: accentGradient }" />

      <template v-if="(collection?.entities ?? []).length > 0">
        <div
          v-for="(entity, i) in paddedEntities"
          :key="entity?.id ?? `empty-${i}`"
          class="relative overflow-hidden"
        >
          <!-- Real entity with image -->
          <img
            :src="entity?.imageUrl ?? 'https://placehold.net/default.svg'"
            @error="onImgError"
            :alt="entity?.name"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <!-- Inner grid lines -->
          <div v-if="i % 2 === 0" class="absolute right-0 inset-y-0 w-px bg-white/40" />
          <div v-if="i < 2" class="absolute bottom-0 inset-x-0 h-px bg-white/40" />
        </div>
      </template>

      <!-- Truly empty collection placeholder -->
      <div
        v-else
        class="col-span-2 row-span-2 flex flex-col items-center justify-center gap-2"
        :style="{ background: `linear-gradient(135deg, hsl(${hue},20%,97%), hsl(${hue},20%,92%))` }"
      >
        <div class="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" :style="{ background: accentGradient }">
          <svg class="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </div>
        <span class="text-[10px] text-gray-400 font-medium tracking-wide">Empty collection</span>
      </div>
    </div>

    <!-- Card body -->
    <div class="flex flex-col gap-3 px-[18px] pt-3.5 pb-3.5">
      <!-- Top row: badge + entity count -->
      <div class="flex items-center justify-between">
        <span
          class="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full border"
          :class="collection.isPublic
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-slate-50 text-slate-500 border-slate-200'"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
          {{ collection.isPublic ? $t('collections.public') : $t('collections.private') }}
        </span>

        <div class="flex items-baseline gap-1">
          <span class="text-lg font-bold text-gray-900 tabular-nums leading-none">
            {{ collection.totalEntities ?? 0 }}
          </span>
          <span class="text-[10px] text-gray-400 font-medium tracking-wide">items</span>
        </div>
      </div>

      <!-- Title + accent rule -->
      <div class="flex flex-col gap-2">
        <h3 class="text-[15px] font-bold text-gray-900 leading-snug tracking-tight line-clamp-2 m-0">
          {{ collection.title }}
        </h3>
        <div
          class="h-0.5 w-8 rounded-full transition-all duration-300 group-hover:w-14"
          :style="{ background: accentColor }"
        />
      </div>

      <!-- Footer row -->
      <div class="flex items-center justify-between pt-2.5 border-t border-gray-100">
        <span class="text-[11px] text-gray-400 tracking-wide">{{ formatDate(collection.createdAt) }}</span>

        <div
          v-if="!isPublicView"
          class="flex gap-1.5 opacity-0 translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
          @click.stop
        >
          <button
            class="text-[11px] font-semibold px-2.5 py-1 rounded-md border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors duration-150 cursor-pointer"
            @click.stop="emit('edit', collection)"
          >
            {{ $t('common.edit') }}
          </button>
          <button
            class="text-[11px] font-semibold px-2.5 py-1 rounded-md border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-200 transition-colors duration-150 cursor-pointer"
            @click.stop="emit('delete', collection.id)"
          >
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
  </AaCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Collection, EntityWithImage } from '~/types'

const props = withDefaults(defineProps<{
  collection: Collection
  entityDetails?: Record<string, EntityWithImage>
  isPublicView?: boolean
}>(), {
  entityDetails: () => ({}),
  isPublicView: false
})

const emit = defineEmits<{
  (e: 'edit', c: Collection): void
  (e: 'delete', id: string): void
}>()

const { locale } = useI18n()


function titleToHue(title: string): number {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 360
}

const hue = computed(() => titleToHue(props.collection.title))
const accentColor = computed(() => `hsl(${hue.value}, 65%, 52%)`)
const accentGradient = computed(() =>
  `linear-gradient(90deg, hsl(${hue.value}, 70%, 55%), hsl(${(hue.value + 40) % 360}, 65%, 60%))`
)


/** Always exactly 4 slots — null means empty filler cell */
const paddedEntities = computed<(EntityWithImage | null)[]>(() => {
  const list = props.collection?.entities ?? []
  return Array.from({ length: 4 }, (_, i) => list[i] ?? null)
})

function formatDate(dateString: string) {
  if (!dateString) return ''
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(dateString))
}

const fallback = 'https://placehold.net/default.svg'

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement

  if (img.src !== fallback) {
    img.src = fallback
  }
}
</script>
