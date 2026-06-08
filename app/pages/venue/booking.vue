<script setup lang="ts">
definePageMeta({
    layout: 'venue'
})

import ManualBooking from '@/components/ManualBooking.vue'
import { ref, onMounted } from 'vue';
import { api } from '~/services/api';
import { Icon } from '@iconify/vue';
import type { ApiResponse, Booking, CancelRequest, Court } from '~/types';

const todayBooking = ref<Booking[]>([])
const courts = ref<Court[]>([])
const cancelRequest = ref<CancelRequest[]>([])
const cancelRequestMobile = ref<CancelRequest[]>([])
const cancelId = ref<number | null>(null)
const cancelDetail = ref<CancelRequest>()

// LOADING STATE
const loadingBookings = ref(false)
const loadingCancelRequest = ref(false)
const loadingCancelDetail = ref(false)
const loadingCourt = ref(false)

const openDropdown = ref<number | null>(null)
const showCancelModal = ref(false)
const cancelModalStep = ref(1)

const showCancelRequest = ref(false)
const showActiveBooking = ref(false)

const showCreateBooking = ref(true)
const showBookingList = ref(false)
const showNotifyCancel = ref(false)
const notifSuccessCancel = ref<CancelRequest>()
const notifRejectCancel = ref<CancelRequest>()

const auth = useAuthVenueStore()
const isAuthenticated = computed(() => !!auth.venue?.id)

const venue = ref(null)


// =========================
// 🔥 SWIPE DOWN CLOSE
// =========================

const cancelMobileStep = ref(1)

const openCancel = () => {
    activeModal.value = 'cancelRequest'
    showCancelRequest.value = true
    cancelMobileStep.value = 1
}
const closeCancel = () => {
    showCancelRequest.value = false
}
const openCancelDetail = (cancel: CancelRequest) => {
    cancelId.value = cancel.id
    cancelMobileStep.value = 2
}


const openActiveBooking = () => {
    activeModal.value = 'activeBooking'
    showActiveBooking.value = true
}
const closeActiveBooking = () => {
    showActiveBooking.value = false
}

const activeModal = ref<'cancelRequest' | 'activeBooking' | null>(null)
const startY = ref(0)
const currentY = ref(0)
const isDragging = ref(false)

const scrollContainer = ref<HTMLElement | null>(null)

const isAtTop = ref(false)

const onTouchStart = (e: TouchEvent) => {
  const el = scrollContainer.value

  // cek apakah scroll lagi di paling atas
  isAtTop.value = el ? el.scrollTop === 0 : true

  startY.value = e.touches[0]?.clientY ?? 0

  // cuma aktif drag kalau scroll di atas
  isDragging.value = isAtTop.value
}

const onTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return

  currentY.value = e.touches[0]?.clientY ?? 0
}

const onTouchEnd = () => {
  if (!isDragging.value) return

  const diff = currentY.value - startY.value

  if (diff > 100) {
    if (activeModal.value === 'cancelRequest') {
      closeCancel()
    } else if (activeModal.value === 'activeBooking') {
      closeActiveBooking()
    }
  }

  isDragging.value = false
  currentY.value = 0
}

const fetchVenue = async () => {
  const res: any = await api('auth/venue')
  venue.value = res.data
}
onMounted(fetchVenue)

const filter = reactive({
    search: '',
    filter: '',
    court: ''
})

const fetchCourt = async () => {
    loadingCourt.value = true
    try {
        const res: ApiResponse<Court[]> = await api('/venue/indexCourt')
        courts.value = res.data
    } catch (e) {
        console.error(e)
    } finally {
        loadingCourt.value = false
    }
}

const fetchBooking = async () => {
    loadingBookings.value = true
    try {
        const res: ApiResponse<Booking[]> = await api('/booking/todayBooking', {
            query: {
                search: filter.search || undefined,
                filter: filter.filter || undefined,
                court: filter.court || undefined
            }
        })

        todayBooking.value = res.data
    } catch (e) {
        console.error(e)
    } finally {
        loadingBookings.value = false
    }
}

const toggleDropdown = (id: number) => {
    openDropdown.value = openDropdown.value === id ? null : id
}

onMounted(() => {
    document.addEventListener('click', () => {
        openDropdown.value = null
    })
})


