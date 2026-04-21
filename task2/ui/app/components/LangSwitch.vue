<template>
  <select
    class="border border-gray-200 text-gray-700 px-2 py-2 rounded-md text-sm"
    v-model="lang"
  >
    <option :value="l.code.toString()" v-for="l in locales" :key="l.code">
      {{l.emoji}} {{l.code.toUpperCase()}}
    </option>
  </select>
</template>
<script lang="ts" setup>
import { useI18n } from "#imports"
const { locale, locales, setLocale } = useI18n()
const lang = ref<string>(locale.value.toString())

watch(lang, (newLang) => {
  setLocale(newLang as any)
})
</script>
