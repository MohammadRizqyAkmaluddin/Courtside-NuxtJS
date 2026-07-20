<script setup lang="ts">
definePageMeta({
    layout: 'master'
})

import { ref, onMounted, watch, reactive } from 'vue';
import type { OpenSparring, City, SportType } from '~/types';
import { api } from '~/services/api';
import { Icon } from '@iconify/vue';

const authUser = useAuthUserStore()
const router = useRouter()
const sparring = ref<(OpenSparring[])>([])
const loading = ref(false)
const cities = ref<City[]>([])
const sportTypes = ref<SportType[]>([])
const showLogin = ref(false)
const showRegister = ref(false)
const error = ref('')

const selectedSparring = ref<OpenSparring | null>(null)
const selectedDateId = ref<number | null>(null)

const fetchCities = async () => {
  const data = await api<City[]>('/cities')
  cities.value = data
}

const fetchSportTypes = async () => {
  const data = await api<SportType[]>('/sport-types')
  sportTypes.value = data
}

const pagination = ref({
  total: 0,
  from: 0,
  to: 0,
})

const page = ref(1)
const lastPage = ref(1)

const filters = reactive({
  search: '',
  venue_id: '',
  city_id: '',
  sport_type_id: '',
  level: '',
  status: ''
})

const fetchSparring = async () => {
  loading.value = true

  try {
    const res: any = await api('/sparrings', {
      query: {
        page: page.value,
        per_page: 9,
        search: filters.search || undefined,
        venue_id: filters.venue_id || undefined,
        city_id: filters.city_id || undefined,
        sport_type_id: filters.sport_type_id || undefined,
        level_id: filters.level || undefined,
        status: filters.status || undefined,
      }
    })

    sparring.value = res.data
    selectedSparring.value = res.data && res.data.length ? res.data[0] : null
    lastPage.value = res.last_page
    pagination.value.total = res.total
    pagination.value.from = res.from
    pagination.value.to = res.to
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

watch(page, fetchSparring)

onMounted(fetchSparring)
onMounted(fetchCities)
onMounted(fetchSportTypes)

watch(selectedSparring, () => {
  selectedDateId.value = null
})

const selectDate = (id: number) => {
  selectedDateId.value = id
}

// MODAL VARIABLES
const showSparring = ref(false)
const step = ref<1 | 2 >(1)

const closeSparring = () => {
  showSparring.value = false
  step.value = 1
}
const backButton = () => {
  step.value = 1
}

const openRegister = () => {
    showRegister.value  = true
    showLogin.value = false
}
const closeRegister = () => {
    showRegister.value = false
}

const openLogin = () => {
    showLogin.value = true
    showRegister.value  = false
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
  currentY.value = e.touches[0]?.clientY ?? 0
}

const onTouchEnd = () => {
  if (!isDragging.value) return
  const diff = currentY.value - startY.value
  if (diff > 100) {
    closeSparring()
  }
  isDragging.value = false
  currentY.value = 0
}

// SUBMIT SPARRING

const submitSelectDate = async () => {
  if (!selectedSparring.value || !selectedDateId.value) return

  try {
    loading.value = true

    const res: any = await api('/sparrings/select', {
      method: 'POST',
      body: {
        open_sparring_id: selectedSparring.value.id,
        datelist_id: selectedDateId.value
      }
    })

    await fetchSparring()
    const conversationId = res.conversation_id

    if (conversationId) {
      await router.push({ path: '/message', query: { conversation_id: String(conversationId) } })
    } else {
      alert('Berhasil pilih tanggal!')
    }
  } catch (err) {
    console.error(err)
    alert('Gagal pilih tanggal')
  } finally {
    loading.value = false
  }
}


// AUTHORIZE

const loginForm = reactive({
    email: '',
    password: ''
})

const submitLogin = async () => {
    try {
        await authUser.login(loginForm)
    } catch (e) {
        console.error(e)
    } finally {
        showLogin.value = false
    }
}

const registerForm = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
})

