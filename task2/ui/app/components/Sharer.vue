<template>
  <div class="flex items-center flex-wrap gap-2 mt-3">
    <div class="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-500 max-w-xs">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
      <span class="truncate font-mono w-[200px]">{{ props.url }}</span>
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
</template>
<script lang="ts" setup>

  const props = defineProps<{
    url: string
  }>()

  const copied = ref(false)
  let copyTimeout: ReturnType<typeof setTimeout>

  async function copyShareUrl() {
    try {
      await navigator.clipboard.writeText(props.url)
      copied.value = true
      clearTimeout(copyTimeout)
      copyTimeout = setTimeout(() => { copied.value = false }, 2000)
    } catch {
      push.error('Could not copy link')
    }
  }

</script>
