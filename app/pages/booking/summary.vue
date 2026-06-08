<script setup lang="ts">
definePageMeta({
  layout: 'master'
})

import { ref, onMounted, computed } from 'vue';
import { useRoute, navigateTo } from '#app';
import { api } from '~/services/api';
import { Icon } from '@iconify/vue';
import { formatDate } from '#imports';

const route = useRoute()
const bookingId = route.query.id as string | null

const loading = ref(true)
const detail = ref<any>(null)
const snapToken = ref('')
const generatingPayment = ref(false)

const cancelModal = ref(false)
const cancelling = ref(false)

const fetchDetail = async () => {
  loading.value = true
  try {
    const res: any = await api(`/booking-holds/${bookingId}`)
    detail.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const cancelBooking = async () => {
  cancelling.value = true
  try {
    await api('booking-holds/cancel', {
      method: 'POST',
      body: {
        booking_hold_header_id: bookingId
      }
    })
    cancelModal.value = false
    await navigateTo('/user/activity')
  } catch (e) {
    console.error(e)
  } finally {
    cancelling.value = false
  }
}

const generatePayment = async () => {
  generatingPayment.value = true
  try {
    const res: any = await api(`/booking-holds/${bookingId}/pay`, {
      method: 'POST'
    })
    
    snapToken.value = res.snap_token
    payNow()
  } catch (e) {
    console.error(e)
  } finally {
    generatingPayment.value = false
  }
}

const checkPaymentStatus = async () => {
  let attempts = 0

  const interval = setInterval(async () => {
    attempts++

    const res: any = await api(`/booking-holds/${bookingId}`)

    if (!res) return

    if (res.payment_status === 'Paid') {
      clearInterval(interval)

      setTimeout(() => {
        navigateTo('/user/activity')
      }, 3000)
    }

    if (attempts > 10) {
      clearInterval(interval)
    }
  }, 2000)
}

const payNow = () => {
  const checkSnap = setInterval(() => {
    if ((window as any).snap && snapToken.value) {
      clearInterval(checkSnap);

      (window as any).snap.pay(snapToken.value, {
        onSuccess() {
          checkPaymentStatus()

          setTimeout(() => {
            navigateTo('/')
          }, 3000)
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

onMounted(fetchDetail)
</script>

<template>

<div v-if="loading">Loading ...</div>
<div v-else>
  <div class="flex flex-col font-inter">
    <div class="flex items-center gap-2 bg-blue-900 pt-5 md:pt-10 pb-5 px-[40px] md:px-[40px] lg:px-[100px] text-white">
      <NuxtLink to="/user/activity" class="text-sm">Activity</NuxtLink>
      <Icon icon="lsicon:right-filled" width="20" height="20" />
      <NuxtLink class="text-sm font-semibold">Booking Summary</NuxtLink>
    </div>
    <div class="flex flex-col mt-10 gap-5 items-center mx-[20px] md:mx-[40px] lg:mx-[100px]">
      <div class="flex border justify-between items-start rounded-md p-3 gap-3 shadow w-full lg:w-2/3">
        <img :src="detail.venue.first_image.image_url" class="w-[100px] md:w-[120px] object-cover">
        <div class="flex  justify-between w-full items-center ">
          <div class="flex flex-col">
            <p class="font-bold text-lg">{{ detail.venue.name }}</p>
            <p class="text-sm">{{ detail.court.name }}</p>
          </div>
          <div class="flex flex-col text-gray-600">
            <h2 class="text-sm font-semibold">Session</h2>
            <div class="flex flex-col text-[12px] h-fit">
              <div v-for="session in detail.hold" class="">
                <p>{{ formatTime3(session.start_time) }} - {{ formatTime3(session.start_time) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col md:flex-row w-full md:w-2/3 gap-6 md:gap-0">
        <div v-if="detail.additional.length > 0" class="flex flex-col w-full md:w-1/2 md:pe-5">
          <h2 class="flex items-center gap-1 font-semibold text-sm">Additional Service <Icon icon="heroicons:bars-3-bottom-left-16-solid" width="15" height="15" /></h2>
          <div class="grid grid-cols-1 mt-5 gap-3 w-full">
            <div v-for="add in detail.additional" class="border rounded-md p-2 w-full">
              <p class="text-[12px] font-semibold">{{ add.additional.additional_type.addon }}</p>
              <p class="text-[12px] text-gray-400">{{ add.additional.description }}</p>
            </div>
          </div>
        </div>
        <div class="flex flex-col w-full gap-1" 
              :class="[
                detail.additional.length > 0
                ? 'border-s-0 md:border-s md:ps-5'
                : '',
              ]"
          >
          <div class="flex justify-between items-end text-sm border p-2 rounded-md">
            <div class="flex items-start gap-2">
              <img :src="detail.court.image_url" class="w-[120px] rounded-md object-cover">
              <div class="flex flex-col">
                <p class="font-semibold text-[13px]">{{ detail.court.name }}</p>
                <div class="flex flex-col">
                  <div class="flex text-[12px] gap-2">
                    <p class="text-gray-500 ">Quantity:</p>
                    <p class="font-semibold">{{ detail.hold.length }} Sessions</p>
                  </div>
                </div>
                <p class="text-[12px]">On {{ formatDate(detail.booking_date) }}</p>
              </div>
            </div>
            <p class="font-bold text-[12px]">Rp{{ formatNumber(detail.session_price) }}</p>
          </div>
          <div v-if="detail.additional.length > 0">
            <p class="text-sm font-semibold mb-1 mt-5">Add-ons</p>
            <div class="flex flex-col gap-1">
              <div v-for="add in detail.additional">
                <div class="flex justify-between items-center text-sm border-b border-dashed">
                  <p>{{ add.additional.additional_type.addon }}</p>
                  <p>Rp{{ formatNumber(add.price) }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-between items-center border-b border-dashed text-sm mt-5">
            <p class="font-semibold">Subtotal</p>
            <p class="font-semibold">Rp{{ formatNumber(detail.subtotal) }}</p>
          </div> 
          <div class="flex justify-between items-center border-b border-dashed text-[12px] text-gray-400">
            <p>Handling Fee</p>
            <p>Rp{{ formatNumber(detail.admin_fee) }}</p>
          </div> 
          <div class="flex justify-between items-center border-b border-dashed text-[12px] text-gray-400">
            <p>Tax</p>
            <p>Rp{{ formatNumber(detail.tax) }}</p>
          </div> 
          <div class="flex justify-between items-center border rounded-md bg-blue-100 p-2 mt-3">
            <p class="text-[15px] font-bold">Total Price</p>
            <p class="text-[15px] font-bold">Rp{{ formatNumber(detail.total_price) }}</p>
          </div> 
          <div class="flex flex-col sm:flex-col lg:flex-row gap-1 mt-3">
            <button @click="cancelModal = true" class="w-full border bg-red-900 text-white font-bold py-2 rounded-full text-[12px] flex items-center justify-center text-gray-600 hover:bg-red-800">
              Cancel Booking <Icon icon="mynaui:trash" width="15" height="12" />
            </button>
            <button @click="generatePayment" :disabled="generatingPayment" class="w-full border bg-blue-900 text-white text-[12px] py-2 px-3 rounded-full font-bold hover:bg-blue-800">
              {{ generatingPayment ? 'Preparing payment...' : 'Continue Payment' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div
  v-if="cancelModal"
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 font-inter"
>
  <div class="bg-white w-[360px] rounded-md p-10">
    <h3 class="text-lg font-bold mb-2">
      Cancel Booking
    </h3>

    <p class="text-sm text-gray-600 mb-5">
      Are you sure you want to cancel this booking?
      This action cannot be undone.
    </p>

    <div class="flex gap-3">
      <!-- NO -->
      <button
        @click="cancelModal = false"
        class="flex-1 border bg-gray-300 py-1 font-semibold text-white rounded-md hover:bg-gray-200"
      >
        No
      </button>

      <!-- YES / REAL CANCEL -->
      <button
        @click="cancelBooking"
        :disabled="cancelling"
        class="flex-1 bg-red-900 text-white py-1 text-sm font-semibold rounded-md hover:bg-red-800"
      >
        {{ cancelling ? 'Cancelling...' : 'Cancel Booking' }}
      </button>
    </div>
  </div>
</div>

</template>