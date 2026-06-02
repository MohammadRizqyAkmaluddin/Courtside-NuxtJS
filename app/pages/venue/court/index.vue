<script setup lang="ts">
definePageMeta({
    layout: 'venue'
})
import type { CourtMaterial, ApiResponse, Court, CourtType, SportType } from '~/types';
import { api } from '~/services/api';
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';

// VARIABLES
const courts = ref<Court[]>([])
const sport_types = ref<SportType[]>([])
const court_type = ref<CourtType[]>([])
const court_material = ref<CourtMaterial[]>([])
const amount = ref<any | null>(null)
const formattedAmount = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const imagePreview = ref<string | null>(null)

const activeModal = ref< 'addCourt' | 'modify' | 'addProduct' | null>(null)

// LOADING STATE
const loadingCourt = ref(false)
const loadingAddCourt = ref(false)

// MODAL VARIABLES
const showAddCourt = ref(false)
const addCourtStep = ref<1 | 2 >(1)

// BUTTON CONTROL
const openAddCourt = () => {
  showAddCourt.value = true
  addCourtStep.value = 1
  activeModal.value = 'addCourt'
}
const closeAddCourt = () => {
  showAddCourt.value = false
  addCourtStep.value = 1
}
const backButton = () => {
  addCourtStep.value = 1
}

const selectSportType = (sport_type: any) => {
  addCourtForm.value.sport_type_id = sport_type
  addCourtStep.value = 2
}
const selectCourtType = (court_type: any) => {
  addCourtForm.value.court_type_id = court_type
}
const selectCourtMaterial = (court_material: any) => {
  addCourtForm.value.court_material_id = court_material
}

const triggerFileInput = () => {
    fileInput.value?.click()
}
const handleImage = (e: Event) => {
    const target = e.target as HTMLInputElement

    if (target.files && target.files[0]) {
        const file = target.files[0]

        addCourtForm.value.image = file

        // preview
        imagePreview.value = URL.createObjectURL(file)
    }
}

// UTILS
const formatRupiah = (value: string) => {
  const number = value.replace(/\D/g, '')
  if (!number) return ''
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(Number(number))
}

const onInputAmount = (e: Event) => {
  const target = e.target as HTMLInputElement

  const raw = target.value.replace(/\D/g, '')

  amount.value = raw ? Number(raw) : null
  formattedAmount.value = raw ? formatRupiah(raw) : ''
}

// ERROR & VALIDATION
const errors = ref({
  court_type_id: '',
  court_material_id: '',
  name: '',
  price: '',
  session_duration: '',
  image: ''
})

const validateForm = () => {
  let isValid = true

  Object.keys(errors.value).forEach(key => {
    errors.value[key as keyof typeof errors.value] = ''
  })
  if (!addCourtForm.value.court_type_id) {
    errors.value.court_type_id = 'Type is required!'
    isValid = false
  }
  if (!addCourtForm.value.court_material_id) {
    errors.value.court_material_id = 'Material is required!'
    isValid = false
  }
  if (!addCourtForm.value.name) {
    errors.value.name = 'Name is required!'
    isValid = false
  }
  if (!amount.value) {
    errors.value.price = 'Price is required!'
    isValid = false
  }
  if (!addCourtForm.value.session_duration) {
    errors.value.session_duration = 'Duration is required!'
    isValid = false
  }
  if (!addCourtForm.value.image) {
    errors.value.image = 'Image is required!'
    isValid = false
  }

  return isValid
}

// SUBMIT
const addCourtForm = ref({
  sport_type_id: '',
  court_type_id: '',
  court_material_id: '',
  name: '',
  session_duration: '',
  image: null as File | null
})
const addCourt = async () => {
  if (!validateForm()) return
  try {
    const formData = new FormData()

    formData.append('sport_type_id', addCourtForm.value.sport_type_id)
    formData.append('court_type_id', addCourtForm.value.court_type_id)
    formData.append('court_material_id', addCourtForm.value.court_material_id)
    formData.append('name', addCourtForm.value.name)
    formData.append('session_duration', addCourtForm.value.session_duration)
    formData.append('price', amount.value)

    if (addCourtForm.value.image) {
      formData.append('image', addCourtForm.value.image)
    }

    await api('court/addCourt', {
      method: 'POST',
      body: formData
    })
    fetchCourt()
    closeAddCourt()
  } catch (e) {
    console.error(e)
  }
}

