export const api = $fetch.create({
  baseURL: process.env.API_BASE_URL,
  onRequest({ options }) {
    const token =
    localStorage.getItem('venue_token') ||
    localStorage.getItem('user_token')

    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`
      }
    }
  }
})  