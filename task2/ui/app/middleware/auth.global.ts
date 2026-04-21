import { useAuth } from "~/composables/useAuth"

export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated } = useAuth()

  const publicRoutes = ['/login', '/signup']
  const isPublicCollection = to.path.startsWith('/collections/public/')

  if (!isAuthenticated.value && !publicRoutes.includes(to.path) && !isPublicCollection) {
    return navigateTo('/login')
  }
})
