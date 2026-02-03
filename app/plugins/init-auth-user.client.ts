import { useAuthUserStore } from '@/stores/auth-user'
 
export default defineNuxtPlugin(async () => {
    const auth = useAuthUserStore()
    const token = localStorage.getItem('user_token')
    if (token && !auth.token) {
        auth.token = token
        await auth.fetchUser()
    }
})
