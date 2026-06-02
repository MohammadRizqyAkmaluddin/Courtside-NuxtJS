import { defineStore } from 'pinia'
import { api } from '@/services/api'

export const useAuthVenueStore = defineStore('authVenue', {
    state: () => ({
        venue: null as any,
        token: null as string | null,
    }),

    actions: {
        async register(payload: {
            name: string
            email: string
            password: string
            phone: string
            city_id: number
            address: string
        }) {
        const res: any = await api('/auth/venue/register', {
            method: 'POST',
            body: payload,
        })

        this.token = res.token
        this.venue = res.venue
        localStorage.setItem('user_token', res.token)
        },
        async login(payload: {email:string; password:string}) {
            const res: any = await api('/auth/venue/login', {
                method: 'POST',
                body: payload
            })
        
            this.token = res.token
            this.venue = res.venue

            localStorage.setItem('venue_token', res.token)
        },
        async fetchVenue() {
            if (!this.token) return

            try {
                const res: any = await api('/auth/venue/me')
                this.venue = res.venue
            } catch (err: any) {
                if (err?.status === 401) {
                    this.logout()
                }
            }
        },
        logout() {
            this.token = null
            this.venue = null
            localStorage.removeItem('venue_token')
        }
    }
})