<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from '#app'
import { api } from '~/services/api'

const route = useRoute()
const bookingId = route.query.id as string | null

const loading = ref(true)
const error = ref('')
const snapToken = ref('')

onMounted(async () => {
  if (!bookingId) {
    error.value = 'Booking ID tidak ditemukan'
    loading.value = false
    return
  }

  try {
    const res: any = await api(`/booking-holds/${bookingId}/pay`, {
      method: 'POST'
    })

    snapToken.value = res.snap_token
  } catch (err) {
    console.error(err)
    error.value = 'Gagal generate payment'
  } finally {
    loading.value = false
  }
})

const payNow = () => {
  const checkSnap = setInterval(() => {
    if ((window as any).snap) {
      clearInterval(checkSnap)

      ;(window as any).snap.pay(snapToken.value, {
        onSuccess() {
          alert('Payment Success!')
          window.location.href = '/'
        },
        onPending() {
          alert('Waiting for payment')
        },
        onError() {
          alert('Payment failed')
        }
      })
    }
  }, 200)
}
</script>

<template>
  <div class="p-6 max-w-xl mx-auto">
    <h1 class="text-xl font-bold mb-4">
      Payment
    </h1>

    <div v-if="loading">Preparing payment...</div>
    <div v-else-if="error">{{ error }}</div>

    <div v-else>
      <button
        @click="payNow"
        class="w-full bg-green-600 text-white py-3 rounded"
      >
        Pay Now
      </button>
    </div>
  </div>
</template>