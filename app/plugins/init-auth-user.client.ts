import { useAuthUserStore } from '@/stores/auth-user'

export default defineNuxtPlugin(() => {
  const auth = useAuthUserStore()
  auth.loadFromStorage()
})
