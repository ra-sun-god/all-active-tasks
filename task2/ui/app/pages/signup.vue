<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md space-y-8 p-8 bg-white rounded-2xl shadow-lg">

      <!-- Header -->
      <div class="text-center space-y-2">
        <h2 class="text-3xl font-bold text-gray-900">
          {{ $t('auth.signup') }}
        </h2>
        <p class="text-sm text-gray-500">
          Create your account to get started
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="signup(form)" class="space-y-5">

        <!-- Username -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ $t('auth.name') }}
          </label>
          <input
            v-model="form.name"
            type="text"
            required
             :disabled="loading"
            placeholder="John"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                   transition"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ $t('auth.email') }}
          </label>
          <input
            v-model="form.email"
            type="email"
            required
             :disabled="loading"
            placeholder="you@example.com"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                   transition"
          />
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ $t('auth.password') }}
          </label>
          <input
            v-model="form.password"
            type="password"
            required
             :disabled="loading"
            placeholder="••••••••"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                   transition"
          />
        </div>

        <!-- Button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full flex items-center justify-center py-2.5 px-4 rounded-lg
                 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <span v-if="!loading">{{ $t('auth.signupBtn') }}</span>
          <span v-else>{{ $t('common.loading') }}</span>
        </button>
      </form>

      <!-- Footer -->
      <p class="text-center text-sm text-gray-600">
        {{ $t('auth.haveAccount') }}
        <NuxtLink
          to="/login"
          class="font-medium text-indigo-600 hover:text-indigo-500"
        >
          {{ $t('auth.login') }}
        </NuxtLink>
      </p>

    </div>
  </div>
</template>

<script setup lang="ts">
import type { Signup } from '~/types';
import { push } from 'notivue'

const { signup, error, loading } = useAuth();
const form = reactive<Signup>({ name: "", password: "", email: "" })

watch(error, (err)=> {
  if(err && err != "") push.error(err)
})
</script>
