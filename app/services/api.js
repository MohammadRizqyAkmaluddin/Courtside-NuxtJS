export const api = $fetch.create({
  baseURL: 'http://localhost:8000/api',
  onRequest({ options }) {
    const token = localStorage.getItem('user_token')

    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`
      }
    }
  }
})