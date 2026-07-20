<script setup lang="ts">

useHead({
  script: [
    {
      src: 'https://app.sandbox.midtrans.com/snap/snap.js',
      'data-client-key': 'Mid-client-LMahtvxbs_fwJuKR',
      defer: true
    }
  ]
})

import { onMounted, onUnmounted } from 'vue'

let interval: any = null
let lastActivity = Date.now()

const updateActivity = () => {
  lastActivity = Date.now()
}

const handleVisibility = () => {
  if (document.visibilityState === 'visible') {
    lastActivity = Date.now()
  }
}

const startPing = () => {
  interval = setInterval(async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    const now = Date.now()

    if (now - lastActivity < 60000) {
      try {
        await $fetch('/api/ping', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      } catch (e) {
        // optional: handle error
      }
    }
  }, 10000)
}

onMounted(() => {
  window.addEventListener('mousemove', updateActivity)
  window.addEventListener('keydown', updateActivity)
  window.addEventListener('click', updateActivity)
  document.addEventListener('visibilitychange', handleVisibility)

  startPing()
})

onUnmounted(() => {
  clearInterval(interval)

  window.removeEventListener('mousemove', updateActivity)
  window.removeEventListener('keydown', updateActivity)
  window.removeEventListener('click', updateActivity)
  document.removeEventListener('visibilitychange', handleVisibility)
})

</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>