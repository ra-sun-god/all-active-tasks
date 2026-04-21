<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close" />

      <!-- Modal -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95 translate-y-2"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-2"
      >
        <div v-if="open" class="relative bg-white rounded-2xl shadow-xl w-full max-w-md z-10 overflow-hidden">

          <!-- Top accent bar -->
          <div class="h-1 w-full bg-gradient-to-r from-indigo-500 to-violet-500" />

          <div class="p-6">
            <!-- Header -->
            <div class="flex items-start justify-between mb-6">
              <div>
                <h2 class="text-lg font-bold text-gray-900 tracking-tight">
                  {{ isEdit ? 'Edit Collection' : 'New Collection' }}
                </h2>
                <p class="text-xs text-gray-400 mt-0.5">
                  {{ isEdit ? 'Update your collection details' : 'Add a new collection to your library' }}
                </p>
              </div>
              <button
                @click="close"
                class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-colors duration-150 -mt-0.5 -mr-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="space-y-4">

              <!-- Title -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</label>
                <input
                  v-model="form.title"
                  type="text"
                  placeholder="e.g. Favourite Restaurants"
                  class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  :class="{ 'border-red-300 focus:border-red-400 focus:ring-red-100': error }"
                />
              </div>

              <!-- Description -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Description <span class="text-gray-300 font-normal normal-case">(optional)</span></label>
                <textarea
                  v-model="form.description"
                  placeholder="What's this collection about?"
                  rows="3"
                  class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
                />
              </div>

              <!-- Public toggle -->
              <label class="flex items-center justify-between p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-150 group">
                <div class="flex flex-col gap-0.5">
                  <span class="text-sm font-medium text-gray-800">Make public</span>
                  <span class="text-xs text-gray-400">Anyone with the link can view this collection</span>
                </div>
                <!-- Toggle switch -->
                <div
                  class="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
                  :class="form.isPublic ? 'bg-indigo-600' : 'bg-gray-200'"
                >
                  <input type="checkbox" v-model="form.isPublic" class="sr-only" />
                  <span
                    class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                    :class="form.isPublic ? 'translate-x-5' : 'translate-x-0'"
                  />
                </div>
              </label>

              <!-- Error -->
              <div v-if="error" class="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span class="text-xs font-medium">{{ error }}</span>
              </div>

              <!-- Actions -->
              <div class="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  @click="close"
                  class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white rounded-lg transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-200 transition-colors duration-150"
                >
                  {{ isEdit ? 'Save changes' : 'Create collection' }}
                </button>
              </div>

            </form>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { reactive, watch, computed, ref } from 'vue'
import type { Collection } from '../types'

const props = defineProps<{
  open: boolean
  collection?: Collection | null
}>()

const emit = defineEmits(['close', 'submit'])

const form = reactive({
  title: '',
  description: '',
  isPublic: false,
})

const error = ref<string | null>(null)
const isEdit = computed(() => props.collection != null)

watch(
  () => props.collection,
  (val) => {
    if (val != null) {
      form.title = val.title
      form.description = val.description || ''
      form.isPublic = val.isPublic
    } else {
      form.title = ''
      form.description = ''
      form.isPublic = false
    }
  },
  { immediate: true }
)

function close() {
  emit('close')
}

function handleSubmit() {
  error.value = null
  if (!form.title.trim()) {
    error.value = 'Title is required'
    return
  }
  emit('submit', { ...form })
}
</script>