const submitRegister = async () => {
  error.value = ''

  try {
    await authUser.register(registerForm)
  } catch (e) {
    console.error(e)
    error.value = 'Gagal register user'
  } finally {
    showRegister.value = false
  }
}

</script>

<template>
    <div class="flex flex-col mx-[20px] lg:mx-[100px] mt-16 gap-5 font-inter">

    <div class="flex flex-col md:flex-row items-stratch w-full justify-between gap-2 border-b pb-7">
      <div class="flex items-center border border-gray-300 px-2 gap-2 rounded-full text-sm w-full">
        <Icon icon="glyphs:search-1-outline" class="text-gray-400" width="30" height="30" />
        <input 
          v-model="filters.search"
          @input="page = 1; fetchSparring()"
          placeholder="Search venue name"
          class="py-2 outline-none w-full"
        />
      </div>
      <div class="flex gap-2 text-sm">
        <div class="flex w-1/2 items-center border border-gray-300 rounded-full px-3 py-2">
          <Icon icon="grommet-icons:location" class="text-gray-300" width="20" height="20" />
          <select
            v-model="filters.city_id"
            @change="page = 1; fetchSparring()"
            class="text-gray-400 appearance-none px-5 focus:outline-none"
          >
            <option value="">All Cities</option>
            <option
              v-for="city in cities"
              :key="city.id"
              :value="city.id"
              class="mt-10"
            >
              {{ city.city }}
            </option>
          </select>
        </div>

        <div class="flex w-1/2 items-center border border-gray-300 rounded-full px-3 py-2">
          <Icon icon="fluent:sport-basketball-20-regular" class="text-gray-400" width="16" height="16" />
          <select
            v-model="filters.sport_type_id"
            @change="page = 1; fetchSparring()"
            class="text-gray-400 appearance-none px-5 focus:outline-none"
          >
            <option value="">All Sports</option>
            <option
              v-for="sport in sportTypes"
              :key="sport.id"
              :value="sport.id"
            >
              {{ sport.type }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="flex flex-col md:flex-row justify-between items-start gap-2">
      <p class="text-sm text-gray-400">Find your sport sparring partner</p>
      <div class="flex gap-2 items-center">
        <p class="text-gray-400 text-sm">Showing</p>
        <p class="text-sm">{{ pagination.total }} venue result</p>
      </div>
    </div>
    
    <div v-if="loading" class="hidden lg:flex gap-5 justify-between">
      <div class="flex flex-col gap-6 w-[40%] animate-pulse">
        <!-- User Info -->
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-gray-300"></div>
          <div class="space-y-2">
            <div class="w-32 h-4 bg-gray-300 rounded"></div>
            <div class="w-24 h-3 bg-gray-200 rounded"></div>
          </div>
        </div>

        <!-- Description -->
        <div class="w-full h-3 bg-gray-200 rounded"></div>
        <div class="w-3/4 h-3 bg-gray-200 rounded"></div>

        <!-- Location -->
        <div class="w-40 h-4 bg-gray-300 rounded"></div>

        <!-- Venue Card -->
        <div class="flex gap-3 p-3 border rounded-lg">
          <div class="w-24 h-16 bg-gray-300 rounded"></div>
          <div class="flex-1 space-y-2">
            <div class="w-40 h-4 bg-gray-300 rounded"></div>
            <div class="w-full h-3 bg-gray-200 rounded"></div>
            <div class="w-24 h-3 bg-gray-200 rounded"></div>
          </div>
        </div>

        <!-- Date Buttons -->
        <div class="grid grid-cols-2 gap-2">
          <div v-for="i in 4" :key="i" class="h-10 bg-gray-200 rounded"></div>
        </div>

        <!-- Button -->
        <div class="h-10 bg-gray-300 rounded"></div>

        <!-- Tips -->
        <div class="w-full h-3 bg-gray-200 rounded"></div>
      </div>
      <div class="w-[60%]">
        <div class="grid grid-cols-3 gap-4">
          <div
            v-for="i in 6"
            :key="i"
            class="p-6 border rounded-xl flex flex-col items-center space-y-6 animate-pulse"
          >
            <div class="w-20 h-20 rounded-full bg-gray-300"></div>
            <div class="w-32 h-4 bg-gray-300 rounded"></div>
            <div class="w-24 h-3 bg-gray-200 rounded"></div>
            <div class="w-full h-3 bg-gray-200 rounded"></div>
            <div class="w-3/4 h-3 bg-gray-200 rounded"></div>
            <div class="flex gap-2">
              <div class="w-16 h-6 bg-gray-200 rounded-full"></div>
              <div class="w-20 h-6 bg-gray-200 rounded-full"></div>
            </div>
            <div class="w-28 h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="loading" class="lg:hidden flex gap-5 grid grid-cols-1 md:grid-cols-2">
      <div v-for="i in 6"
        :key="i"
        class="p-6 border rounded-xl flex flex-col items-center space-y-6 animate-pulse"
      >
        <div class="w-20 h-20 rounded-full bg-gray-300"></div>
        <div class="w-32 h-4 bg-gray-300 rounded"></div>
        <div class="w-24 h-3 bg-gray-200 rounded"></div>
        <div class="w-full h-3 bg-gray-200 rounded"></div>
        <div class="w-3/4 h-3 bg-gray-200 rounded"></div>
        <div class="flex gap-2">
          <div class="w-16 h-6 bg-gray-200 rounded-full"></div>
          <div class="w-20 h-6 bg-gray-200 rounded-full"></div>
        </div>
        <div class="w-28 h-3 bg-gray-200 rounded"></div>
      </div>
    </div>
    <div v-else>
      <div  class="hidden lg:flex flex-col lg:flex-row gap-3 justify-between">
        <div class=" w-full lg:w-[40%] self-start lg:sticky lg:top-20">
          <div class="flex flex-col gap-2 p-4 bg-white">

            <div v-if="selectedSparring">
              <div class="flex gap-3 items-center">
                <img :src="selectedSparring.user.profile_image_url" class="w-[50px] h-[50px] rounded-md border object-cover">
                <div class="flex flex-col w-full gap-1">
                  <div class="flex justify-between w-full">
                    <h1 class="font-semibold text-lg">{{ selectedSparring.user.name }}</h1>
                    <p class="text-sm text-gray-400">Posted {{ formatDaysAgo(selectedSparring.created_at) }}</p>
                  </div>
                  <div class="flex gap-2">
                      <SportIcon :key="selectedSparring.sport_type?.id" :name="selectedSparring.sport_type?.id" color="gray" :size="19" class="bg-gray-100 w-fit rounded-lg"/>
                      <p class="text-gray-500 text-sm rounded-md bg-gray-100 px-2">{{ selectedSparring.level.level }} Player</p>
                  </div>
                </div>
              </div>
              <p class="text-sm text-gray-500 mt-5"> {{ selectedSparring.description }}</p>
              <p class="text-sm font-semibold mt-5">Location</p>
              <p class="text-sm">{{ selectedSparring.city.city }}, {{ selectedSparring.city.province }}</p>
              <NuxtLink v-if="selectedSparring?.venue" :to="`/court/${selectedSparring.venue.id}`" class="flex flex-col gap-3 mt-5 border rounded-md p-2">
                <div class="flex gap-3 items-start">
                  <img :src="selectedSparring.venue.first_image.image_url" class="w-[150px] h-[80px] border object-cover rounded-md">
                  <div class="flex flex-col min-w-0 justify-between h-full">
                    <div class="flex flex-col">
                      <h2 class="text-lg font-semibold truncate">
                        {{ selectedSparring.venue.name }}
                      </h2>
                      <p class="text-sm text-gray-600 truncate">
                        {{ selectedSparring.venue.address }}
                      </p>
                    </div>
                    <div class="flex items-center gap-2 mt-1">
                      <p class="text-sm">Start from</p>
                      <p class="font-semibold text-sm">Rp{{ formatNumber(selectedSparring.venue.min_price) }} / session</p>
                    </div>
                  </div>
                </div>
              </NuxtLink>
              <div v-else class="mt-5">
                <p class="font-semibold text-sm">Venue Unspecified</p>
                <p class="text-sm">This player is open to discuss for any venue location around {{ selectedSparring.city.city }}</p>
              </div>

              <div v-if="authUser.user" class="flex flex-col gap-3 mt-10">

                <div class="flex flex-col">
                  <p class="text-sm font-semibold">Select Sparring Date</p>

                  <div class="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    <div
                      v-for="date in selectedSparring.datelist"
                      :key="date.id"
                      @click="selectDate(date.id)"
                      :class="[
                        'border py-4 rounded-md p-2 text-center cursor-pointer transition',
                        selectedDateId === date.id
                          ? 'bg-blue-900 text-white border-blue-900'
                          : 'hover:border-blue-400'
                      ]"
                    >
                      <p class="text-sm font-medium">
                        {{ formatDate(date.date) }}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  @click="submitSelectDate"
                  :disabled="!selectedDateId || loading"
                  :class="[
                    'mt-3 py-2 rounded-md font-semibold transition',
                    selectedDateId
                      ? 'bg-blue-900 text-white hover:bg-blue-800'
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  ]"
                >
                  <span v-if="loading">Processing...</span>
                  <span v-else>Confirm</span>
                </button>
                <p class="text-sm text-gray-400">Tips: For the great match experience, make sure your opponent has an equal skill category</p>
              </div>
              <div v-else class="mt-10 flex flex-col gap-2">
                <p class="text-sm text-gray-500">Please Login to your account to start sparring</p>
                <button @click="openLogin" class="bg-blue-900 py-2 rounded-full w-1/2 text-white font-semibold">Login</button>
                <div class="flex gap-2 items-center gap-2 text-sm mt-2">
                  <p>New to Courtside?</p>
                  <button @click="openRegister" class=" font-semibold">Join Now</button>
                </div>
              </div>

            </div>

          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full lg:w-[60%]">
          <SparringCard
            v-for="sp in sparring"
            :key="sp.id"
            :sparring="sp"
            @select="selectedSparring = $event"
            :isSelected="selectedSparring?.id === sp.id"
          />
        </div>
      </div>
      <div class="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
        <SparringCard
          v-for="sp in sparring"
          :key="sp.id"
          :sparring="sp"
          @select="selectedSparring = $event"
          @click="showSparring = true"
        />
      </div>

      <div class="flex w-full">
        <div class="hidden md:flex justify-end gap-2 mt-20  w-1/2">
          
        </div>
        <div class="flex justify-center gap-2 mt-10 w-full lg:w-[60%]">
          <button :disabled="page === 1" @click="page--" class="border w-[35px] h-[35px] flex items-center justify-center me-5 rounded-full">
            <Icon icon="picon:left" width="15" height="15" />
          </button>
          <button v-for="p in lastPage" :key="p" @click="page = p" class="w-[35px] h-[35px] rounded-full" :class="p === page ? 'bg-blue-900 text-white' : 'border'">
            {{ p }}
          </button>
          <button :disabled="page === lastPage" @click="page++" class="w-[35px] h-[35px] flex items-center justify-center ms-5 border rounded-full">
            <Icon icon="picon:right" width="15" height="15" />
          </button>
        </div>
      </div>
      
    </div>


  </div>

