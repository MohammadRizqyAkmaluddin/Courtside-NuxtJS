<script setup lang="ts">

definePageMeta({
  layout: 'master',
  ssr: false
})


import { ref, onMounted, computed } from 'vue'
import { api } from '~/services/api'
import { Icon } from '@iconify/vue'
import { formatNumber, formatTime, formatDate, formatDatePlusOneMonth } from '#imports'
import type { Booking, Activities } from '~/types'

const venues = ref<any[]>([])
const bookingHistory = ref<any[]>([])
const community = ref<any[]>([])
const communities = ref<any[]>([])
const activeBooking = ref<Booking[]>([])
const holding = ref<any|null>(null)

const loading = ref(true)

const showAllHistory = ref(false)
const showHistoryList = ref(false)
const showLeave = ref(false)
const selectedLeaveCommunityId = ref(null)
const showRate = ref(false)
const selectedBooking = ref<any>(null)
const selectedRate = ref(0)
const review = ref('')
const showActiveBooking = ref(false)
const selectedActiveBooking = ref<any | null>(null)
const showDetailHistory = ref(false)

const openActiveBooking = (booking: Booking) => {
  selectedActiveBooking.value = booking
  showActiveBooking.value = true
}
const closeActiveBooking = () => {
  showActiveBooking.value = false
}
const openHistoryList = () => {
  showHistoryList.value = true
}
const closeHistoryList = () => {
  showHistoryList.value = false
}
const openLeave = (id: number | any) => {
  selectedLeaveCommunityId.value = id
  showLeave.value = true
}
const closeLeave = () => {
  showLeave.value = false
  selectedLeaveCommunityId.value = null
}
const openRate = (bookingId: any) => {
  selectedBooking.value = bookingId
  selectedRate.value = 0
  review.value = ''
  showHistoryList.value = false
  showRate.value = true
}
const closeRate = () => {
  showRate.value = false
}

const openHistory = (bookingId: any) => {
  selectedBooking.value = bookingId
  showDetailHistory.value = true
}
const closeHistory = () => {
  showDetailHistory.value = false
}
    
const displayedHistory = computed(() => {
  if (showAllHistory.value) {
    return bookingHistory.value
  }
  return bookingHistory.value.slice(0, 3)
})

const fetchHolding = async () => {
  loading.value = true
  try {
    holding.value = await api('/my-activity/booking-holds')
  } catch (e) {
    console.error(e)
  }
}