const currentPage = ref(1)
const totalPages = ref(1)
const perPage = ref(1)

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchCancelRequest()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchCancelRequest()
  }
}

const fetchCancelRequest = async () => {
    loadingCancelRequest.value = true
    try {
        const params: any = {
        page: currentPage.value,
        per_page: perPage.value
        }

        const res: any = await api('/booking/cancelRequest', {params})

        cancelRequest.value = res.data.data
        totalPages.value = res.data.last_page
    } catch (e) {
        console.error(e)
    } finally {
        loadingCancelRequest.value = false
    }
}

const fetchCancelRequestMobile = async () => {
    loadingCancelRequest.value = true
    try {
        const res: ApiResponse<CancelRequest[]> = await api('/booking/cancelRequestMobile')
        cancelRequestMobile.value = res.data
    } catch (e) {
        console.error(e)
    } finally {
        loadingCancelRequest.value = false
    }
}

const openCancelModal = (cancel: CancelRequest) => {
    cancelId.value = cancel.id
    cancelModalStep.value = 1
    showCancelModal.value = true
}
const openRejectCancelModal = (cancel: CancelRequest) => {
    cancelId.value = cancel.id
    cancelModalStep.value = 2
    showCancelModal.value = true
}
const closeCancelModal = () => {
    cancelId.value = null
    showCancelModal.value = false
}
const manualCheckin = () => {
    showCreateBooking.value = true
    showBookingList.value = false
}
const bookingList = () => {
    showCreateBooking.value = false
    showBookingList.value = true
}

let notifTimeout: any = null
const cancelBooking = async () => {
    try {
        const res: ApiResponse<CancelRequest> = await api('/booking/cancelBooking', {
            method: 'POST',
            body: {
                id: cancelId.value
            }
        })

        notifSuccessCancel.value = res.data
        showNotifyCancel.value = true
        closeCancelModal()
        fetchCancelRequest()
        if (notifTimeout) clearTimeout(notifTimeout)

        setTimeout(() => {
            showNotifyCancel.value = false
        }, 4000)
    } catch (e) {
        console.error(e)
    }
}

const rejectCancelBooking = async () => {
    try {
        const res: ApiResponse<CancelRequest> = await api('/booking/rejectCancel', {
            method: 'POST',
            body: {
                id: cancelId.value
            }
        })

        notifRejectCancel.value = res.data
        showNotifyCancel.value = true
        closeCancelModal()
        fetchCancelRequest()
        if (notifTimeout) clearTimeout(notifTimeout)

        setTimeout(() => {
            showNotifyCancel.value = false
        }, 4000)
    } catch (e) {
        console.error(e)
    }
}

const colors = [
    'bg-blue-100',
    'bg-purple-100',
    'bg-orange-100',
    'bg-yellow-100',
    'bg-red-100',
];

