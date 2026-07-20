import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public
  const token = localStorage.getItem('user_token') || localStorage.getItem('venue_token')

  if (!config.pusherKey) {
    console.warn('[Echo] Pusher key not configured. Real-time chat will not be enabled.')
    return
  }

  window.Pusher = Pusher

  const echo = new Echo({
    broadcaster: 'pusher',
    key: config.pusherKey,
    cluster: config.pusherCluster || undefined,
    forceTLS: config.pusherScheme === 'https',
    encrypted: config.pusherScheme === 'https',
    wsHost: config.pusherHost || undefined,
    wsPort: config.pusherPort || undefined,
    wssPort: config.pusherPort || undefined,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${config.apiBaseUrl.replace(/\/api\/?$/, '')}/broadcasting/auth`,
    authTransport: 'ajax',
    auth: {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    },
    disableStats: true
  })

  return {
    provide: {
      echo
    }
  }
})
