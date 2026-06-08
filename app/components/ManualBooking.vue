<script setup lang="ts">
import { ref, computed } from 'vue'
import { api } from '~/services/api'
import { Icon } from '@iconify/vue'
import { useDateFormat } from '~/composable/useDateFormat';
import { formatNumber } from '#imports';
import type { ApiResponse, BookingSummary } from '~/types';

const { monthYear, fullDate } = useDateFormat()

const props = defineProps<{
  venue: any
}>()

const selectedCourtId = ref<number | null>(null)
const paymentMethod = ref('')

const showPayment = ref(false)
const showSchedule = ref(false)
const step = ref<1 | 2 | 3 | 4 >(1)
const cancelModal = ref(false)
const cancelling = ref(false)
const showPay = ref(false)

const loadingDates = ref(false)
const loadingSessions = ref(false)
const loadingSummary = ref(false)

const availability = ref<any>(null)
const selectedDate = ref<string | null>(null)

const sessions = ref<any[]>([])
const selectedSessions = ref<any[]>([])

const additionals = ref<any[]>([])
const selectedAdditions = ref<any[]>([])
const loadingAdditionals = ref(false)
const loadingPayment = ref(false)

const guestContact = ref('')
const guestName = ref('')

const summary = ref<BookingSummary>()

/* =====================
   OPEN MODAL
===================== */
const openSchedule = async (courtId: number) => {
  selectedCourtId.value = courtId
  showSchedule.value = true
  step.value = 1

  selectedDate.value = null
  selectedSessions.value = []
  selectedAdditions.value = []
  guestContact.value = ''
  guestName.value = ''

  loadingDates.value = true
  try {
    availability.value = await api(
      `/courts/${courtId}/availability/month`
    )
  } finally {
    loadingDates.value = false
  }
}

/* =====================
   STEP 1
===================== */
const selectDate = async (date: string, available: boolean) => {
  if (!available || !selectedCourtId.value) return

  selectedDate.value = date
  step.value = 2

  loadingSessions.value = true
  try {
    const res: any = await api(
      `/courts/${selectedCourtId.value}/availability/day?date=${date}`
    )
    sessions.value = res.sessions
  } finally {
    loadingSessions.value = false
  }
}

const toggleSession = (session: any) => {
  const idx = selectedSessions.value.findIndex(
    s => s.start === session.start && s.end === session.end
  )

  // kalau sudah dipilih → unselect
  if (idx !== -1) {
    selectedSessions.value.splice(idx, 1)
    return
  }

  // kalau belum dipilih tapi sudah 3 → stop
  if (selectedSessions.value.length >= 3) {
    return
  }

  // kalau masih < 3 → tambah
  selectedSessions.value.push(session)
}

const continueAddition = async () => {
  if (!selectedSessions.value.length || !selectedCourtId.value) return
  step.value = 3
  loadingAdditionals.value = true

  try {
    const res: any = await api(`/courts/${selectedCourtId.value}/availability/additional`)
    additionals.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loadingAdditionals.value = false
  }
}

const toggleAdditional = (item: any) => {
  const idx = selectedAdditions.value.findIndex(a => a.id === item.id)

  if (idx !== -1) {
    selectedAdditions.value.splice(idx, 1)
  } else {
    selectedAdditions.value.push(item)
  }
}

const additionTotal = computed(() =>
  selectedAdditions.value.reduce((sum, a) => sum + a.price, 0)
)

const continueFromSession = () => {
  if (!selectedSessions.value.length) return
  step.value = 4
}

const backStep1 = () => {
    step.value = 1

    selectedDate.value = null
    sessions.value = []
    selectedSessions.value = []
    selectedAdditions.value = []
}
const backStep2 = () => {
    step.value = 2

    selectedAdditions.value = []
}
const backStep3 = () => {
    step.value = 3
}

const submitHold = async () => {
  if (!selectedCourtId.value) return

  const res: any = await api('/booking/manualBooking', {
    method: 'POST',
    body: {
      court_id: selectedCourtId.value,
      date: selectedDate.value,
      sessions: selectedSessions.value,
      additions: selectedAdditions.value,
      guest_name: guestName.value,
      guest_contact: guestContact.value,
    }
  })

  showSchedule.value = false
  showPayment.value = true
  fetchSummary()
}

const getDurationMinutes = (start: any, end: any) => {
  if (!start || !end) return 0

  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)

  const startMinutes = sh * 60 + sm
  let endMinutes = eh * 60 + em

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60
  }
  return endMinutes - startMinutes
}