const getColor = (name: string) => {
    let hash = 0;

    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

const fetchCancelDetail = async () => {
    loadingCancelDetail.value = true
    try {
        const res: ApiResponse<CancelRequest> = await api('/booking/cancelDetail')
        cancelDetail.value = res.data
    } catch (e) {
        console.error(e)
    } finally {
        loadingCancelDetail.value = false
    }
}


onMounted(fetchCancelRequest)
onMounted(fetchCancelRequestMobile)
onMounted(fetchCourt)
onMounted(fetchBooking)
onMounted(fetchCancelDetail)
</script>

<template>
    <div class="flex mb-6 gap-2">
        <button @click="bookingList" 
        class="border-2 border-blue-900 text-blue-900 rounded-full py-2 px-4 text-sm font-semibold"
        :class="showBookingList ? 'bg-blue-900 text-white' : 'bg-none hover:opacity-80'">
            Booking List
        </button>
        <button @click="manualCheckin" 
        class="border-2 border-blue-900 text-blue-900 rounded-full py-2 px-4 text-sm font-semibold"
        :class="showCreateBooking ? 'bg-blue-900 text-white' : 'bg-none hover:opacity-80'">
            Create Manual Booking
        </button>
    </div>

    <div v-if="showBookingList">
        <div v-if="cancelRequest.length > 0" class="flex flex-col mb-4 gap-2">
            <div class="flex flex-col md:flex-row md:justify-between gap-2 text-sm">
                <div class="flex flex-col md:flex-row md:items-center md:gap-4">
                    <h1 class="font-semibold">Booking Request </h1>
                    <p class="text-[12px] text-gray-400">please respond to the customer request immediately!</p>
                </div>
                <p class="text-[12px] text-gray-400 hidden md:flex">you have 5 reschedule and {{ totalPages }} cancel request</p>
            </div>

            <button @click="openCancel" class="flex md:hidden items-center justify-between border rounded-xl w-full bg-yellow-300 shadow-md text-orange-900 p-2 ">
                <div class="flex gap-1 items-center text-xs font-bold">
                    <p>{{cancelRequestMobile.length}} Pending Request</p> 
                    <Icon icon="ic:round-warning" width="12" height="12" />
                </div>
                <Icon icon="gg:move-right" width="20" height="20" />
            </button>

            <div v-for="cancel in cancelRequest" class="justify-between items-center border py-2 px-3 rounded-xl bg-yellow-300 shadow-md text-blue-900 hidden md:flex">
                <div class="flex gap-10">
                    <button @click="prevPage" :disabled="currentPage === 1" class="disabled:opacity-30">
                        <Icon icon="iconoir:page-left" width="30" height="30" class="" />
                    </button>
                    <div class="flex gap-4 items-center">
                        <img :src="cancel.booking.court.image_url" class="w-40 h-12 object-cover rounded-md"/>
                        <div class="flex flex-col text-sm">
                            <p class="font-bold">Cancel Request</p>
                            <p class="">{{ cancel.booking.court.name }}</p>
                        </div>
                    </div>
                    <div class="flex flex-col">
                        <h2 class="font-semibold text-sm">Start In</h2>
                        <p class="text-sm">{{ formatDateDplus(cancel.booking.booking_date) }}</p>
                    </div>
                    <div class="flex flex-col">
                        <h2 class="font-semibold text-sm">{{ cancel.booking.sessions.length }} Session </h2>
                        <div class="flex gap-5">
                            <div v-for="s in cancel.booking.sessions" :key="s.start_time" class="text-sm flex items-center gap-1">
                            <Icon icon="ic:round-more-time" width="15" height="15" />
                            {{ formatTime3  (s.start_time) }} - {{ formatTime3(s.end_time) }}
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col text-sm">
                        <h2 class="font-semibold">Potential Refund</h2>
                        <p>45% Total Payment</p>
                    </div>
                    <div class="flex flex-col text-sm">
                        <h2 class="font-semibold">Booking ID</h2>
                        <p>B-{{ cancel.booking.id }}</p>
                    </div>
                </div>
                <div class="flex gap-2 items-center">
                    <button @click="openRejectCancelModal(cancel)" class="border-2 border-red-900 text-red-900 px-5 rounded-full h-fit py-2 text-sm font-semibold hover:text-red-700 hover:border-red-700">Reject</button>
                    <button @click="openCancelModal(cancel)" class="bg-green-700 border-2 border-green-700 text-white px-10 rounded-full h-fit py-2 text-sm font-semibold hover:bg-green-600">Accept</button>
                    <button @click="nextPage" :disabled="currentPage === totalPages" class="disabled:opacity-30 ms-10">
                        <Icon icon="iconoir:page-right" width="30" height="30" class="" />
                    </button>
                </div>
            </div>
            
        </div>

        <div class="md:flex flex-col gap-2 text-sm hidden">
            <div class="flex flex-col gap-2 w-full">
                <div class="flex flex-col w-full bg-white border rounded-2xl p-4">
                    <div class="flex justify-between items-center px-5 mb-5">
                        <h1 class="font-semibold">Active Bookings</h1>
                        <div class="flex gap-2">
                            <div class="flex items-center border border-gray-300 px-2 gap-2 rounded-full text-[12px]">
                                <Icon icon="glyphs:search-1-outline" class="text-gray-400" width="30" height="30" />
                                <input 
                                v-model="filter.search"
                                @input="fetchBooking()"
                                placeholder="Search"
                                class="py-2 outline-none"
                                />
                            </div>
                            <div class="flex py-1 items-center text-[12px] border border-gray-300 rounded-full px-2">
                                <Icon icon="f7:sportscourt" class="text-gray-300" width="24" height="24" />
                                <select
                                    v-model="filter.court"
                                    @change="fetchBooking()"
                                    class="text-gray-400 appearance-none px-5 focus:outline-none"
                                >
                                    <option value="">All Court</option>
                                    <option v-for="courtId in courts" :value="courtId.id">{{courtId.name}}</option>
                                </select>
                            </div>
                            <div class="flex py-1 items-center text-[12px] border border-gray-300 rounded-full px-2">
                                <Icon icon="f7:status" class="text-gray-300" width="24" height="24" />
                                <select
                                    v-model="filter.filter"
                                    @change="fetchBooking()"
                                    class="text-gray-400 appearance-none px-5 focus:outline-none"
                                >
                                    <option value="">Status</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="passed">Passed</option>
                                    <option value="upcoming">Upcoming</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-[0.4fr_0.3fr_0.2fr_0.3fr_0.3fr_0.3fr_0.3fr_0.1fr] gap-6 px-4 py-3 ps-10 text-[12px] text-gray-400 font-medium">
                        <p>Court</p>
                        <p>Customer</p>
                        <p>Code</p>
                        <p>Date</p>
                        <p>Start Time</p>
                        <p>Price</p>
                        <p>Action</p>
                    </div>

                    <div v-for="(today, index) in todayBooking" :key="today.id"
                        :class="[
                            index % 2 === 0 ? 'bg-[#F7FAFF]' : 'bg-white',
                            'grid grid-cols-[0.4fr_0.3fr_0.2fr_0.3fr_0.3fr_0.3fr_0.3fr_0.1fr] gap-6 items-center px-4 ps-10 py-4 transition-colors duration-200'
                        ]"
                    >
                        <div class="flex items-center gap-2 min-w-0">
                            <img :src="today.user.profile_image_url" class="w-[30px] h-[30px] object-cover rounded-full">
                            <div class="flex flex-col min-w-0">
                                <p class="truncate">{{ today.user.name }}</p>
                                <p class="truncate text-[12px] text-gray-400">{{ today.user.email }}</p>
                            </div>
                        </div>
                        <p :class="['truncate p-1 rounded-md w-fit text-xs', getColor(today.court.name)]">{{ today.court.name }}</p>
                        <p class="tracking-widest">{{ today.code }}</p>
                        <p class="">{{ formatDate(today.booking_date) }}</p>
                        <p class="">
                            {{ formatTime([...today.sessions].sort((a, b) => a.start_time.localeCompare(b.start_time))[0]?.start_time) }}
                        </p>
                        <p class="font-semibold">Rp{{ formatNumber(today.price)}}</p>
                        <button class="py-1 px-3 rounded-full border border-blue-900 text-blue-900 text-[12px] font-semibold hover:opacity-80 transition">
                            Detail
                        </button>
                        <div class="relative">
                            <button @click.stop="toggleDropdown(today.id)">
                                <Icon icon="tabler:dots" width="24" height="24" />
                            </button>
                            <div v-if="openDropdown === today.id" class="absolute text-[12px] text-gray-600 right-7 mt-3 w-[200px] bg-white border rounded-md shadow z-50 font-semibold">
                                <button class="w-full flex gap-2 items-center justify-center border-b p-3 hover:bg-gray-100 hover:text-black">
                                    <Icon icon="mdi:reschedule" width="17" height="17" />
                                    Reschedule
                                </button>
                                <button class="w-full flex gap-2 items-center justify-center border-b p-3 hover:bg-gray-100 hover:text-black">
                                    <Icon icon="fluent:alert-on-16-regular" width="17" height="17" />
                                    Send Reminder
                                </button>
                                <button class="w-full flex gap-2 items-center justify-center p-3 hover:bg-gray-100 hover:text-black">
                                    <Icon icon="basil:chat-outline" width="20" height="20" />
                                    Chat Customer
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div class="flex gap-5 border p-4 rounded-lg justify-between items-center bg-white w-full">
                p
            </div>
        </div>

        <div class="flex flex-col gap-2 text-sm md:hidden">
            <div class="flex flex-col gap-2 w-full">
                <div class="flex flex-col w-full bg-white border rounded-2xl p-4">
                    <h1 class="font-semibold">Active Booking</h1>
                    <div class="flex flex-col gap-2 mt-2">
                        <div class="flex items-center border border-gray-300 px-2 gap-2 rounded-full text-[12px]">
                            <Icon icon="glyphs:search-1-outline" class="text-gray-400" width="20" height="20" />
                            <input 
                            v-model="filter.search"
                            @input="fetchBooking()"
                            placeholder="Search"
                            class="py-1 outline-none"
                            />
                        </div>
                        <div class="flex w-full gap-2">
                            <div class="flex py-1 items-center text-[12px] border border-gray-300 rounded-full px-2 w-full">
                                <Icon icon="f7:sportscourt" class="text-gray-300" width="20" height="20" />
                                <select
                                    v-model="filter.court"
                                    @change="fetchBooking()"
                                    class="text-gray-400 appearance-none px-5 focus:outline-none"
                                >
                                    <option value="">All Court</option>
                                    <option v-for="courtId in courts" :value="courtId.id">{{courtId.name}}</option>
                                </select>
                            </div>
                            <div class="flex py-1 items-center text-[12px] border border-gray-300 rounded-full px-2">
                                <Icon icon="f7:status" class="text-gray-300" width="20" height="20" />
                                <select
                                    v-model="filter.filter"
                                    @change="fetchBooking()"
                                    class="text-gray-400 appearance-none px-5 focus:outline-none"
                                >
                                    <option value="">Status</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="passed">Passed</option>
                                    <option value="upcoming">Upcoming</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <div v-for="today in todayBooking" class="flex flex-col w-full bg-white border rounded-2xl p-4">
                        <div class="flex justify-between">
                            <div class="flex items-center gap-2 min-w-0">
                                <img :src="today.user.profile_image_url" class="w-[30px] h-[30px] object-cover rounded-full">
                                <div class="flex flex-col min-w-0">
                                    <p class="truncate">{{ today.user.name }}</p>
                                    <p class="truncate text-[12px] text-gray-400">{{ today.user.email }}</p>
                                </div>
                            </div>
                            <p :class="['truncate font- p-1 h-fit rounded-md text-xs', getColor(today.court.name)]">{{ today.court.name }}</p>
                        </div>
                        <div class="flex justify-between items-end mt-3">
                            <div class="flex flex-col gap-1 text-xs">
                                <div class="flex gap-2 items-center">
                                    <Icon icon="stash:data-date-light" width="20" height="20" />
                                    <p>{{ formatDate(today.booking_date) }}</p>
                                </div>
                                <div class="flex gap-2 items-center">
                                    <Icon icon="ri:time-line" width="17" height="17" />
                                    <p>{{ formatTime([...today.sessions].sort((a, b) => a.start_time.localeCompare(b.start_time))[0]?.start_time) }}</p>
                                </div>
                            </div>
                            <p class="font-semibold">Rp{{ formatNumber(today.price)}}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <div v-if="showCancelModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div v-if="cancelModalStep == 1" class="bg-white rounded-xl pb-6 items-end flex flex-col">
                <button @click="closeCancelModal" class="p-2">
                    <Icon icon="mingcute:close-fill" width="17" height="17" />
                </button>
                <div class="flex flex-col items-center w-full px-6">
                    <img src="/warning.png" class="w-[130px] opacity-90">
                    <h2 class="font-bold mb-5 text-lg">Accept Request</h2>
                    <p class="text-gray-500 text-[12px]">This action will remove this booking from the list</p>
                    <button @click="cancelBooking" class="py-2 text-sm bg-red-800 font-semibold w-full mt-5 text-white rounded-full hover:bg-red-700">Cancel Now</button>
                </div>
            </div>
            <div v-else-if="cancelModalStep == 2" class="bg-white rounded-xl pb-6 items-end flex flex-col">
                <button @click="closeCancelModal" class="p-2">
                    <Icon icon="mingcute:close-fill" width="17" height="17" />
                </button>
                <div class="flex flex-col items-center w-full px-6">
                    <img src="/warning.png" class="w-[130px] opacity-90">
                    <h2 class="font-bold mb-5 text-lg">Reject Request</h2>
                    <p class="text-gray-500 text-[12px]">Reject cancelation request on this booking?</p>
                    <button @click="rejectCancelBooking" class="py-2 text-sm bg-red-800 font-semibold w-full mt-5 text-white rounded-full hover:bg-red-700">Reject Now</button>
                </div>
            </div>
        </div>

    </div>

    <div v-if="showCreateBooking">
        <div class="flex flex-col lg:flex-row lg:gap-4 lg:items-center mb-3">
            <h2 class="font-semibold">Available Courts</h2>
            <p class="text-[12px] text-gray-500">Select the court to make manual booking</p>
        </div>
        <div v-if="loadingCourt" class="hidden md:grid grid-cols-3 gap-4">
            <div v-for="i in 6" :key="i" class="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                <div class="w-full h-[160px] bg-gray-200"></div>
                <div class="flex justify-between p-4 py-5">
                    <div class="flex flex-col gap-2">
                        <div class="h-4 bg-gray-100 rounded w-1/2"></div>
                        <div class="h-4 bg-gray-100 rounded w-1/3"></div>
                        <div class="flex justify-start">
                            <div class="h-5 bg-gray-100 rounded w-16"></div>
                        </div>
                    </div>
                    <div class="h-7 bg-gray-200 rounded w-1/4"></div>
                </div>
            </div>
        </div>
        <div v-if="loadingCourt" class="flex flex-col gap-4 md:hidden">
            <div 
                v-for="i in 3" 
                :key="i"
                class="animate-pulse bg-white rounded-2xl shadow p-4"
            >
                <div class="w-full h-40 bg-gray-100 rounded-xl mb-4"></div>
                <div class="h-5 bg-gray-100 rounded w-1/2 mb-3"></div>
                <div class="h-4 bg-gray-100 rounded w-1/3 mb-4"></div>
                <div class="h-6 bg-gray-100 rounded w-1/2 mb-4"></div>
                <div class="h-10 bg-gray-100 rounded-xl w-full"></div>
            </div>
        </div>
        <ManualBooking v-else v-if="venue" :venue="venue" />
    </div>

    <div v-if="showCancelRequest" class="min-[1000px]:hidden fixed inset-0 z-50">
      <div @click="closeCancel" class="absolute inset-0 bg-black/50"></div>
      <div class="absolute bottom-0 left-0 w-full bg-white rounded-t-2xl py-5 transition-transform duration-300 ease-out"
          :style="{ height: '80%', transform: isDragging ? `translateY(${Math.max(0, currentY - startY)}px)` : 'translateY(0)'}"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
      >
        <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <div ref="scrollContainer" class="overflow-y-auto max-h-[700px] flex flex-col gap-2">
            
        </div>
      </div>
    </div>

    <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-5"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-300 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-5"
    >
        <div v-if="showNotifyCancel" class="fixed bottom-5 right-7 text-[12px] z-50 w-[400px]">
            <div v-if="notifSuccessCancel" class="flex justify-between items-center gap-1 py-2 px-5 text-green-900 pt-2 border-b-4 rounded-md border-green-900 bg-green-100 text-gray-700 shadow-md">
                <div class="flex gap-5">
                    <div class="flex items-center gap-1">
                        <Icon icon="material-symbols:free-cancellation-outline" class="" width="24" height="24" />
                    </div>
                    <div class="flex flex-col">
                        <h1 class="text-sm font-bold">Cancel Accepted</h1>
                        <p>See details on the cancelation history</p>
                    </div>
                </div>
                <p class="font-bold">ID {{ notifSuccessCancel.booking_id }}</p>
            </div>
            <div v-else-if="notifRejectCancel" class="flex justify-between items-center gap-1 py-2 px-5 text-green-900 pt-2 border-b-4 rounded-md border-green-900 bg-green-100 text-gray-700 shadow-md">
                <div class="flex gap-5">
                    <div class="flex items-center gap-1">
                        <Icon icon="material-symbols:free-cancellation-outline" class="" width="24" height="24" />
                    </div>
                    <div class="flex flex-col">
                        <h1 class="text-sm font-bold">Cancel Rejected</h1>
                        <p>This booking will be continue</p>
                    </div>
                </div>
                <p class="font-bold">ID {{ notifRejectCancel.booking_id }}</p>
            </div>
        </div>
    </Transition>
    
</template>