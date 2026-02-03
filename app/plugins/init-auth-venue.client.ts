import { useAuthVenueStore } from '@/stores/auth-venue'

export default defineNuxtPlugin(() => {
    const auth = useAuthVenueStore()
    const token = localStorage.getItem('venue_token')
    if (token && !auth.token) {
        auth.token = token
    }
})