const fetchSummary = async () => {
  loadingSummary.value = true
  try {
    const res: ApiResponse<BookingSummary> = await api('/booking/paymentSummary')
    summary.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loadingSummary.value = false
  }
}

const cancelPayment = async () => {
  cancelling.value = true
  try {
    await api('/booking/cancelPayment', {
      method: 'POST'
    })

    showPayment.value = false
    cancelModal.value = false
    fetchSummary()
  } catch (e) {
    console.error(e)
  } finally {
    cancelling.value = false
  }
}

const openPayment = () => {
  showPay.value = true
}
const closePayment = () => {
  showPay.value = false
}

const selectQris = () => {
  paymentMethod.value = 'Qris'
}
const selectCash = () => {
  paymentMethod.value = 'Cash'
}
const selectDebit = () => {
  paymentMethod.value = 'Debit'
}
const selectBank = () => {
  paymentMethod.value = 'Bank Transfer'
}

const pay = async () => {
  loadingPayment.value = true
  try {
    const res: any = await api(`/booking/pay`, {
      method: 'POST',
      body: {
        payment_type: paymentMethod.value
      }
    })

    showPay.value = false
    showPayment.value = false
    fetchSummary()
  } catch (e) {
    console.error(e)
  } finally {
    loadingPayment.value = false
  }
}



// MOBILE MODAL HANDLING
const startY = ref(0)
const currentY = ref(0)
const isDragging = ref(false)

const scrollContainer = ref<HTMLElement | null>(null)

const isAtTop = ref(false)

const onTouchStart = (e: TouchEvent) => {
  const el = scrollContainer.value
  isAtTop.value = el ? el.scrollTop === 0 : true
  startY.value = e.touches[0]?.clientY ?? 0
  isDragging.value = isAtTop.value
}

const onTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return

  e.preventDefault()

  currentY.value = e.touches[0]?.clientY ?? 0
}
const onTouchEnd = () => {
  if (!isDragging.value) return
  const diff = currentY.value - startY.value
  if (diff > 100) {
    showSchedule.value = false
  }
  isDragging.value = false
  currentY.value = 0
}

onMounted(fetchSummary)
</script>

<template>
<div class="font-inter grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <div v-for="court in venue.court" :key="court.id" class="bg-white border rounded-xl overflow-hidden shadow hover:shadow-lg">
        <img :src="court.image_url" class="h-40 w-full object-cover" />
        <div class="flex flex-col lg:flex-row gap-2 justify-between p-4">
            <div class="flex flex-col gap-2">
                <h3 class="font-semibold">{{ court.name }}</h3>
                <SportIcon :name="court.sport_type.id" :size="20" color="#3A3A3A" class="bg-gray-100 w-fit p-1 rounded"/>
                <div class="flex items-center gap-1"> 
                    <p class="text-lg font-semibold flex flex-col items-start">
                        Rp{{ new Intl.NumberFormat('id-ID').format(court.price) }}
                    </p> 
                    <p class="text-[12px] text-gray-400">/</p> 
                    <p class="text-[12px] text-gray-400">session</p> 
                </div>
            </div>
            <button class="flex justify-center gap-2 h-fit p-2 font-semibold bg-blue-900 text-white rounded-lg" @click="openSchedule(court.id)">
                <p class="text-sm">Check Schedule</p>
                <Icon icon="uil:schedule" width="20" height="20"/>
            </button>
        </div>
    </div>
</div>


  <!-- MODAL -->
