import { defineStore } from 'pinia'
import { api } from '@/services/api'

export const useAuthVenueStore = defineStore('authVenue', {
    state: () => ({
        venue: null as any,
        token: null as string | null,
    }),

    actions: {
        async login(payload: {email:string; password:string}) {
            const res: any = await api('/auth/venue/login', {
                method: 'POST',
                body: payload
            })
        
            this.token = res.token
            this.venue = res.venue

            localStorage.setItem('venue_token', res.token)
        },

        logout() {
            this.token = null
            this.venue = null
            localStorage.removeItem('venue_token')
        }
    }
})