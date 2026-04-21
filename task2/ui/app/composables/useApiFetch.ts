import type { UseFetchOptions } from 'nuxt/app'

export const useApiFetch = <T>(url: string, options: UseFetchOptions<T> = {}) => {
  const config = useRuntimeConfig()

  const headers = process.server
    ? useRequestHeaders(['cookie'])
    : undefined

  return useFetch<T>(url, {
    baseURL: config.public.apiBase,
    credentials: 'include',
    headers,
    ...options,
  } as any)
}
