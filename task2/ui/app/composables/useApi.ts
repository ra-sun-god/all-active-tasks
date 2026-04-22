import { useCsrf } from "./useCsrf"

export const useApi = () => {

  const config = useRuntimeConfig()
  const { csrfToken, fetchToken } = useCsrf()

  const api = $fetch.create({

    credentials: 'include',
    baseURL: config.public.apiBase,

    async onRequest({ options }) {
      const method = (options.method || 'GET').toUpperCase()

      // Only for mutating requests
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        if (!csrfToken.value) {
          await fetchToken()
        }

        options.headers = {
          ...(options.headers || {}),
          'csrf-token': csrfToken.value
        } as any;
      }
    }
  })

  return api
}
