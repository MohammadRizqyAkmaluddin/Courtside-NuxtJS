import { defineStore } from "pinia"
import { api } from '@/services/api'

export const useAuthUserStore = defineStore('authUser', {
  state: () => ({
    user: null as any,
    token: null as string | null
  }),

  actions: {
    loadFromStorage() {
    if (import.meta.client) {
        this.token = localStorage.getItem('user_token')
    }
    },


    async register(payload: {
      name: string
      email: string
      password: string
      phone: string
    }) {
      const res: any = await api('/auth/user/register', {
        method: 'POST',
        body: payload,
      })

      this.token = res.token
      this.user = res.user
      localStorage.setItem('user_token', res.token)
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

    async fetchUser() {
      if (!this.token) return

      const res: any = await api('/auth/user/me')
      this.user = res.user
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('user_token')
    }
  }
})
