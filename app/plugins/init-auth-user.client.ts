import { useAuthUserStore } from '@/stores/auth-user'

export default defineNuxtPlugin(async () => {
  const auth = useAuthUserStore()
  
  if (auth.token) {
    await auth.fetchUser()
  } else {
    auth.isLoaded = true
  }
})