<!-- MOBILE -->
<div v-if="showSparring" class="md:hidden fixed inset-0 z-50">
  <div @click="closeSparring" class="absolute inset-0 bg-black/50"></div>
  <div class="absolute bottom-0 left-0 w-full bg-white rounded-t-2xl py-5 transition-transform duration-300 ease-out"
      :style="{ height: '80%', transform: isDragging ? `translateY(${Math.max(0, currentY - startY)}px)` : 'translateY(0)'}"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
  >
      <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3"></div>
      <div ref="scrollContainer" class="flex flex-col h-full justify-between gap-2 p-4 overflow-y-auto">
        <div v-if="step == 1" class="w-full rounded-md flex flex-col gap-3">
          <div v-if="selectedSparring">
            <div class="flex gap-3 items-center">
              <img :src="selectedSparring.user.profile_image_url" class="w-[50px] h-[50px] rounded-md border object-cover">
              <div class="flex flex-col w-full ">
                  <h1 class="font-semibold text-lg">{{ selectedSparring.user.name }}</h1>
                  <p class="text-sm text-gray-400">Posted {{ formatDaysAgo(selectedSparring.created_at) }}</p>
                
                </div>
              </div>
              <div class="flex gap-2 mt-3">
                  <SportIcon :key="selectedSparring.sport_type?.id" :name="selectedSparring.sport_type?.id" color="gray" :size="19" class="bg-gray-100 w-fit rounded-lg"/>
                  <p class="text-gray-500 text-sm rounded-md bg-gray-100 px-2">{{ selectedSparring.level.level }} Player</p>
              </div>
              
            <p class="text-sm text-gray-500 mt-5"> {{ selectedSparring.description }}</p>
            <p class="text-sm font-semibold mt-5">Location</p>
            <p class="text-sm">{{ selectedSparring.city.city }}, {{ selectedSparring.city.province }}</p>
            <NuxtLink v-if="selectedSparring?.venue" :to="`/court/${selectedSparring.venue.id}`" class="flex flex-col gap-3 mt-5 border rounded-md p-2">
              <div class="flex gap-3 items-start">
                <img :src="selectedSparring.venue.first_image.image_url" class="w-[150px] h-[80px] border object-cover rounded-md">
                <div class="flex flex-col min-w-0 justify-between h-full">
                  <div class="flex flex-col">
                    <h2 class="text-lg font-semibold truncate">
                      {{ selectedSparring.venue.name }}
                    </h2>
                    <p class="text-sm text-gray-600 truncate">
                      {{ selectedSparring.venue.address }}
                    </p>
                  </div>
                  <div class="flex items-center gap-2 mt-1">
                    <p class="text-sm">Start from</p>
                    <p class="font-semibold text-sm">Rp{{ formatNumber(selectedSparring.venue.min_price) }}</p>
                  </div>
                </div>
              </div>
            </NuxtLink>
            <div v-else class="mt-5">
              <p class="font-semibold text-sm">Venue Unspecified</p>
              <p class="text-xs">This player is open to discuss for any venue location around {{ selectedSparring.city.city }}</p>
            </div>

            <div v-if="selectedSparring?.datelist?.length" class="flex flex-col gap-3 mt-10">

              <div class="flex flex-col">
                <p class="text-sm font-semibold">Select Sparring Date</p>

                <div class="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  <div
                    v-for="date in selectedSparring.datelist"
                    :key="date.id"
                    @click="selectDate(date.id)"
                    :class="[
                      'border py-4 rounded-md p-2 text-center cursor-pointer transition',
                      selectedDateId === date.id
                        ? 'bg-blue-900 text-white border-blue-900'
                        : 'hover:border-blue-400'
                    ]"
                  >
                    <p class="text-sm font-medium">
                      {{ formatDate(date.date) }}
                    </p>
                  </div>
                </div>
              </div>

              <button
                @click="submitSelectDate"
                :disabled="!selectedDateId || loading"
                :class="[
                  'mt-3 py-2 rounded-md font-semibold transition',
                  selectedDateId
                    ? 'bg-blue-900 text-white hover:bg-blue-800'
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                ]"
              >
                <span v-if="loading">Processing...</span>
                <span v-else>Confirm</span>
              </button>
              <p class="text-sm text-gray-400">Tips: For the great match experience, make sure your opponent has an equal skill category</p>
            </div>

          </div>
        </div>

      </div>
  </div>
