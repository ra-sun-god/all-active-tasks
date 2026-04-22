export const useCsrf = () => {
  const csrfToken = useState<string | null>('csrf-token', () => null)
  const { public: { apiBase } } = useRuntimeConfig()

  const fetchToken = async () => {

    if (csrfToken.value) return

    const { csrfToken: token } = await $fetch('/csrf-token', {
      baseURL: apiBase,
      credentials: 'include'
    }) as { csrfToken: string }

    csrfToken.value = token
  }

  return {
    csrfToken,
    fetchToken
  }
}
