// export const api = $fetch.create({ baseURL: 'http://localhost:8000/api', headers: { Accept: 'application/json', 'Content-Type': 'application/json' } })

export const api = $fetch.create({
  baseURL: 'http://localhost:8000/api',
  onRequest({ options }) {
    const auth = useAuthUserStore()

    options.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
    }
  },
})