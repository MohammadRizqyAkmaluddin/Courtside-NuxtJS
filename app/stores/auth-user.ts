import { defineStore } from 'pinia'
import { api } from '@/services/api'

export const useAuthUserStore = defineStore('authUser', {
  state: () => ({
    user: null as any,
    token: null as string | null,
    isLoaded: false
  }),

  actions: {
    loadFromStorage() {
      if (import.meta.client) {
        this.token = localStorage.getItem('user_token')
      }
    },

    async fetchUser() {
      if (!this.token) {
        this.isLoaded = true
        return
      }

      try {
        const res: any = await api('/auth/user/me', {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })

        this.user = res.user
      } catch (err) {
        this.logout()
      } finally {
        this.isLoaded = true
      }
    },

    async login(payload: { email: string; password: string }) {
      const res: any = await api('/auth/user/login', {
        method: 'POST',
        body: payload
      })

      this.token = res.token
      this.user = res.user
      localStorage.setItem('user_token', res.token)
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('user_token')
    }
  }
})
