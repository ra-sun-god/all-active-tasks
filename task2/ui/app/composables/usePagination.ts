export function usePagination(defaultLimit = 20) {
  const total = ref(0)
  const limit = ref(defaultLimit)
  const offset = ref(0)

  const totalPages = computed(() => Math.ceil(total.value / limit.value))
  const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1)
  const hasNext = computed(() => offset.value + limit.value < total.value)
  const hasPrev = computed(() => offset.value > 0)

  async function goToPage(page: number, fetchFn: () => Promise<void>) {
    offset.value = (page - 1) * limit.value
    await fetchFn()
  }

  function nextPage(fetchFn: () => Promise<void>) {
    if (hasNext.value) goToPage(currentPage.value + 1, fetchFn)
  }

  function prevPage(fetchFn: () => Promise<void>) {
    if (hasPrev.value) goToPage(currentPage.value - 1, fetchFn)
  }

  function reset() {
    offset.value = 0
    total.value = 0
  }

  return { total, limit, offset, totalPages, currentPage, hasNext, hasPrev, goToPage, nextPage, prevPage, reset }
}
