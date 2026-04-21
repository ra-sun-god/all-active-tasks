<template>
  <div class="relative">
    <!-- Input -->
    <input
      v-model="query"
      @input="onInput"
      type="text"
      placeholder="Search for a place..."
      class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
    />

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="suggestions.length"
        class="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
      >
        <ul class="max-h-60 overflow-y-auto">
          <li
            v-for="place in suggestions"
            :key="place.place_id"
            @click="selectPlace(place)"
            class="px-3 py-2.5 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            {{ place.formatted }}
          </li>
        </ul>
      </div>
    </Transition>

    <!-- Selected preview -->
    <div
      v-if="selected"
      class="mt-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2"
    >
      <div class="font-medium text-gray-700">{{ selected.name }}</div>
      <div class="text-gray-400">
        {{ selected.lat.toFixed(4) }}, {{ selected.lng.toFixed(4) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const config = useRuntimeConfig()
const emit = defineEmits(["select"]);

const GEOAPIFY_KEY = config.public.geoApifyKey;

const query = ref("");
const suggestions = ref<any[]>([]);
const selected = ref<any>(null);

let debounceTimer: any = null;

const onInput = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fetchPlaces, 300);
};

const fetchPlaces = async () => {
  if (query.value.length < 3) {
    suggestions.value = [];
    return;
  }

  try {
    const res = await fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
        query.value
      )}&apiKey=${GEOAPIFY_KEY}`
    );

    const data = await res.json();

    suggestions.value = data.features.map((f: any) => ({
      place_id: f.properties.place_id,
      name: f.properties.name,
      formatted: f.properties.formatted,
      lat: f.properties.lat,
      lng: f.properties.lon
    }));
  } catch (err) {
    console.error("Autocomplete error:", err);
  }
};

const selectPlace = (place: any) => {
  selected.value = place;
  suggestions.value = [];
  query.value = place.formatted;

  emit("select", place); // 🔥 important for parent form
};
</script>