</div>

<div v-if="showLogin" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center font-inter">
  <div class="bg-white w-[350px] rounded-lg p-10 relative">
      <div class="flex justify-between items-start">
          <img src="/logo.png" class="w-[130px] md:w-[150px] mb-5">
          <button @click="showLogin = false">
              <Icon icon="ic:baseline-close" width="20" height="20" />
          </button>
      </div>
      <form @submit.prevent="submitLogin">
          <div class="flex flex-col gap-4 font-inter">
              <div class="flex flex-col items-end">
                  <p class="text-gray-500 text-sm mb-5">Welcome back! Let’s get you back in the game</p>
                  <div class="w-full flex flex-col gap-2 text-[12px]">
                      <input v-model="loginForm.email" type="text" name="email" placeholder="Email" class="border w-full px-5 py-2 rounded-[10px] focus:outline-none">
                      <input v-model="loginForm.password" type="password" name="password" placeholder="Password" class="border w-full rounded-[10px] px-5 py-2 focus:outline-none">
                  </div>
                  <NuxtLink href="#" class="text-[12px] text-blue-900 font-bold mt-2">Forgot your password?</NuxtLink>
              </div>
              <button type="submit" class="bg-blue-900 text-white py-2 text-md font-bold rounded-[10px]">Login</button>
              <div class="flex gap-2 text-[12px]">
                  <p>New to Courtside?</p>
                  <button type="button" @click="openRegister" class="text-blue-900 font-black hover:underline">Join Now</button>
              </div>
              <div class="flex items-center w-full">
                  <div class="flex-1 border-t border-gray-300"></div>
                  <span class="px-3 text-sm text-gray-500">or</span>
                  <div class="flex-1 border-t border-gray-300"></div>
              </div>
              <button type="button" class="flex items-center justify-center gap-3 border text-sm rounded-full py-2 hover:bg-gray-100"><img src="/google.png" class="w-[25px]"> Login with Google</button>
          </div>
      </form>
  </div>
