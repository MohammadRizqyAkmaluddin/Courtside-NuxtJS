export default defineNuxtRouteMiddleware(() => {
    const auth = useAuthVenueStore()
    if (!auth.token) {
        return navigateTo('/login/venue')
    }
})