<div v-if="showSchedule" class="fixed inset-0 bg-black/50 z-50 hidden md:flex items-center justify-center">
  <div class="bg-white w-[900px] rounded-xl pb-3 relative">
    <div class="flex flex-row justify-between top-1 p-5 bg-blue-900 rounded-tr-lg rounded-tl-lg">
        <div v-if="step === 1" class="flex items-center justify-center gap-1">
            <h2 class="flex items-center gap-2 text-md font-semibold text-white border-e pe-5 me-5">Venue Schedule <Icon icon="uil:schedule" width="17" height="17"/></h2>
            <p class="text-sm text-white">{{ monthYear(availability?.month) }}</p>
        </div>
        <div v-else-if="step === 2" class="flex items-center gap-1">
            <button @click="backStep1" class="text-sm text-gray-300 hover:text-white">
                <Icon icon="ic:baseline-arrow-back-ios" width="20" height="20" />
            </button>
            <h2 class="flex items-center gap-2 text-md font-semibold text-white border-e pe-5 me-5">Available Session <Icon icon="mdi:update" width="20" height="20" /></h2>
            <p class="text-sm text-white">{{ fullDate(selectedDate) }}</p>
        </div>
        <div v-else-if="step === 3" class="flex items-center gap-1">
            <button @click="backStep2" class="text-sm text-gray-300 hover:text-white">
                <Icon icon="ic:baseline-arrow-back-ios" width="20" height="20" />
            </button>
            <h2 class="flex items-center gap-2 text-md font-semibold text-white">Additional Service <Icon icon="basil:add-outline" width="20" height="20" /></h2>
        </div>
        <div v-else="step === 4" class="flex items-center gap-1">
            <button @click="backStep3" class="text-sm text-gray-300 hover:text-white">
                <Icon icon="ic:baseline-arrow-back-ios" width="20" height="20" />
            </button>
            <h2 class="flex items-center gap-2 text-md font-semibold text-white">Personal Information <Icon icon="bxs:contact" width="20" height="20" /></h2>
        </div>
        <button class="right-4 text-gray-300 hover:text-white" @click="showSchedule = false">
            <Icon icon="line-md:close" width="24" height="24" />
        </button>
    </div>
    <!-- STEP 1 : DATE -->
    <div v-if="step === 1" class="p-6">

      <div v-if="loadingDates" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="i in 16" :key="i" class="h-[72px] border rounded-xl p-4 animate-pulse flex justify-between items-center">
              <!-- Day -->
              <div class="h-4 w-10 bg-gray-200 rounded"></div>

              <!-- Date number -->
              <div class="h-6 w-6 bg-gray-200 rounded"></div>
          </div>
      </div>

        
      <div v-else >
        <p class="text-sm text-gray-400 mb-5">Please select your booking date according to the venue's operating dates.</p>
        <div class="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            <button v-for="d in availability?.dates"
            :key="d.date"
            @click="selectDate(d.date, d.has_available)"
            :disabled="!d.has_available"
            class="flex items-center justify-between border rounded-lg p-3 text-left4 shadow-sm hover:shadow-md"
            :class="[
                d.has_available
                ? 'hover:shadow-md'
                : 'bg-gray-100 text-gray-400 hover:shadow-none',
            ]"
            >
                <p class="text-xs">{{ d.day }}</p>
                <p class="text-xs">{{ d.has_available ? '' : 'Closed' }}</p>
                <p class="font-semibold">{{ d.date.split('-')[2] }}</p>
            </button>
        </div>
      </div>
    </div>

    <!-- STEP 2 : SESSION -->
    <div v-if="step === 2" class="px-6">

        <div v-if="loadingSessions" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6ce">
            <div v-for="i in 15" :key="i" class="p-5 border rounded-xl animate-pulse space-y-3">
                <!-- 60 Min -->
                <div class="h-4 w-16 bg-gray-200 rounded mx-auto"></div>

                <!-- Time range -->
                <div class="h-6 w-40 bg-gray-200 rounded mx-auto"></div>

                <!-- Price -->
                <div class="h-4 w-24 bg-gray-200 rounded mx-auto"></div>
            </div>
        </div>


      <div v-else class="mt-5">
        <p class="text-sm text-gray-400 mb-5">You can select up to three session for each transaction</p>
        <div class="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          <button v-for="s in sessions"
            :key="s.start"
            :disabled="!s.available || (selectedSessions.length >= 3 && !selectedSessions.find(x => x.start === s.start && x.end === s.end))"
            @click="toggleSession(s)"
            class="border rounded-lg p-3 text-left4 shadow-sm hover:shadow-md"
            :class="[
                !s.available && 'opacity-40 cursor-not-allowed',
                selectedSessions.find(
                x => x.start === s.start && x.end === s.end
                ) && 'bg-blue-50 border-[1.2px] border-blue-800 text-blue-900'
            ]"
            >
                <div class="flex flex-col">
                    <p class="text-[12px] font-semibold">{{ getDurationMinutes(s.start, s.end) }} Min</p>
                    <p class="font-semibold mb-2 text-md">{{ s.start }} - {{ s.end }}</p>
                    <div v-if="s.available">
                      <p class="text-sm">Rp{{ formatNumber(s.price) }} {{ venue.court.session_duration }}</p>
                    </div>
                    <div v-else>
                      <p class="text-sm">Unavailable</p>
                    </div>
                </div>
            </button>
        </div>
      </div>

      <div class="mt-5 flex justify-end">
        <button class="cursor-pointer font-bold bg-blue-900 text-white rounded-full px-5 py-2 hover:bg-blue-800" :disabled="selectedSessions.length === 0" @click="continueAddition">
            Next
        </button>
      </div>
    </div>
    
    <div v-if="step === 3" class="px-6">

      <div v-if="loadingAdditionals" class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
        <div v-for="i in 6" :key="i" class="p-4 border rounded-lg animate-pulse space-y-2">
          <div class="h-4 w-24 bg-gray-200 rounded"></div>
          <div class="h-3 w-full bg-gray-200 rounded"></div>
          <div class="h-3 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>

      <div v-else class="mt-5">
        <p class="text-sm text-gray-400 mb-5">
          Additional services are optional, you can choose multiple.
        </p>

        <div class="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(350px,1fr))]">
          <label v-for="add in additionals" :key="add.id"
            class="flex items-start gap-3 border rounded-lg p-3 cursor-pointer justify-between shadow-sm hover:shadow-md"
            :class="selectedAdditions.find(x => x.id === add.id) && 'bg-blue-50 border-blue-800'"
          >
            <div class="flex flex-col">
              <div class="flex justify-between border-b mb-2 pb-2">
                <h2 class="font-semibold text-sm">{{ add.additional_type.addon }}</h2>
                <p class="text-sm">Rp{{ formatNumber(add.price) }}</p>
              </div>
              <p class="text-[12px] text-gray-500">{{ add.description }}</p>
            </div>
          
            <input
              type="checkbox"
              class="hidden"
              :checked="selectedAdditions.find(x => x.id === add.id)"
              @change="toggleAdditional(add)"
            />
          </label>
        </div>
      </div>

      <div class="mt-5 flex justify-between">
        <div class="flex gap-2 items-center">
          <p class="text-sm font-semibold">Total Additional:</p>
          <p class="text-sm">Rp {{ formatNumber(additionTotal) }}</p>
        </div>
        <button
          class="cursor-pointer font-bold bg-blue-900 text-white rounded-full px-5 py-2 hover:bg-blue-800"
          @click="continueFromSession"
        >
          Continue
        </button>
      </div>
    </div>
    <div v-if="step === 4" class="flex flex-col gap-3 p-4">
      <div class="flex flex-col">
        <p class="text-sm text-gray-400 mb-5">We will send your booking receipt via WhatsApp</p>
        <div class="flex flex-col gap-3">
          <input v-model="guestName" placeholder="Customer Name" class="border rounded-lg px-3 py-2 w-full text-sm"/>
          <input v-model="guestContact" placeholder="Phone Number" class="border rounded-lg px-3 py-2 w-full text-sm"/>
        </div>
      </div>
      <button class="cursor-pointer font-bold bg-blue-900 text-white rounded-full px-5 py-2 hover:bg-blue-800" :disabled="!guestContact" @click="submitHold">
        Continue to Summary
      </button>
    </div>
  </div>