const fetchHistory = async () => {
  loading.value = true
  try {
    const res: any = await api('/my-activity/booking-history')
    bookingHistory.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const fetchCommunity = async () => {
  loading.value = true
  try {
    const res: any = await api('/my-activity/community-membership')
    community.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const fetchVenues = async () => {
  loading.value = true

  try {
    const res: any = await api('/venues', {
      query: {
        per_page: 4
      }
    })
    venues.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const fetchCommunities = async () => {
  loading.value = true
  try {
    const res: any = await api('/communities')
    communities.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const leaveCommunity = async () => {
  try {
    await api(`/my-activity/${selectedLeaveCommunityId.value}/leave-community`, {
      method: 'POST'
    })
    await fetchCommunity()
  } catch (e) {
    console.error(e)
  } finally {
    showLeave.value = false
  }
}

const submitRating = async () => {
  try {
    await api('/my-activity/rate', {
      method: 'POST',
      body: {
        booking_id: selectedBooking.value.id,
        rate: selectedRate.value,
        review: review.value
      }
    })

    showRate.value = false
    fetchHistory()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const fetchActiveBooking = async () => {
  try {
    const res: any = await api ('/my-activity/active-booking')
    activeBooking.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchHolding)
onMounted(fetchVenues)
onMounted(fetchHistory)
onMounted(fetchCommunity)
onMounted(fetchCommunities)
onMounted(fetchActiveBooking)
</script>

<template>

  <div v-if="loading" class="animate-pulse">
    <div class="md:col-span-2 h-[70px] bg-gray-200 rounded-xl mt-[50px] mx-[20px] md:mx-[40px] lg:mx-[100px]"></div>
    <div class="w-1/2 md:col-span-2 h-[10px] bg-gray-200 rounded-xl mt-4 mx-[20px] md:mx-[40px] lg:mx-[100px]"></div>
  </div>
  <div v-else class="mt-[30px] md:mt-[50px] font-inter mx-[20px] md:mx-[40px] lg:mx-[100px]">
    <div v-if="holding" class="mb-5 ">
      <NuxtLink :to="`/booking/summary?id=${holding.id}`">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center border-2 py-2 px-3 rounded-md border-blue-900 text-blue-900 md:text-white md:bg-blue-900 hover:shadow-lg">
          
          <div class="flex flex-col md:flex-row gap-2 md:gap-10">
            <div class="flex flex-col md:flex-row gap-4">
              <img :src="holding.court.image_url" class="w-full md:w-44 md:h-14 object-cover rounded-md"/>
              <div class="flex flex-col">
                <h2 class="font-bold text-md">{{ holding.venue.name }}</h2>
                <p class="text-sm">{{ holding.court.name }}</p>
              </div>
            </div>
            <div class="flex flex-col md:flex-row gap-2 md:gap-10">
              <div class="flex flex-col">
                <h2 class="font-semibold text-sm">Selected Date</h2>
                <p class="text-sm">{{ formatDate(holding.booking_date) }}</p>
              </div>
              <div class="flex flex-col">
                <h2 class="font-semibold text-sm">{{ holding.hold.length }} Session </h2>
                <div class="flex flex-col md:flex-row gap-0 md:gap-5">
                  <div v-for="s in holding.hold" :key="s.start_time" class="text-sm flex items-center gap-1">
                    <Icon icon="ic:round-more-time" width="15" height="15" />
                    {{ formatTime3  (s.start_time) }} - {{ formatTime3(s.end_time) }}
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div class="flex gap-8 justify-between w-full md:w-auto mt-6 md:mt-0">
            <p class="text-lg md:text-sm font-semibold flex items-center">Rp{{ formatNumber(holding.subtotal) }}</p>
            <Icon icon="iconoir:page-right" width="30" height="30" />
          </div>
        </div>
      </NuxtLink>
      <p class="text-sm text-gray-400 mt-2 mx-[40px] md:mx-[40px] lg:mx-[100px]">You have an unpaid booking hold's</p>
    </div>

    <div class="flex flex-col md:flex-col lg:flex-row  mt-5 gap-5 font-inter">
      <div class="flex flex-col w-full lg:w-1/3 md:w-full">
        <div class="flex mb-4 justify-between">
          <h1 class="font-semibold">Booking History</h1>
          <button v-if="bookingHistory.length > 0" @click="openHistoryList" class="text-sm text-gray-500">Check all history</button>
        </div>
        <div v-if="bookingHistory.length === 0">
          <h1 class="text-gray-400 text-sm text-center">You haven't make any court booking</h1>
          <div class="flex flex-col gap-4 mt-5">
            <div class="flex items-center w-full">
                <div class="flex-1 border-t border-gray-300"></div>
                <h2 class="px-3 text-sm font-semibold">Venues recommendations</h2>
                <div class="flex-1 border-t border-gray-300"></div>
            </div>
            <div class="flex flex-col items-center">
              <div class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
                <div v-for="venue in venues" >
                  <NuxtLink :to="`/court/${venue.id}`" class="flex flex-col font-inter rounded-lg shadow hover:shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition-shadow duration-200 overflow-hidden">
                    <img :src="venue.images?.[0]?.image_url" class="h-30 w-full object-cover rounded-lg transition-transform duration-300 ease-out hover:scale-105">
                  </NuxtLink>
                </div>
              </div>
              <NuxtLink class="flex gap-1 items-center text-sm justify-center mt-2 text-gray-400 hover:text-gray-600" href="/court">explore more venues <Icon icon="icon-park-outline:right" width="17" height="17" class="mt-1"/></NuxtLink>
            </div>
          </div>
        </div>
        <div v-else class="grid grid-cols-1 gap-4">
          <div v-for="history in displayedHistory" class="border p-2 rounded-md shadow-sm">
            <button @click="openHistory(history)" class="flex flex-col w-full">
              <img :src="history.court.image_url" class="w-full h-16 object-cover"/>
              <div class="flex justify-between mt-5 gap-3">
                <div class="flex flex-col items-start min-w-0">
                  <h2 class="text-sm font-semibold truncate">
                    {{ history.venue.name }}
                  </h2>
                  <p class="text-sm truncate">{{ history.court.name }}</p>
                  <p class="text-sm text-gray-400">
                    Booked for {{ history.sessions.length }} sessions
                  </p>
                </div>

                <div class="flex flex-col items-end shrink-0">
                  <p class="text-sm whitespace-nowrap">
                    {{ formatDate(history.booking_date) }}
                  </p>
                  <p class="text-sm bg-gray-100 p-1 rounded w-full text-center mt-2">
                    Rp{{ formatNumber(history.price) }}
                  </p>
                </div>
              </div>
              <div v-if="history.rating">
                <div class="flex flex-col w-full mt-5 border rounded-md p-3">
                    <div class="flex justify-between items-center mb-2">
                      <div class="flex gap-2">
                        <p class="text-[12px]">{{ history.rating.rate }}</p>
                        <div class="flex items-center">
                          <span v-for="i in 5" :key="i" class="text-orange-300">
                            <svg v-if="i <= history.rating.rate"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                              class="w-3 h-3"
                            >
                              <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.917 1.512 8.277L12 18.897l-7.448 4.603 1.512-8.277L0 9.306l8.332-1.151z"/>
                            </svg>
    
                            <svg v-else
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              class="w-3 h-3"
                            >
                              <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.917 1.512 8.277L12 18.897l-7.448 4.603 1.512-8.277L0 9.306l8.332-1.151z"/>
                            </svg>
                          </span>
                        </div>
                      </div>
                      <p class="text-[12px] text-gray-600">Reviewed at {{ formatDate(history.rating.updated_at) }}</p>
                    </div>
                    <p v-if="history.rating.review" class="text-[12px] text-gray-400">{{ history.rating.review }}</p>
                    <p v-else class="text-[12px] italic text-gray-400 mt-3">You didn’t leave a comment</p>
                </div>
              </div>
              <div v-else>
                <button @click.stop.prevent="openRate(history)" class="border p-1 w-full mt-3 rounded-md bg-blue-900 text-sm font-bold text-white hover:bg-blue-800">Rate Venue</button>
              </div>
            </button>
          </div>
        </div>
      </div>
      <div class="flex flex-col w-full font-inter lg:border-s lg:ps-5">
        <div v-if="activeBooking.length" class="flex flex-col mb-10 pb-10 border-b">
          <div class="flex flex-col gap-3">
            <h1 class="font-semibold mb-4">Active Booked Court</h1>
            <button @click="openActiveBooking(booking)" v-for="booking in activeBooking" class="w-full border p-3 rounded-md shadow">
              <div class="flex flex-col md:flex-row justify-between items-start">
                <div class="flex items-center gap-3">
                  <img :src="booking.venue.first_image.image_url" class="w-[100px] object-cover">
                  <div class="flex flex-col items-start text-sm md:text-xl">
                    <h2 class="font-bold text-start">{{ booking.venue.name }}</h2>
                    <p>{{ booking.court.name }}</p>
                  </div>
                </div>
                <div class="flex flex-col items-start mt-2 md:mt-0 w-full md:w-auto">
                  <p class="text-[12px] font-bold border-2 border-blue-900 text-blue-900 px-10 py-1 rounded w-full">{{ booking.day_status }}</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div class="flex flex-col">
          <h1 class="font-semibold mb-4">Community Membership</h1>
          <div v-if="community.length">
            <div v-for="c in community" class="flex flex-col">
              <div class="flex flex-col w-full border p-3 rounded-md">
                <div class="flex justify-between items-start">
                  <div class="flex gap-4">
                    <img :src="c.community.image_url" class="w-[60px] object-cover">
                    <div class="flex flex-col gap-1">
                      <h2 class="text-sm font-semibold">{{ c.community.name }}</h2>
                      <SportIcon :key="c.community.sport_type_id" :name="c.community.sport_type_id" color="gray" :size="17" class="bg-gray-100 w-fit rounded-lg"/>
                    </div>
                  </div>
                  <div v-if="c.status === 'Active'" class="flex flex-col items-center gap-1">
                    <p class="px-10 py-1 text-center border rounded mt-3 bg-[#C9DBB9] text-green-800 text-sm font-semibold">{{ c.status }}</p>
                    <p class="text-[12px] text-gray-500">Until {{ formatDatePlusOneMonth(c.updated_at) }}</p>
                  </div>
                  <div v-else-if="c.status === 'Pending'" class="flex flex-col items-center gap-1">
                    <p class="flex gap-1 items-center px-10 py-1 text-center border rounded mt-3 bg-yellow-100 text-yellow-800 text-sm font-semibold">{{ c.status }} <Icon icon="ic:round-warning" width="15" height="15" /></p>
                    <p class="text-[12px] text-gray-500">Renew your membership bill</p>
                  </div>
                  <div v-else class="flex flex-col items-center gap-1">
                    <p class="flex gap-1 items-center px-10 py-1 text-center border rounded mt-3 bg-red-100 text-red-800 text-sm font-semibold">{{ c.status }} <Icon icon="ic:round-warning" width="15" height="15" /></p>
                    <p class="text-[12px] text-gray-500">You are no longer a member</p>
                  </div>
                </div>
                <div class="flex items-center justify-center gap-3">
                  <button @click="openLeave(c.community_id)" class="flex justify-center items-center gap-2 bg-red-900 rounded py-2 w-1/2 mt-4 text-white text-sm font-bold hover:bg-red-800">
                    Leave Community
                  </button>
                  <button class="flex justify-center items-center gap-2 bg-green-900 rounded py-2 w-1/2 mt-4 text-white text-sm font-bold hover:bg-green-800">
                    Pay Now <Icon icon="mingcute:card-pay-fill" width="17" height="17" />
                  </button>
                </div>
              </div>
              <p v-if="c.status === 'Inactive'" class="text-[12px] text-gray-400 mt-1">Please contact the community administrators if you decided to renew the membership</p>
            </div>
          </div>
          <div v-else>
            <h1 class="text-gray-400 text-sm text-center">You are not affiliated with any communities</h1>
            <div class="flex flex-col items-center gap-4 mt-5">
              <div class="flex items-center w-full">
                  <div class="flex-1 border-t border-gray-300"></div>
                  <h2 class="px-3 text-sm font-semibold">Communities recommendations</h2>
                  <div class="flex-1 border-t border-gray-300"></div>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div v-for="c in communities" class="w-60 rounded-md">
                  <NuxtLink :to="`/community/${c.id}`" class="group flex flex-col items-center gap-2 transition-transform rounded-md overflow-hidden shadow hover:shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] transition-shadow duration-200">
                    <img :src="c.image_url" class="w-full h-[100px] object-cover rounded-tl-md rounded-tr-md transition-transform duration-300 ease-out group-hover:scale-105">
                    <h2 class="text-sm font-semibold line-clamp-1">{{ c.name }}</h2>
                    <div class="flex gap-2">
                      <SportIcon :key="c.sport_type?.id" :name="c.sport_type?.id" color="gray" :size="13"/>
                      <p v-if="c.venue" class="text-[13px] text-gray-600">{{ c.venue.city.city }}</p>
                      <p v-else class="text-[13px] text-gray-600">{{ c.city.city }}</p>
                    </div>
                    <p class="text-[12px] text-gray-600 border-t py-2 w-full text-center">{{ c.level.level }} Level</p>
                  </NuxtLink>
                </div>
              </div>
              <NuxtLink class="flex gap-1 text-sm items-center justify-center text-gray-400 hover:text-gray-600" href="/community">explore more communities <Icon icon="icon-park-outline:right" width="17" height="17" class="mt-1"/></NuxtLink>
            </div>
          </div>
        </div>

      </div>
    </div>

    <div v-if="showHistoryList" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center font-inter">
      <div class="bg-white w-[500px] rounded-lg p-5">
        <div class="flex justify-between">
          <h2 class="font-semibold">Booking History</h2>
          <button @click="closeHistoryList"><Icon icon="ic:baseline-close" width="24" height="24" /></button>
        </div>
        <div class="flex flex-col gap-5 min-h-[700px] max-h-[700px] overflow-y-auto mt-5">
          <div v-for="history in bookingHistory" class="border p-2 rounded-md shadow-sm">
            <img :src="history.court.image_url" class="w-full h-16 object-cover"/>
            <div class="flex justify-between mt-3">
              <div class="flex flex-col">
                <h2 class="text-sm font-semibold">{{ history.venue.name }}</h2>
                <p class="text-sm">{{ history.court.name }}</p>
                <p class="text-sm text-gray-400">Booked for {{ history.sessions.length }} sessions</p>
              </div>
              <div class="flex flex-col items-center">
                <p class="text-sm">{{ formatDate(history.booking_date) }}</p>
                <p class="text-sm bg-gray-100 p-1 rounded w-full text-center mt-2">Rp{{ formatNumber(history.price) }}</p>
              </div>
            </div>
            <div v-if="history.rating">
                <div class="flex flex-col w-full mt-5 border rounded-md p-3">
                    <div class="flex justify-between items-center mb-2">
                      <div class="flex gap-2">
                        <p class="text-[12px]">{{ history.rating.rate }}</p>
                        <div class="flex items-center">
                          <span v-for="i in 5" :key="i" class="text-orange-300">
                            <svg v-if="i <= history.rating.rate"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                              class="w-3 h-3"
                            >
                              <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.917 1.512 8.277L12 18.897l-7.448 4.603 1.512-8.277L0 9.306l8.332-1.151z"/>
                            </svg>
    
                            <svg v-else
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              class="w-3 h-3"
                            >
                              <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.917 1.512 8.277L12 18.897l-7.448 4.603 1.512-8.277L0 9.306l8.332-1.151z"/>
                            </svg>
                          </span>
                        </div>
                      </div>
                      <p class="text-[12px] text-gray-600">Reviewed at {{ formatDate(history.rating.updated_at) }}</p>
                    </div>
                    <p v-if="history.rating.review" class="text-[12px] text-gray-400">{{ history.rating.review }}</p>
                    <p v-else class="text-[12px] italic text-gray-400 mt-3">You didn’t leave a comment</p>
                </div>
              </div>
              <div v-else>
                <button @click.stop.prevent="openRate(history)" class="border p-1 w-full mt-3 rounded-md bg-blue-900 text-sm font-bold text-white hover:bg-blue-800">Rate Venue</button>
              </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showLeave" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center font-inter">
      <div class="flex flex-col gap-5 bg-white w-[500px] rounded-lg p-5">
        <p class="text-sm">Are you sure want to leave the community and stop membership?</p>
        <div class="flex gap-2">
          <button @click="closeLeave" class="rounded-md text-sm bg-gray-300 text-white font-bold py-2 w-1/2 hover:bg-gray-200 duration-200">Cancel</button>
          <button @click="leaveCommunity" class="rounded-md text-sm bg-red-900 text-white font-bold py-2 w-1/2 hover:bg-red-800 duration-200">Leave anyway</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showRate && !showHistoryList" class="fixed inset-0 bg-black/50 flex items-center justify-center font-inter z-50">
    <div class="flex flex-col items-center bg-white rounded-md">
      <div class="flex justify-between items-center text-sm font-bold bg-blue-900 text-white px-3 py-2 rounded-tl-md rounded-tr-md mb-2 w-full">
        <h1 class="">Share Your Experience</h1>
        <button @click="showRate = false">
          <Icon icon="ic:sharp-close" width="20" height="20" />
        </button>
      </div>
      <div class="flex flex-col p-4 gap-5">
        <div class="flex flex-col gap-3">
          <img :src="selectedBooking.venue.first_image.image_url" class="w-[320px] rounded-md">
          <div class="flex flex-col">
            <h2 class="font-semibold">{{ selectedBooking.venue.name }}</h2>
            <p class="text-sm">{{ selectedBooking.court.name }}</p>
          </div>
        </div>
        <div class="flex flex-col w-full">
          <div class="flex flex-col gap-2">
            <p class="text-sm font-semibold">Rate Venue</p>
            <div class="flex justify-start gap-2 mb-4">
              <span 
                v-for="i in 5" 
                :key="i"
                @click="selectedRate = i"
                class="cursor-pointer"
              >
                <svg v-if="i <= selectedRate"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#EC974F"
                  viewBox="0 0 24 24"
                  class="w-6 h-6"
                >
                  <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.917 1.512 8.277L12 18.897l-7.448 4.603 1.512-8.277L0 9.306l8.332-1.151z"/>
                </svg>
      
                <svg v-else
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  stroke="#EC974F"
                  viewBox="0 0 24 24"
                  class="w-6 h-6"
                >
                  <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.917 1.512 8.277L12 18.897l-7.448 4.603 1.512-8.277L0 9.306l8.332-1.151z"/>
                </svg>
              </span>
            </div>
          </div>
          
          <p class="text-[12px] text-gray-500">(optional)</p>
          <textarea v-model="review" placeholder="Add review comments" class="w-full border rounded-md p-2 text-sm mb-3">
          </textarea>
    
          <div class="flex gap-2 mt-4">
            <button @click="submitRating" :disabled="selectedRate === 0" class="flex-1 font-bold bg-blue-900 text-white rounded-full py-1 disabled:bg-gray-300 hover:bg-blue-800">
              Rate
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="showRate" class="fixed inset-0 flex items-center justify-center z-50 font-inter">
    <div class="flex flex-col items-center bg-white py-5 rounded-md w-[500px] min-h-[800px] max-h-[800px]">
      
      <h2 class="text-lg font-semibold mb-3">Share your experience</h2>

      <img :src="selectedBooking.venue.first_image.image_url" class="w-full">
      <div class="flex flex-col px-5 w-full">
        <div class="flex flex-col mt-5">

          <h2 class="text-xl font-bold">{{ selectedBooking.venue.name }}</h2>
          <p>{{ selectedBooking.court.name }}</p>
        </div>

        <div class="flex justify-center gap-2 mb-4">
          <span 
            v-for="i in 5" 
            :key="i"
            @click="selectedRate = i"
            class="cursor-pointer"
          >
            <svg v-if="i <= selectedRate"
              xmlns="http://www.w3.org/2000/svg"
              fill="orange"
              viewBox="0 0 24 24"
              class="w-6 h-6"
            >
              <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.917 1.512 8.277L12 18.897l-7.448 4.603 1.512-8.277L0 9.306l8.332-1.151z"/>
            </svg>
  
            <svg v-else
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="orange"
              viewBox="0 0 24 24"
              class="w-6 h-6"
            >
              <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.917 1.512 8.277L12 18.897l-7.448 4.603 1.512-8.277L0 9.306l8.332-1.151z"/>
            </svg>
          </span>
        </div>
  
        <textarea v-model="review" placeholder="Write your review (optional)" class="w-full border rounded-md p-2 text-sm mb-3">
        </textarea>
  
        <div class="flex gap-2">
          <button @click="showRate = false" class="flex-1 border rounded-md py-1 bg-red-900">
            Cancel
          </button>
  
          <button @click="submitRating" :disabled="selectedRate === 0" class="flex-1 bg-blue-900 text-white rounded-md py-1 disabled:bg-gray-300">
            Submit
          </button>
        </div>
      </div>

    </div>
  </div>
    
  <div v-if="showActiveBooking" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center font-inter">
      <div class="flex flex-col bg-white w-[500px] rounded-md p-6 gap-3">
        <div class="flex flex-col min-h-[700px] border rounded-md p-5 pt-10 items-center bg-contain bg-[length:200px]" style="background-image: url('/recipe.png');">
          <img src="/logo.png" class="w-[160px]">
          <div class="flex flex-col mt-10 w-full flex-1">

            <div class="flex justify-between items-center text-[13px] text-gray-500 border-b-2 border-dashed pb-2">
              <div class="flex items-center">
                <p>{{ formatDate(selectedActiveBooking.created_at) }}</p>
                <Icon icon="lucide:dot" width="15" height="15" />
                <p>{{ formatTime2(selectedActiveBooking.created_at) }}</p>
              </div>
              <p>ID {{ selectedActiveBooking.id }}</p>
            </div>

            <div class="flex flex-col justify-between mt-4 flex-1">

              <div class="flex flex-col gap-3">
                <div class="flex justify-between items-start">
                  <NuxtLink :to="`/court/${selectedActiveBooking.venue.id}`" class="flex items-start gap-3">
                    <img :src="selectedActiveBooking.venue.first_image.image_url" class="w-[80px] object-cover">
                    <div class="flex flex-col items-start">
                      <h2 class="text-md font-semibold">{{ selectedActiveBooking.venue.name }}</h2>
                      <p class="text-sm">{{ selectedActiveBooking.court.name }}</p>
                    </div>
                  </NuxtLink>
                  <div class="flex items-center gap-1">
                    <div class="bg-[#9AAB25] rounded-full text-white p-[1px]">
                      <Icon icon="ic:baseline-check" width="11" height="11"/> 
                    </div>
                    <p class="text-[12px]">Transaction Success!</p>
                  </div>
                </div>
                <div class="flex flex-col">
                  <p class="text-[12px] text-gray-600">Booked for {{ selectedActiveBooking.sessions.length }} sessions at {{ selectedActiveBooking.venue.name }} on {{ formatDate(selectedActiveBooking.booking_date) }}</p>
                </div>
                <div class="grid grid-cols-3">
                  <div v-for="(session, index) in selectedActiveBooking.sessions as any[]" :key="session.id" class="">
                    <div class="flex flex-col items-center w-full"
                        :class="{'border-e': index !== selectedActiveBooking.sessions.length - 1}">
                      <p class="text-[12px]">Session {{ index + 1 }}</p>
                      <p class="text-[12px]">{{ formatTime3(session.start_time) }} to {{ formatTime3(session.end_time) }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <p class="text-[12px] font-semibold">Booking Code</p>
                <h1 class="border rounded py-1 text-2xl text-blue-900 font-bold text-center">{{ selectedActiveBooking.code }}</h1>
                <p class="text-[12px] text-gray-500">Show this booking code to court management at the venue</p>
              </div>

              <div class="flex flex-col gap-1 text-[12px]">
                <div class="flex justify-between">
                  <p class="text-gray-500">Status</p>
                  <p>{{ selectedActiveBooking.status }}</p>
                </div>
                <div class="flex justify-between border-b border-dashed pb-1">
                  <p class="text-gray-500">Payment ID</p>
                  <p>{{ selectedActiveBooking.midtrans_order_id }}</p>
                </div>
                <div v-if="selectedActiveBooking.additional.length > 0" class="border-b border-dashed pb-1 mt-2">
                  <p class="text-[12px] font-bold text-gray-500">Add-ons</p>
                  <div v-for="add in selectedActiveBooking.additional">
                    <div class="flex justify-between">
                      <p class="text-gray-500">{{ add.additional.additional_type.addon }}</p>
                      <p>Rp {{ formatNumber(add.price) }}</p>
                    </div>
                  </div>
                </div>
                <div class="flex justify-between mt-1">
                  <p class="text-gray-500">Subtotal</p>
                  <p>Rp {{ formatNumber(selectedActiveBooking.price) }}</p>
                </div>
                <div class="flex justify-between">
                  <p class="text-gray-500">Admin Fee</p>
                  <p>Rp {{ formatNumber(selectedActiveBooking.admin_fee) }}</p>
                </div>
                <div class="flex justify-between">
                  <p class="text-gray-500">Tax</p>
                  <p>Rp {{ formatNumber(selectedActiveBooking.tax) }}</p>
                </div>
                <div class="flex justify-between bg-blue-100 p-2 rounded-md mt-3 font-bold">
                  <p>Total Payment</p>
                  <p>Rp{{ formatNumber(selectedActiveBooking.total_price) }}</p>
                </div>
              </div>
              
            </div>

          </div>
        </div>
        <button @click="closeActiveBooking" class="w-full font-semibold bg-blue-900 text-white p-1 rounded-md">Close</button>
      </div>
  </div>

  <div v-if="showDetailHistory" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center font-inter">
    <div class="flex flex-col bg-white w-[500px] rounded-md p-6 gap-3">
        <div class="flex flex-col min-h-[700px] border rounded-md p-5 pt-10 items-center bg-contain bg-[length:200px]" style="background-image: url('/recipe.png');">
          <img src="/logo.png" class="w-[160px]">
          <div class="flex flex-col mt-10 w-full flex-1">

            <div class="flex justify-between items-center text-[13px] text-gray-500 border-b-2 border-dashed pb-2">
              <div class="flex items-center">
                <p>{{ formatDate(selectedBooking.created_at) }}</p>
                <Icon icon="lucide:dot" width="15" height="15" />
                <p>{{ formatTime2(selectedBooking.created_at) }}</p>
              </div>
              <p>ID {{ selectedBooking.id }}</p>
            </div>

            <div class="flex flex-col justify-between mt-4 flex-1">

              <div class="flex flex-col gap-3">
                <div class="flex justify-between items-start">
                  <NuxtLink :to="`/court/${selectedBooking.venue.id}`" class="flex items-start gap-3">
                    <img :src="selectedBooking.venue.first_image.image_url" class="w-[80px] object-cover">
                    <div class="flex flex-col items-start">
                      <h2 class="text-md font-semibold">{{ selectedBooking.venue.name }}</h2>
                      <p class="text-sm">{{ selectedBooking.court.name }}</p>
                    </div>
                  </NuxtLink>
                  <div class="flex items-center gap-1">
                    <div class="bg-[#9AAB25] rounded-full text-white p-[1px]">
                      <Icon icon="ic:baseline-check" width="11" height="11"/> 
                    </div>
                    <p class="text-[12px]">Transaction Success!</p>
                  </div>
                </div>
                <div class="flex flex-col">
                  <p class="text-[12px] text-gray-600">Booked for {{ selectedBooking.sessions.length }} sessions at {{ selectedBooking.venue.name }} on {{ formatDate(selectedBooking.booking_date) }}</p>
                </div>
                <div class="grid grid-cols-3">
                  <div v-for="(session, index) in selectedBooking.sessions as any[]" :key="session.id" class="">
                    <div class="flex flex-col items-center w-full"
                        :class="{'border-e': index !== selectedBooking.sessions.length - 1}">
                      <p class="text-[12px]">Session {{ index + 1 }}</p>
                      <p class="text-[12px]">{{ formatTime3(session.start_time) }} to {{ formatTime3(session.end_time) }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <p class="text-[12px] font-semibold">Booking Code</p>
                <h1 class="border rounded py-1 text-2xl text-blue-900 font-bold text-center">{{ selectedBooking.code }}</h1>
                <p class="text-[12px] text-gray-500">Show this booking code to court management at the venue</p>
              </div>

              <div class="flex flex-col gap-1 text-[12px]">
                <div class="flex justify-between text-gray-500">
                  <p class="text-gray-500">Status</p>
                  <p>{{ selectedBooking.status }}</p>
                </div>
                <div class="flex justify-between border-b border-dashed pb-1 text-gray-500">
                  <p class="text-gray-500">Payment ID</p>
                  <p>{{ selectedBooking.midtrans_order_id }}</p>
                </div>
                <div v-if="selectedBooking.additional.length > 0" class="border-b border-dashed pb-1 mt-2">
                  <p class="text-[12px] font-bold text-gray-500">Add-ons</p>
                  <div v-for="add in selectedBooking.additional">
                    <div class="flex justify-between text-gray-500">
                      <p class="text-gray-500">{{ add.additional.additional_type.addon }}</p>
                      <p>Rp {{ formatNumber(add.price) }}</p>
                    </div>
                  </div>
                </div>
                <div class="flex justify-between mt-1 text-gray-500">
                  <p class="text-gray-500">Subtotal</p>
                  <p>Rp {{ formatNumber(selectedBooking.price) }}</p>
                </div>
                <div class="flex justify-between text-gray-500">
                  <p class="text-gray-500">Admin Fee</p>
                  <p>Rp {{ formatNumber(selectedBooking.admin_fee) }}</p>
                </div>
                <div class="flex justify-between text-gray-500">
                  <p class="">Tax</p>
                  <p>Rp {{ formatNumber(selectedBooking.tax) }}</p>
                </div>
                <div class="flex justify-between bg-blue-100 p-2 rounded-md mt-3 font-bold">
                  <p>Total Payment</p>
                  <p>Rp{{ formatNumber(selectedBooking.total_price) }}</p>
                </div>
              </div>
              
            </div>

          </div>
        </div>
        <button @click="closeHistory" class="w-full font-semibold bg-blue-900 text-white p-1 rounded-md">Close</button>
      </div>
  </div>

  </template>