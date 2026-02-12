<script setup lang="ts">
definePageMeta({
  layout: 'master',
  ssr: false
})


import { ref, onMounted, computed } from 'vue'
import { api } from '~/services/api'


const loading = ref(true)
const activities = ref<any[]>([])
const error = ref('')

onMounted(async () => {
  try {
    const res: any = await api('/my-activity/booking-holds')
    console.log('API RESPONSE:', res)
    activities.value = res.data
  } catch (e) {
    error.value = 'Gagal memuat aktivitas'
  } finally {
    loading.value = false
  }
})

const totalPrice = (hold: any[]) =>
  hold.reduce((sum, h) => sum + h.price, 0)
  
</script>

<template>
  <div class="p-6 font-inter max-w-5xl mx-auto mt-10">
    <h1 class="text-2xl font-bold mb-6">My Activity</h1>

    <div v-if="loading" class="animate-pulse">
      <div class="md:col-span-2 h-[150px] bg-gray-200 rounded-xl"></div>
    </div>

    
    <div v-else-if="error">{{ error }}</div>

    <div v-else-if="activities.length === 0">
      <p class="text-gray-500">No active bookings.</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="item in activities" :key="item.id" class="border rounded-xl shadow-sm p-4 hover:shadow-lg">
        <h2 class="font-semibold text-lg">{{ item.venue.name }}</h2>
        <p class="text-sm text-gray-500">{{ item.booking_date }}</p>

        <div class="flex gap-4 mt-3">
          <img
            :src="item.court.image_url"
            class="w-24 h-24 object-cover rounded-lg"
          />

          <div class="flex-1">
            <p class="font-medium">
              {{ item.court.name }}
            </p>

            <ul class="text-sm mt-2">
              <li v-for="s in item.hold" :key="s.start_time">
                {{ s.start_time }} - {{ s.end_time }}
              </li>
            </ul>

            <p class="mt-2 font-semibold">
              Total: Rp {{ totalPrice(item.hold).toLocaleString() }}
            </p>
          </div>
        </div>

        <!-- ACTION -->
        <div class="mt-4 flex justify-between items-center">
          <p class="text-xs text-gray-500">
            Expires at {{ new Date(item.expires_at).toLocaleString() }}
          </p>

          <NuxtLink
            :to="`/booking/summary?id=${item.id}`"
            class="btn-primary"
          >
            Continue Booking
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