</div>
<div v-if="showRegister" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center font-inter">
  <div class="bg-white w-[350px] rounded-lg p-10 relative">
      <div class="flex justify-between items-start">
          <img src="/logo.png" class="w-[130px] md:w-[150px] mb-5">
          <button @click="closeRegister">
              <Icon icon="ic:baseline-close" width="20" height="20" />
          </button>
      </div>
      <form @submit.prevent="submitRegister" >
          <div class="flex flex-col gap-4 font-inter">
              <div class="flex flex-col">
                  <p class="text-gray-500 text-sm mb-5">Join Courtside and enjoy effortless court access</p>
                  <div class="flex flex-col gap-2 text-[12px]">
                      <input v-model="registerForm.name" type="text" name="email" placeholder="Name" class="border w-full px-5 py-2 rounded-[10px] focus:outline-none">
                      <input v-model="registerForm.phone" type="text" name="email" placeholder="Phone" class="border w-full px-5 py-2 rounded-[10px] focus:outline-none">
                    <div class="flex gap-2">
                      <input v-model="registerForm.email" type="text" name="email" placeholder="Email" class="border w-full px-5 py-2 rounded-[10px] focus:outline-none">
                      <input v-model="registerForm.password" type="password" name="password" placeholder="Password" class="border w-full rounded-[10px] px-5 py-2 focus:outline-none">
                      </div>
                  </div>
                  <p class="text-[10px] mt-3">By clicking Agree & Join, you agree to the Courtside User Agreement, and Privacy Policy.</p>
              </div>
              <button class="bg-blue-900 text-white py-2 text-md font-medium rounded-[10px]">Register</button>
              <div class="flex gap-2 text-[12px]">
                  <p>Already have an account?</p>
                  <button @click="openLogin" class="text-blue-900 font-black hover:underline">Login</button>
              </div>
              <div class="flex items-center w-full">
                  <div class="flex-1 border-t border-gray-300"></div>
                  <span class="px-3 text-sm text-gray-500">or</span>
                  <div class="flex-1 border-t border-gray-300"></div>
              </div>
              <button type="button" class="flex items-center justify-center gap-3 border text-sm rounded-full py-2 hover:bg-gray-100"><img src="/google.png" class="w-[25px]"> Join with Google</button>
          </div>
      </form>
  </div>
</div>

</template>