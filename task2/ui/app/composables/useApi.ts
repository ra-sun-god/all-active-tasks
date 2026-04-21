export const useApi = () => {
  const { public: { apiBase } } = useRuntimeConfig()

  const headers = process.server
    ? useRequestHeaders(['cookie'])
    : undefined

  return $fetch.create({
    baseURL: apiBase,
    credentials: 'include',
    headers,
  })
}