</div>

<div v-if="showSchedule" class="md:hidden fixed inset-0 z-50">
  <div @click="showSchedule = false" class="absolute inset-0 bg-black/50"></div>
  
  <div class="absolute bottom-0 left-0 w-full bg-white rounded-t-2xl py-5 transition-transform duration-300 ease-out"
      :style="{ height: '80%', transform: isDragging ? `translateY(${Math.max(0, currentY - startY)}px)` : 'translateY(0)'}"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
  >
    <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3"></div>
    <div ref="scrollContainer" class="flex flex-col h-full  gap-2 p-4 overflow-y-auto">
      <div v-if="step === 1" class="flex items-center justify-center gap-1">
        <h2 class="flex items-center gap-2 text-md font-semibold text-blue-900 border-e pe-5 me-5">Venue Schedule <Icon icon="uil:schedule" width="17" height="17"/></h2>
        <p class="text-sm text-blue-900">{{ monthYear(availability?.month) }} </p>
      </div>
      <div v-else-if="step === 2" class="flex items-center gap-1">
          <button @click="backStep1" class="text-sm text-gray-300 hover:text-blue-900">
              <Icon icon="ic:baseline-arrow-back-ios" width="20" height="20" />
          </button>
          <h2 class="flex items-center gap-2 text-md font-semibold text-blue-900 border-e pe-5 me-5">Available Session <Icon icon="mdi:update" width="20" height="20" /></h2>
          <p class="text-sm text-blue-900">{{ fullDate(selectedDate) }}</p>
      </div>
      <div v-else-if="step === 3" class="flex items-center gap-1">
          <button @click="backStep2" class="text-sm text-gray-300 hover:text-white">
              <Icon icon="ic:baseline-arrow-back-ios" width="20" height="20" />
          </button>
          <h2 class="flex items-center gap-2 text-md font-semibold text-blue-900">Additional Service <Icon icon="basil:add-outline" width="20" height="20" /></h2>
      </div>
      <div v-else="step === 4" class="flex items-center gap-1">
          <button @click="backStep3" class="text-sm text-gray-300 hover:text-blue-900">
              <Icon icon="ic:baseline-arrow-back-ios" width="20" height="20" />
          </button>
          <h2 class="flex items-center gap-2 text-md font-semibold text-blue-900">Fill Your Information <Icon icon="bxs:contact" width="20" height="20" /></h2>
      </div>

      <div v-if="step === 1" class="p-6">

        <div v-if="loadingDates" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="i in 16" :key="i" class="h-[72px] border rounded-xl p-4 animate-pulse flex justify-between items-center">
                <!-- Day -->
                <div class="h-4 w-10 bg-gray-200 rounded"></div>

                <!-- Date number -->
                <div class="h-6 w-6 bg-gray-200 rounded"></div>
            </div>
        </div>

          
        <div v-else >
          <p class="text-sm text-gray-400 mb-5">Please select your booking date according to the venue's operating dates.</p>
          <div class="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
              <button v-for="d in availability?.dates"
              :key="d.date"
              @click="selectDate(d.date, d.has_available)"
              :disabled="!d.has_available"
              class="flex items-center justify-between border rounded-lg p-3 text-left4 shadow-sm hover:shadow-md"
              :class="[
                  d.has_available
                  ? 'hover:shadow-md'
                  : 'bg-gray-100 text-gray-400 hover:shadow-none',
              ]"
              >
                  <p class="text-xs">{{ d.day }}</p>
                  <p class="text-xs">{{ d.has_available ? '' : 'Closed' }}</p>
                  <p class="font-semibold">{{ d.date.split('-')[2] }}</p>
              </button>
          </div>
        </div>
      </div>

      <div v-if="step === 2" class="px-6">

        <div v-if="loadingSessions" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6ce">
            <div v-for="i in 15" :key="i" class="p-5 border rounded-xl animate-pulse space-y-3">
                <!-- 60 Min -->
                <div class="h-4 w-16 bg-gray-200 rounded mx-auto"></div>

                <!-- Time range -->
                <div class="h-6 w-40 bg-gray-200 rounded mx-auto"></div>

                <!-- Price -->
                <div class="h-4 w-24 bg-gray-200 rounded mx-auto"></div>
            </div>
        </div>


        <div v-else class="mt-5">
          <p class="text-sm text-gray-400 mb-5">You can select up to three session for each transaction</p>
          <div class="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            <button v-for="s in sessions"
              :key="s.start"
              :disabled="!s.available || (selectedSessions.length >= 3 && !selectedSessions.find(x => x.start === s.start && x.end === s.end))"
              @click="toggleSession(s)"
              class="border rounded-lg p-3 text-left4 shadow-sm hover:shadow-md"
              :class="[
                  !s.available && 'opacity-40 cursor-not-allowed',
                  selectedSessions.find(
                  x => x.start === s.start && x.end === s.end
                  ) && 'bg-blue-50 border-[1.2px] border-blue-800 text-blue-900'
              ]"
              >
                  <div class="flex flex-col">
                      <p class="text-[12px] font-semibold">{{ getDurationMinutes(s.start, s.end) }} Min</p>
                      <p class="font-semibold mb-2 text-md">{{ s.start }} - {{ s.end }}</p>
                      <div v-if="s.available">
                        <p class="text-sm">Rp{{ formatNumber(s.price) }} {{ venue.court.session_duration }}</p>
                      </div>
                      <div v-else>
                        <p class="text-sm">Unavailable</p>
                      </div>
                  </div>
              </button>
          </div>
        </div>

        <div class="mt-5 flex justify-end">
          <button class="cursor-pointer font-bold bg-blue-900 text-white rounded-full px-5 py-2 hover:bg-blue-800" :disabled="selectedSessions.length === 0" @click="continueAddition">
              Next
          </button>
        </div>
      </div>
    
      <div v-if="step === 3" class="px-6">

        <div v-if="loadingAdditionals" class="grid grid-cols-1  gap-3 mt-5">
          <div v-for="i in 6" :key="i" class="p-4 border rounded-lg animate-pulse space-y-2">
            <div class="h-4 w-24 bg-gray-200 rounded"></div>
            <div class="h-3 w-full bg-gray-200 rounded"></div>
            <div class="h-3 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>

        <div v-else>
          <p class="text-sm text-gray-400 mb-5 mt-2">
            Additional services are optional, you can choose multiple.
          </p>

          <div class="grid grid-cols-1 gap-3">
            <label v-for="add in additionals" :key="add.id"
              class="flex items-start gap-3 border rounded-lg p-3 cursor-pointer justify-between shadow-sm hover:shadow-md"
              :class="selectedAdditions.find(x => x.id === add.id) && 'bg-blue-50 border-blue-800'"
            >
              <div class="flex flex-col">
                <div class="flex justify-between border-b mb-2 pb-2">
                  <h2 class="font-semibold text-sm">{{ add.additional_type.addon }}</h2>
                  <p class="text-sm">Rp{{ formatNumber(add.price) }}</p>
                </div>
                <p class="text-[12px] text-gray-500">{{ add.description }}</p>
              </div>
            
              <input
                type="checkbox"
                class="hidden"
                :checked="selectedAdditions.find(x => x.id === add.id)"
                @change="toggleAdditional(add)"
              />
            </label>
          </div>
        </div>

        <div class="mt-5 flex flex-col gap-2 justify-between">
          <div class="flex gap-2 items-center">
            <p class="text-sm font-semibold">Total Additional:</p>
            <p class="text-sm">Rp {{ formatNumber(additionTotal) }}</p>
          </div>
          <button
            class="cursor-pointer font-bold bg-blue-900 text-white rounded-full px-5 py-2 hover:bg-blue-800"
            @click="continueFromSession"
          >
            Continue
          </button>
        </div>
      </div>

      <div v-if="step === 4" class="flex flex-col gap-3 p-4">
        <div class="flex flex-col">
          <p class="text-sm text-gray-400 mb-5">We will send your booking receipt via WhatsApp</p>
          <div class="flex flex-col gap-3">
            <input v-model="guestName" placeholder="Your Name" class="border rounded-lg px-3 py-2 w-full text-sm"/>
            <input v-model="guestContact" placeholder="Ex: 0819-0819-6194" class="border rounded-lg px-3 py-2 w-full text-sm"/>
          </div>
        </div>
        <button class="cursor-pointer font-bold bg-blue-900 text-white rounded-full px-5 py-2 hover:bg-blue-800" :disabled="!guestContact" @click="submitHold">
          Continue to Summary
        </button>
      </div>

    </div>
  </div>
