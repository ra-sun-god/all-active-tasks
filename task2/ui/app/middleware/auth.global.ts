import { useAuth } from "~/composables/useAuth"

export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, fetchUser, user } = useAuth()

  await fetchUser()

  console.log("user===>", user.value)

  const publicRoutes = ['/login', '/signup']
  const isPublicCollection = /\/public\/(collection\/)?([0-9]+)/.test(to.path)

  if (!isAuthenticated.value && !publicRoutes.includes(to.path) && !isPublicCollection) {
    return navigateTo('/login')
  }
})
