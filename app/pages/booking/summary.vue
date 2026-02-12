<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, navigateTo } from '#app'
import { api } from '~/services/api'

const route = useRoute()
const bookingId = route.query.id as string | null

const loading = ref(true)
const bookingHold = ref<any>(null)
const error = ref('')
const cancelling = ref(false)

onMounted(async () => {
  if (!bookingId) {
    error.value = 'Booking ID tidak ditemukan'
    loading.value = false
    return
  }

  try {
    bookingHold.value = await api(`/booking-holds/${bookingId}`)
  } catch (err) {
    console.error(err)
    error.value = 'Gagal memuat data booking'
  } finally {
    loading.value = false
  }
})

const totalPrice = computed(() => {
  if (!bookingHold.value) return 0
  return bookingHold.value.total_price
})

const cancelBooking = async () => {
  cancelling.value = true
  error.value = ''

  try {
    await api('/booking-holds/cancel', {
      method: 'POST',
      body: {
        booking_hold_header_id: bookingId
      }
    })

    showCancelModal.value = false
    await navigateTo('/')
  } catch (err) {
    console.error(err)
    error.value = 'Gagal membatalkan booking'
  } finally {
    cancelling.value = false
  }
}

const showCancelModal = ref(false)

</script>


<template>
  <div class="p-6 font-inter max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Booking Summary</h1>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>

    <div v-else-if="bookingHold">

      <!-- Venue -->
      <div class="border p-4 rounded-lg mb-4">
        <h2 class="font-semibold text-lg">
          {{ bookingHold.venue.name }}
        </h2>
        <p class="text-sm">{{ bookingHold.venue.address }}</p>
        <p class="text-sm">Phone: {{ bookingHold.venue.phone }}</p>
      </div>

      <!-- Court -->
      <div class="border p-4 rounded-lg mb-4 flex gap-4">
        <img
          :src="bookingHold.court.image_url"
          class="w-24 h-24 object-cover rounded"
        />
        <div>
          <h3 class="font-semibold">{{ bookingHold.court.name }}</h3>
          <p class="text-sm">Booking Date: {{ bookingHold.date }}</p>
        </div>
      </div>

      <!-- Sessions -->
      <div class="border p-4 rounded-lg mb-4">
        <h3 class="font-semibold mb-2">Sessions</h3>

        <ul class="space-y-2">
          <li
            v-for="session in bookingHold.sessions"
            :key="session.id"
            class="flex justify-between text-sm"
          >
            <span>
              {{ session.start_time }} - {{ session.end_time }}
            </span>
            <span>
              Rp {{ session.price.toLocaleString() }}
            </span>
          </li>
        </ul>
      </div>

      <!-- User / Guest -->
      <div class="border p-4 rounded-lg mb-4 text-sm">
        <p v-if="bookingHold.user_id">
          Booked by User ID: {{ bookingHold.user_id }}
        </p>
        <p v-else>
          Guest Contact: {{ bookingHold.guest_contact }}
        </p>
      </div>

      <!-- Total -->
      <div class="border p-4 rounded-lg mb-4">
        <p class="font-bold text-lg">
          Total Price: Rp {{ totalPrice.toLocaleString() }}
        </p>
      </div>

      <!-- Actions -->
      <button
  @click="showCancelModal = true"
  class="w-full mb-3 bg-red-600 text-white py-2 rounded"
>
  Cancel Booking
</button>


      <button
        class="w-full bg-blue-900 text-white py-2 rounded"
        @click="navigateTo(`/checkout?booking=${bookingHold.id}`)"
      >
        Proceed to Payment
      </button>

    </div>
  </div>

  <!-- CANCEL CONFIRM MODAL -->
<div
  v-if="showCancelModal"
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
>
  <div class="bg-white w-[360px] rounded-xl p-6">
    <h3 class="text-lg font-semibold mb-2">
      Cancel Booking
    </h3>

    <p class="text-sm text-gray-600 mb-5">
      Are you sure you want to cancel this booking?
      This action cannot be undone.
    </p>

    <div class="flex gap-3">
      <!-- NO -->
      <button
        @click="showCancelModal = false"
        class="flex-1 border border-gray-300 py-2 rounded"
      >
        No
      </button>

      <!-- YES / REAL CANCEL -->
      <button
        @click="cancelBooking"
        :disabled="cancelling"
        class="flex-1 bg-red-600 text-white py-2 rounded"
      >
        {{ cancelling ? 'Cancelling...' : 'Yes, Cancel' }}
      </button>
    </div>
  </div>
</div>

</template>