// DATA FETCHER
const fetchSportType = async () => {
  loadingAddCourt.value = true
  try {
    sport_types.value = await api('sport-types')
  } catch(e) {
    console.error(e)
  } finally {
    loadingAddCourt.value = false
  }
}
const fetchCourtType = async () => {
  loadingAddCourt.value = true
  try {
    court_type.value = await api('court-types')
  } catch(e) {
    console.error(e)
  } finally {
    loadingAddCourt.value = false
  }
}
const fetchCourtMaterial = async () => {
  loadingAddCourt.value = true
  try {
    court_material.value = await api('court-material')
  } catch(e) {
    console.error(e)
  } finally {
    loadingAddCourt.value = false
  }
}

const fetchCourt = async () => {
  loadingCourt.value = true
  try {
    const res: ApiResponse<Court[]> = await api('/court/indexCourt')
    courts.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loadingCourt.value = false
  }
}

onMounted(fetchCourt)
onMounted(fetchSportType)
onMounted(fetchCourtType)
onMounted(fetchCourtMaterial)


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
    if (activeModal.value === 'addCourt') {
      closeAddCourt()
    } else if (activeModal.value === 'modify') {
      closeAddCourt()
    }
  }
  isDragging.value = false
  currentY.value = 0
}
</script>

<template>

<div class="flex flex-col gap-2">
  <div v-if="loadingCourt" class="hidden md:grid grid-cols-3 gap-4">
    <div v-for="i in 6" :key="i">
      <div class="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
        <div class="w-full h-[160px] bg-gray-200"></div>
        <div class="p-5 flex flex-col gap-2">
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          <div class="flex justify-between">
            <div class="h-4 bg-gray-200 rounded w-1/3"></div>
            <div class="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="loadingCourt" class="flex flex-col gap-6 md:hidden">
      <div 
          v-for="i in 3" 
          :key="i"
          class="animate-pulse bg-white rounded-2xl shadow p-3 pb-4"
      >
          <div class="w-full h-40 bg-gray-100 rounded-xl mb-2"></div>
          <div class="h-4 bg-gray-100 rounded w-1/3 mb-1"></div>
          <div class="h-5 bg-gray-100 rounded w-1/2 mb-2"></div>
      </div>
  </div>
  <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <NuxtLink v-for="court in courts" :to="`/venue/court/${court.id}`" class="border rounded-xl bg-white overflow-hidden shadow hover:shadow-lg">
        <img :src="court.image_url" class="h-40 w-full object-cover" />
        <div class="flex flex-row gap-2 justify-between p-4">
          <div class="flex flex-col items-start">
            <h3 class="font-semibold">{{ court.name }}</h3>
            <div class="flex items-center gap-1"> 
                <p class="text-lg font-semibold flex flex-col items-start">
                    Rp{{ new Intl.NumberFormat('id-ID').format(court.price) }}
                </p> 
                <p class="text-[12px] text-gray-400">/</p> 
                <p class="text-[12px] text-gray-400">session</p> 
            </div>
          </div>
          <SportIcon :name="court.sport_type.id" :size="15" color="#3A3A3A" class="w-fit p-1 rounded"/>
        </div>
    </NuxtLink>
    <button @click="openAddCourt" class="hidden h-40 p-5 border rounded-xl h-full shadow md:flex flex-col items-center justify-center text-gray-500 hover:shadow-lg hover:text-gray-700">
      <div class="border-2 border-dashed flex flex-col items-center justify-center w-full h-full">
        <Icon icon="mdi:add-bold" width="40" height="40" />
        <p v-if="courts" class="font-semibold text-md">Add more court</p>
        <p v-else-if="!courts" class="font-semibold text-md">Add New Court</p>
      </div>
    </button>
    <button  @click="openAddCourt" class="bg-blue-900 text-white rounded-md p-2 flex items-center justify-center md:hidden">
        <p v-if="courts" class="font-semibold text-sm">Add more court</p>
        <p v-else-if="!courts" class="font-semibold text-sm">Add New Court</p>
    </button>
  </div>
