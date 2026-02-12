export default defineNuxtRouteMiddleware(async () => {
    const auth = useAuthUserStore()

    if (!auth.token) {
        return navigateTo('/auth/login/user')
    }
    if (!auth.user) {
        await auth.fetchUser()
    }
})