<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">

    <!-- Card -->
    <div class="w-full max-w-sm bg-white rounded-2xl shadow-xl shadow-gray-200/80 overflow-hidden">

      <!-- Top accent -->
      <div class="h-1 w-full bg-gradient-to-r from-indigo-500 to-violet-500" />

      <div class="px-8 py-8 space-y-6">

        <!-- Header -->
        <div class="space-y-1">
          <h2 class="text-2xl font-bold text-gray-900 tracking-tight">
            {{ $t('auth.login') }}
          </h2>
          <p class="text-sm text-gray-400">
            {{ $t('auth.haveAccount') }}
          </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="login(form)" class="space-y-4">

          <!-- Email -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {{ $t('auth.email') }}
            </label>
            <input
              v-model="form.email"
              type="email"
              required
              placeholder="you@example.com"
              :disabled="loading"
              class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <!-- Password -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {{ $t('auth.password') }}
              </label>
            </div>
            <input
              v-model="form.password"
              type="password"
              required
              placeholder="••••••••"
              :disabled="loading"
              class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm shadow-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 mt-1"
          >
            <svg v-if="loading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <span>{{ loading ? $t('common.loading') : $t('auth.loginBtn') }}</span>
          </button>

        </form>

        <!-- Footer -->
        <p class="text-center text-sm text-gray-400">
          {{ $t('auth.noAccount') }}
          <NuxtLink
            to="/signup"
            class="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            {{ $t('auth.signup') }}
          </NuxtLink>
        </p>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Login } from '~/types'
import { useAuth } from '~/composables/useAuth'
import { push } from 'notivue'

const { login, error, loading } = useAuth()
const form = reactive<Login>({ email: '', password: '' })

watch(error, (err) => {
  if (err && err !== '') push.error(err)
})
</script>