</div>

<!-- DESKTOP -->
<div v-if="showAddCourt" class="max-[1000px]:hidden fixed inset-0 z-50 flex items-center justify-center">
  <div @click="closeAddCourt" class="absolute inset-0 bg-black/50"></div>

  <div v-if="addCourtStep == 1" class="absolute px-5 pb-5 bg-white rounded-md flex flex-col gap-3">
      <div class="flex justify-between border-b pb-3 mt-3">
          <h1 class="text-sm font-bold ">Add New Court</h1>
          <button @click="closeAddCourt" class="text-gray-500 hover:text-black"><Icon icon="ic:baseline-close" width="20" height="20" /></button>
      </div>
      <div class="grid grid-cols-2 gap-2 h-[600px] overflow-y-auto">
        <button @click="selectSportType(type.id)" v-for="type in sport_types" class="opacity-90 hover:opacity-100">
          <img :src="`/sport-type/${type.id}.png`" class="h-[100px] object-contain rounded-md">
        </button>
      </div>
  </div>

  <div v-else-if="addCourtStep == 2" class="w-[700px] absolute px-5 pb-5 bg-white rounded-md flex flex-col gap-3">
    <div class="flex justify-between border-b pb-3 mb-2 mt-3">
      <button @click="backButton" class="flex items-center gap-2">
        <Icon icon="weui:back-filled" width="16" height="16" />
        <h1 class="text-sm font-bold ">Specification & Detail</h1>
      </button>
      <button @click="closeAddCourt" class="text-gray-500 hover:text-black"><Icon icon="ic:baseline-close" width="20" height="20" /></button>
    </div>
    <div class="flex flex-col gap-2">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <p class="text-[12px] text-gray-500">Court Type</p>
          <p v-if="errors.court_type_id" class="text-red-500 text-xs">{{ errors.court_type_id }}</p>
        </div>
        <div class="flex gap-2">
          <button @click="selectCourtType(ct.id)" v-for="ct in court_type" class="flex items-center justify-center border rounded-md p-3 text-blue-900 gap-1 text-sm font-semibold w-full border-blue-900 border-2" :class="addCourtForm.court_type_id == ct.id ? 'bg-blue-900 text-white' : ''">
            <p>{{ ct.type }}</p>
            <Icon v-if="ct.id == '1'" icon="ph:house-bold" width="16" height="16" />
            <Icon v-else-if="ct.id == '2'" icon="tdesign:fog-sunny" width="16" height="16" />
          </button>
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <p class="text-[12px] text-gray-500">Field Material</p>
          <p v-if="errors.court_material_id" class="text-red-500 text-xs">{{ errors.court_material_id }}</p>
        </div>
        <div class="flex gap-2">
          <button v-for="cm in court_material" @click="selectCourtMaterial(cm.id)"
            class="w-full rounded-md overflow-hidden border transition-all duration-200"
            :class="addCourtForm.court_material_id == cm.id
              ? 'border-blue-900 ring-2 ring-blue-900'
              : 'border-gray-200 hover:border-gray-400'"
          >
            <img :src="`/court-material/${cm.id}.png`" class="w-full h-full object-contain transition-transform duration-300"
              :class="addCourtForm.court_material_id == cm.id
                ? 'scale-105 brightness-110'
                : 'hover:scale-105 brightness-90 hover:brightness-100'"
            />
          </button>
        </div>
      </div>
      <div class="flex gap-2 mt-2 items-end">
        <div class="flex flex-col gap-2 w-full">
          <div class="flex flex-col gap-1 mt-3">
            <div class="flex items-center gap-2">
              <p class="text-[12px] text-gray-500">Court Name</p>
              <p v-if="errors.name" class="text-red-500 text-xs">{{ errors.name }}</p>
            </div>
            <input v-model="addCourtForm.name" type="text" placeholder="Court Name" class="border px-3 py-2 text-sm rounded-md focus:outline-none"/>
          </div>
          <div class="flex flex-col gap-1 w-full">
            <div class="flex items-center gap-2">
              <p class="text-[12px] text-gray-500">Price per Session</p>
              <p v-if="errors.price" class="text-red-500 text-xs">{{ errors.price }}</p>
            </div>
            <input type="text" :value="formattedAmount" @input="onInputAmount" inputmode="numeric" :placeholder="'Price'" class="w-full text-sm border px-3 py-2 rounded-md focus:outline-none"/>
          </div>
          <div class="flex flex-col gap-1 w-full">
            <div class="flex items-center gap-2">
              <p class="text-[12px] text-gray-500">Duration per Session</p>
              <p v-if="errors.session_duration" class="text-red-500 text-xs">{{ errors.session_duration }}</p>
            </div>
            <div class="flex justify-between items-center text-sm border px-3 rounded-md">
              <input v-model="addCourtForm.session_duration" type="text" placeholder="Duration" class="w-full py-2 focus:outline-none"/>
              <p class="text-gray-400 font-semibold text-[12px] border-s ps-2">Minutes</p>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-1 w-full">
          <div class="flex items-center gap-2">
            <p class="text-[12px] text-gray-500">Court Image</p>
            <p v-if="errors.image" class="text-red-500 text-xs">{{ errors.image }}</p>
          </div>
          <div @click="triggerFileInput" class=" h-[175px] object-cover border-dashed border-2 rounded-md flex items-center justify-center cursor-pointer overflow-hidden hover:border-black transition">
              <span v-if="!imagePreview" class="flex flex-col items-center text-sm text-gray-400">
                  <p>Upload Court Image</p>
                  <p>(optional)</p>
              </span>
              <img v-else :src="imagePreview" class="w-full h-full object-cover"/>
          </div>
          <input @change="handleImage" ref="fileInput" type="file" class="hidden" accept="image/*"/>
        </div>
      </div>
      <button @click="addCourt" class="bg-blue-900 rounded-full text-white text-sm p-2 font-semibold mt-3 hover:bg-blue-800">Confirm</button>
    </div>
  </div>