</div>

<div v-if="showPayment" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
  <div class="flex flex-col bg-white w-[900px] lg:rounded-xl pb-3 relative h-full lg:h-auto justify-between">
    <div class="flex flex-col">
      <div class="flex flex-row justify-between p-4 px-5 bg-blue-900 lg:rounded-tr-lg lg:rounded-tl-lg">
        <h2 class="text-[14px] font-semibold text-white">Booking Payment</h2>
      </div>
      <div v-if="loadingSummary" class="p-5 min-h-[470px]">
        <div class="animate-pulse space-y-2">

          <!-- HEADER -->
          <div class="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
            <div class="w-32 h-20 bg-gray-300 rounded"></div>

            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-300 rounded w-1/3"></div>
              <div class="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>

            <div class="text-right space-y-2">
              <div class="h-4 bg-gray-300 rounded w-20 ml-auto"></div>
              <div class="h-3 bg-gray-200 rounded w-24 ml-auto"></div>
              <div class="h-3 bg-gray-200 rounded w-24 ml-auto"></div>
            </div>
          </div>

          <!-- CONTENT -->
          <div class="grid grid-cols-3 gap-6">

            <div class="col-span-2 space-y-4">
              <div class="h-4 bg-gray-300 rounded w-1/4"></div>

              <!-- CARD -->
              <div class="bg-white p-4 rounded-xl shadow flex gap-4 items-center">
                <div class="w-32 h-20 bg-gray-300 rounded"></div>

                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-300 rounded w-1/3"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/5"></div>
                </div>

                <div class="h-4 bg-gray-300 rounded w-20"></div>
              </div>

              <!-- ADDONS -->
              <div class="space-y-2">
                <div class="h-3 bg-gray-300 rounded w-1/6"></div>
                <div class="flex justify-between">
                  <div class="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div class="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <div v-else-if="summary" class="flex flex-col p-5">
        <div class="max-[1000px]:hidden flex flex-row justify-between border rounded-md p-3 shadow items-center mb-5">
          <div class="flex gap-3">
            <img :src="venue.first_image.image_url" class="w-[130px]">
            <div class="flex flex-col">
              <p class="font-bold">{{ venue.name }}</p>
              <p class="text-sm">{{ summary.court.name }}</p>
            </div>
          </div>
          <div class="flex flex-col text-gray-600 text-sm">
            <p class="font-semibold">Session</p>
            <div v-for="session in summary.hold">
              <p class="text-[12px]">{{ formatTime3(session.start_time) }} - {{ formatTime3(session.end_time) }}</p>
            </div>
          </div>
        </div>
        <div class="min-[1000px]:hidden flex flex-col gap-2 text-sm mb-4">
          <p class="font-semibold">Session</p>
          <div class="grid grid-cols-3 gap-2">
            <div v-for="session in summary.hold">
              <p class="text-[13px] border p-2 rounded-md">{{ formatTime3(session.start_time) }} - {{ formatTime3(session.end_time) }}</p>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-5 lg:flex-row lg:gap-0">
          <div v-if="summary.additional.length > 0" class="flex flex-col border-0 lg:border-e lg:pe-4 lg:me-4 w-full lg:w-1/2">
            <h2 class="flex items-center gap-1 font-semibold text-sm">Additional Service <Icon icon="heroicons:bars-3-bottom-left-16-solid" width="15" height="15" /></h2>
            <div class="grid grid-cols-2 lg:grid-cols-1 gap-2 mt-4">
              <div v-for="add in summary.additional" class="border rounded-md p-2 text-sm">
                <p class="font-semibold">{{ add.additional.additional_type.addon }}</p>
                <p class="text-gray-500 text-[10px] lg:text-[12px] leading-tight mt-1">{{ add.additional.description }}</p>
              </div>
            </div>
          </div>
          <div class="w-full border-t pt-4 lg:pt-0 lg:border-0">
            <h2 class="flex items-center gap-1 font-semibold text-sm">Summary <Icon icon="mingcute:bill-line" width="15" height="15" /></h2>
            <div class="flex flex-col w-full gap-1 mt-4">
              <div class="flex justify-between items-end text-sm border p-2 rounded-md">
                <div class="flex items-start gap-2">
                  <img :src="summary.court.image_url" class="w-[120px] rounded-md object-cover">
                  <div class="flex flex-col">
                    <p class="font-semibold text-[13px]">{{ summary.court.name }}</p>
                    <div class="flex flex-col">
                      <div class="flex text-[12px] gap-2">
                        <p class="text-gray-500 ">Quantity:</p>
                        <p class="font-semibold">{{ summary.hold.length }} Sessions</p>
                      </div>
                    </div>
                    <p class="text-[12px]">On {{ formatDate(summary.booking_date) }}</p>
                  </div>
                </div>
                <p class="font-bold text-[12px]">Rp{{ formatNumber(summary.court_price) }}</p>
              </div>
              <div v-if="summary.additional.length > 0">
                <p class="text-sm font-semibold mb-1 mt-5">Add-ons</p>
                <div class="flex flex-col gap-1">
                  <div v-for="add in summary.additional">
                    <div class="flex justify-between items-center text-sm border-b border-dashed">
                      <p>{{ add.additional.additional_type.addon }}</p>
                      <p>Rp{{ formatNumber(add.price) }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex justify-between items-center border-b border-dashed text-sm mt-5">
                <p class="font-semibold">Subtotal</p>
                <p class="font-semibold">Rp{{ formatNumber(summary.subtotal) }}</p>
              </div>
              <div class="flex justify-between items-center border-b border-dashed text-[12px] text-gray-400">
                <p>Tax</p>
                <p>Rp{{ formatNumber(summary.tax) }}</p>
              </div> 
              <div class="flex justify-between items-center border rounded-md bg-blue-100 p-2 mt-3">
                <p class="text-[15px] font-bold">Total Price</p>
                <p class="text-[15px] font-bold">Rp{{ formatNumber(summary.total_price) }}</p>
              </div> 
              <div class="max-[1000px]:hidden flex flex-col sm:flex-col lg:flex-row gap-1 mt-3">
                <button @click="cancelModal = true" class="w-full border bg-red-900 text-white font-bold py-2 rounded-full text-[12px] flex items-center justify-center text-gray-600 hover:bg-red-800">
                  Cancel Booking <Icon icon="mynaui:trash" width="15" height="12" />
                </button>
                <button @click="openPayment" class="w-full border bg-blue-900 text-white text-[12px] py-2 px-3 rounded-full font-bold hover:bg-blue-800">
                  Continue Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="min-[1000px]:hidden flex flex-col sm:flex-col lg:flex-row gap-1 mx-4">
      <button @click="cancelModal = true" class="w-full border bg-red-900 text-white font-bold py-2 rounded-full text-[12px] flex items-center justify-center text-gray-600 hover:bg-red-800">
        Cancel Booking <Icon icon="mynaui:trash" width="15" height="12" />
      </button>
      <button @click="openPayment" class="w-full border bg-blue-900 text-white text-[12px] py-2 px-3 rounded-full font-bold hover:bg-blue-800">
        Continue Payment
      </button>
    </div>
  </div>
</div>

<div v-if="showPay" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 font-inter">
  <div @click="closePayment" class="absolute inset-0 bg-black/50"></div>
  <div class="absolute bg-white w-[360px] rounded-md p-5">
    <div class="flex flex-col text-sm font-semibold">
      <div class="flex justify-between items-center mb-4">
        <p class="font-semibold">Payment Method</p>
        <button @click="closePayment">
          <Icon icon="ic:baseline-close" width="20" height="20" />
        </button>
      </div>
      <div class="flex flex-col gap-2 text-gray-600">
        <button @click="selectCash" class="border-2 rounded-md p-2 flex justify-between transition-colors"
          :class="paymentMethod == 'Cash' ? 'bg-blue-900 text-white border-blue-900' : 'hover:border-blue-800'">
          <p>Cash</p>
          <Icon icon="ph:cash-register" width="20" height="20" />
        </button>
        <button @click="selectQris" class="border-2 rounded-md p-2 flex justify-between transition-colors"
        :class="paymentMethod == 'Qris' ? 'bg-blue-900 text-white border-blue-900' : 'hover:border-blue-800'">
          <p>QRIS</p>
          <Icon icon="boxicons:qr-scan" width="20" height="20" />
        </button>
        <button @click="selectDebit" class="border-2 rounded-md p-2 flex justify-between transition-colors"
        :class="paymentMethod == 'Debit' ? 'bg-blue-900 text-white border-blue-900' : 'hover:border-blue-800'">
          <p>Debit</p>
          <Icon icon="ion:card-outline" width="20" height="20" />
        </button>
        <button @click="selectBank" class="border-2 rounded-md p-2 flex justify-between transition-colors"
        :class="paymentMethod == 'Bank Transfer' ? 'bg-blue-900 text-white border-blue-900' : 'hover:border-blue-800'">
          <p>Manual Transfer</p>
          <Icon icon="cil:bank" width="20" height="20" />
        </button>
      </div>
      <div class="flex flex-col mt-5 items-center">
        <div v-if="paymentMethod == 'Qris'">
          <img :src="venue.qris.image_url" class="w-[300px] h-[300px] object-cover">
        </div>
        <div v-else-if="paymentMethod == 'Bank Transfer'" class="w-full">
          <div v-for="bank in venue.bank" class="flex flex-col items-center border rounded-md p-2">
            
            <p class="font-light text-[12px]">Account Number</p>
            <p class="text-lg text-blue-900">{{ bank.bank_account }}</p>
            <div class="flex w-full font-light text-[12px] justify-center">
              <p>{{ bank.account_type }} | {{ bank.bank_type }}</p>
            </div>
            
          </div>
        </div>
      </div>
      <div class="flex flex-col mt-5">
        <div class="flex justify-between border-b border-dashed pb-1 mb-2">
          <p class="font-light">Method</p>
          <div v-if="paymentMethod == 'Cash'">
            Cash
          </div>
          <div v-else-if="paymentMethod == 'Qris'" class="mt-5">
            QRIS
          </div>
          <div v-else-if="paymentMethod == 'Debit'">
            Debit
          </div>
          <div v-else-if="paymentMethod == 'Bank Transfer'">
            Manual Transfer
          </div>
          <div v-else>-</div>
        </div>
        <div v-if="summary" class="flex justify-between">
          <p class="">Total Price</p>
          <p class="font-semibold">Rp{{ formatNumber(summary.total_price) }}</p>
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-2 mt-5">
      <p class="text-[11px] leading-tight text-gray-400">This payment is processed manually, please ensure all payments have been completed</p>
      <button @click="pay" :disabled="loadingPayment" class="bg-blue-900 font-semibold text-white p-2 rounded-full text-sm w-full">
        {{ loadingPayment ? 'Processing...' : 'Confirm Payment' }}
      </button>
    </div>
  </div> 
</div>

<div v-if="cancelModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 font-inter">
  <div class="bg-white w-[360px] rounded-md p-10">
    <h3 class="text-lg font-bold mb-2">
      Cancel Booking
    </h3>

    <p class="text-sm text-gray-600 mb-5">
      Are you sure you want to cancel this booking?
      This action cannot be undone.
    </p>

    <div class="flex gap-3">
      <button @click="cancelModal = false" class="flex-1 border bg-gray-300 py-1 font-semibold text-white rounded-md hover:bg-gray-200">
        No
      </button>
      <button @click="cancelPayment" :disabled="cancelling" class="flex-1 bg-red-900 text-white py-1 text-sm font-semibold rounded-md hover:bg-red-800">
        {{ cancelling ? 'Cancelling...' : 'Cancel Booking' }}
      </button>
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
  <div>

  </div>
</Transition>

</template>

