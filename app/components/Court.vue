<script setup lang="ts">
import { ref, computed } from 'vue'
import { api } from '~/services/api'
import { Icon } from '@iconify/vue'
import { useDateFormat } from '~/composable/useDateFormat';

const { monthYear, fullDate } = useDateFormat()

/* =====================
   PROPS
===================== */
const props = defineProps<{
  venue: any
}>()

/* =====================
   AUTH
===================== */
const auth = useAuthUserStore()
const isAuthenticated = computed(() => !!auth.user?.id)

/* =====================
   STATE
===================== */
const selectedCourtId = ref<number | null>(null)

const showSchedule = ref(false)
const step = ref<1 | 2 | 3>(1)

const loadingDates = ref(false)
const loadingSessions = ref(false)

const availability = ref<any>(null)
const selectedDate = ref<string | null>(null)

const sessions = ref<any[]>([])
const selectedSessions = ref<any[]>([])

const guestContact = ref('')
const guestName = ref('')

/* =====================
   OPEN MODAL
===================== */
const openSchedule = async (courtId: number) => {
  selectedCourtId.value = courtId
  showSchedule.value = true
  step.value = 1

  selectedDate.value = null
  selectedSessions.value = []
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

/* =====================
   STEP 2
===================== */
const toggleSession = (session: any) => {
  const idx = selectedSessions.value.findIndex(
    s => s.start === session.start && s.end === session.end
  )

  idx === -1
    ? selectedSessions.value.push(session)
    : selectedSessions.value.splice(idx, 1)
}

const continueFromSession = () => {
  if (!selectedSessions.value.length) return

  isAuthenticated.value
    ? submitHold()
    : (step.value = 3)
}

const backStep1 = () => {
    step.value = 1

    selectedDate.value = null
    sessions.value = []
    selectedSessions.value = []
}
const backStep2 = () => {
    step.value = 2
}

/* =====================
   SUBMIT
===================== */
const submitHold = async () => {
  if (!selectedCourtId.value) return

  const endpoint = isAuthenticated.value
    ? '/booking-holds/auth'
    : '/booking-holds/guest'

  const res: any = await api(endpoint, {
    method: 'POST',
    body: {
      venue_id: props.venue.id,
      court_id: selectedCourtId.value,
      date: selectedDate.value,
      sessions: selectedSessions.value,
      guest_name: guestName.value,
      ...(isAuthenticated.value ? {} : { guest_contact: guestContact.value }),
    }
  })

  showSchedule.value = false
  navigateTo(`/booking/summary?id=${res.booking_hold_header_id}`)
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


</script>


<template>
<div class="font-inter grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <div v-for="court in venue.court" :key="court.id" class="border rounded-xl overflow-hidden shadow hover:shadow-lg">
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
<div v-if="showSchedule" class="font-inter fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
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
        <div v-else class="flex items-center gap-1">
            <button @click="backStep2" class="text-sm text-gray-300 hover:text-white">
                <Icon icon="ic:baseline-arrow-back-ios" width="20" height="20" />
            </button>
            <h2 class="flex items-center gap-2 text-md font-semibold text-white">Fill Your Information <Icon icon="bxs:contact" width="20" height="20" /></h2>
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
        <p class="text-sm text-gray-400 mb-5">You can book more than one available sessions</p>
        <div class="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            <button v-for="s in sessions"
            :key="s.start"
            :disabled="!s.available"
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
                    <p class="text-sm">Rp{{ new Intl.NumberFormat('id-ID').format(s.price) }} {{ venue.court.session_duration }}</p>
                </div>
            </button>
        </div>
      </div>
      <div class="mt-5 flex justify-end">
        <button class="cursor-pointer font-bold bg-blue-900 text-white rounded-full px-5 py-2 hover:bg-blue-800" :disabled="selectedSessions.length === 0" @click="continueFromSession">
            Continue
        </button>
      </div>
    </div>

    <div v-if="step === 3" class="flex flex-col gap-3 p-4">
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
</template>