</div>

<!-- MOBILE -->
<div v-if="showAddCourt" class="md:hidden fixed inset-0 z-50">
    <div @click="closeAddCourt" class="absolute inset-0 bg-black/50"></div>
    <div class="absolute bottom-0 left-0 w-full bg-white rounded-t-2xl py-5 transition-transform duration-300 ease-out"
        :style="{ height: '80%', transform: isDragging ? `translateY(${Math.max(0, currentY - startY)}px)` : 'translateY(0)'}"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
    >
        <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3"></div>
        <div ref="scrollContainer" class="flex flex-col h-full justify-between gap-2 p-4 overflow-y-auto">
          <div v-if="addCourtStep == 1" class="w-full rounded-md flex flex-col gap-3">
            <button @click="selectSportType(type.id)" v-for="type in sport_types" class="opacity-90 w-full hover:opacity-100">
              <img :src="`/sport-type/${type.id}.png`" class="w-full h-full object-contain rounded-md">
            </button>
          </div>

          <div v-else-if="addCourtStep == 2" class="w-full rounded-md flex flex-col gap-3">
            <div class="flex justify-between ">
              <button @click="backButton" class="flex items-center gap-2 mb-2">
                <Icon icon="weui:back-filled" width="16" height="16" />
                <h1 class="text-sm font-bold ">Specification & Detail</h1>
              </button>
            </div>
            <div class="flex flex-col gap-3">
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <p class="text-[12px] text-gray-500">Court Type</p>
                  <p v-if="errors.court_type_id" class="text-red-500 text-xs">{{ errors.court_type_id }}</p>
                </div>
                <div class="flex gap-2">
                  <button @click="selectCourtType(ct.id)" v-for="ct in court_type" class="flex items-center justify-center border rounded-md p-2 text-blue-900 gap-1 text-sm font-semibold w-full border-blue-900 border-2" :class="addCourtForm.court_type_id == ct.id ? 'bg-blue-900 text-white' : ''">
                    <p>{{ ct.type }}</p>
                    <Icon v-if="ct.id == '1'" icon="ph:house-bold" width="16" height="16" />
                    <Icon v-else-if="ct.id == '2'" icon="tdesign:fog-sunny" width="16" height="16" />
                  </button>
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <p class="text-[12px] text-gray-500">Field Material</p>
                  <p v-if="errors.court_material_id" class="text-red-500 text-xs">{{ errors.court_material_id }}</p>
                </div>
                <div class="flex gap-2">
                  <button v-for="cm in court_material" @click="selectCourtMaterial(cm.id)"
                    class="w-full rounded-md overflow-hidden border transition-all duration-200"
                    :class="addCourtForm.court_material_id == cm.id
                      ? 'border-blue-900 ring-2 ring-blue-900'
                      : 'border-gray-200 hover:border-gray-400'"
                  >
                    <img :src="`/court-material/${cm.id}.png`" class="w-full h-full object-contain transition-transform duration-300"
                      :class="addCourtForm.court_material_id == cm.id
                        ? 'scale-105 brightness-110'
                        : 'hover:scale-105 brightness-90 hover:brightness-100'"
                    />
                  </button>
                </div>
              </div>
              <div class="flex gap-2 mt-2 items-end">
                <div class="flex flex-col gap-2 w-full">
                  <div class="flex flex-col gap-1 mt-3">
                    <div class="flex items-center gap-2">
                      <p class="text-[12px] text-gray-500">Court Name</p>
                      <p v-if="errors.name" class="text-red-500 text-xs">{{ errors.name }}</p>
                    </div>
                    <input v-model="addCourtForm.name" type="text" placeholder="Court Name" class="border px-3 py-2 text-sm rounded-md focus:outline-none"/>
                  </div>
                  <div class="flex flex-col gap-1 w-full">
                    <div class="flex items-center gap-2">
                      <p class="text-[12px] text-gray-500">Price per Session</p>
                      <p v-if="errors.price" class="text-red-500 text-xs">{{ errors.price }}</p>
                    </div>
                    <input type="text" :value="formattedAmount" @input="onInputAmount" inputmode="numeric" :placeholder="'Price'" class="w-full text-sm border px-3 py-2 rounded-md focus:outline-none"/>
                  </div>
                  <div class="flex flex-col gap-1 w-full">
                    <div class="flex items-center gap-2">
                      <p class="text-[12px] text-gray-500">Duration per Session</p>
                      <p v-if="errors.session_duration" class="text-red-500 text-xs">{{ errors.session_duration }}</p>
                    </div>
                    <div class="flex justify-between items-center text-sm border px-3 rounded-md">
                      <input v-model="addCourtForm.session_duration" type="text" placeholder="Duration" class="w-full py-2 focus:outline-none"/>
                      <p class="text-gray-400 font-semibold text-[12px] border-s ps-2">Minutes</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex flex-col gap-1 w-full">
                <div class="flex items-center gap-2">
                  <p class="text-[12px] text-gray-500">Court Image</p>
                  <p v-if="errors.image" class="text-red-500 text-xs">{{ errors.image }}</p>
                </div>
                <div @click="triggerFileInput" class=" h-[175px] object-cover border-dashed border-2 rounded-md flex items-center justify-center cursor-pointer overflow-hidden hover:border-black transition">
                    <span v-if="!imagePreview" class="flex flex-col items-center text-sm text-gray-400">
                        <p>Upload Court Image</p>
                        <p>(optional)</p>
                    </span>
                    <img v-else :src="imagePreview" class="w-full h-full object-cover"/>
                </div>
                <input @change="handleImage" ref="fileInput" type="file" class="hidden" accept="image/*"/>
              </div>
              <button @click="addCourt" class="bg-blue-900 rounded-full text-white text-sm p-2 font-semibold mt-3 hover:bg-blue-800">Confirm</button>
            </div>
          </div>
        </div>
    </div>
</div>

</template>