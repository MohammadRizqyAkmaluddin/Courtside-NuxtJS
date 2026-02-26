<script setup lang="ts">
definePageMeta({
  layout: 'master'
})

import { ref, computed } from 'vue'
import { api } from '~/services/api'
import type { Venue } from '~/types'
import { Icon } from '@iconify/vue'
import CourtBooking from '@/components/Court.vue'
import type { IconName } from '@/components/SportIcon.vue'

const route = useRoute()
const venueId = String(route.params.id)

const venue = ref<Venue | null>(null)
const loading = ref(true)

const images = computed(() => venue.value?.images ?? [])


const fetchVenue = async () => {
    try {
        venue.value = await api(`/venues/${venueId}`)
    } finally {
        loading.value = false
    }
}
onMounted(fetchVenue)

const rating = computed(() => {
  if (!venue.value?.rating?.length) return 0

  const total = venue.value.rating.reduce(
    (sum: number, r: any) => sum + r.rate,
    0
  )
  return (total / venue.value.rating.length).toFixed(1)
})

const showModal = ref(false)
const activeIndex = ref(0)

const openModal = (index: number) => {
  activeIndex.value = index
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const nextImage = () => {
  activeIndex.value =
    (activeIndex.value + 1) % venue.value!.images.length
}

const prevImage = () => {
  activeIndex.value =
    (activeIndex.value - 1 + venue.value!.images.length) %
    venue.value!.images.length
}

const activeImage = computed(() => {
  return images.value[activeIndex.value]
})

const uniqueSportTypes = computed(() => {
  if (!venue.value) return []

  const map = new Map<number, {
    id: number
    icon: IconName
    label: string
  }>()

  venue.value.court.forEach(court => {
    const sportId = court.sport_type.id

    map.set(sportId, {
      id: sportId,
      icon: sportId as IconName,
      label: court.sport_type.type,
    })
  })

  return [...map.values()]
})

</script>


<template> 
  <div class="flex flex-col min-[1000px]:mt-10 mt-20 px-[100px] mb-20 font-inter">

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-3 animate-pulse">
      <div class="md:col-span-2 h-[280px] md:h-[420px] bg-gray-200 rounded-xl"></div>

      <div class="flex flex-col gap-3">
        <div class="h-[135px] md:h-[205px] bg-gray-200 rounded-xl"></div>
        <div class="h-[135px] md:h-[205px] bg-gray-200 rounded-xl"></div>
      </div>
    </div>


    <div v-else-if="venue">
      <!-- IMAGE MODAL -->
      <div v-if="showModal" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
        <!-- CLOSE -->
        <button
          class="absolute top-6 right-6 text-white text-3xl"
          @click="closeModal"
        >
          ✕
        </button>

        <!-- PREV -->
        <button
          class="absolute left-6 text-white text-4xl"
          @click="prevImage"
        >
          ‹
        </button>

        <!-- IMAGE -->
        <img
        v-if="activeImage"
        :src="activeImage.image_url"
        class="max-h-[85vh] max-w-[90vw] object-contain"
      />

        <!-- NEXT -->
        <button
          class="absolute right-6 text-white text-4xl"
          @click="nextImage"
        >
          ›
        </button>
      </div>

      <!-- IMAGE GALLERY -->
      <div class="mt-6 hidden lg:block">

        <!-- 1 IMAGE -->
        <div v-if="images.length === 1" class="w-full">

          <img v-if="images[0]"
            :src="images[0].image_url"
            class="w-full h-full object-cover rounded-xl cursor-pointer"
            @click="openModal(0)"
          />

        </div>

        <!-- 2 IMAGES -->
        <div v-else-if="venue.images.length === 2" class="grid grid-cols-10 gap-2">

          <img
            v-if="images[0]"
            :src="images[0].image_url"
            class="col-span-7 h-full object-cover rounded-tl-lg rounded-bl-lg cursor-pointer"
            @click="openModal(0)"
          />

          <img
            v-if="images[1]"
            :src="images[1].image_url"
            class="col-span-3 h-full object-cover rounded-tr-lg rounded-br-lg cursor-pointer"
            @click="openModal(1)"
          />

        </div>

        <!-- 3+ IMAGES -->
        <div v-else class="grid grid-cols-10 gap-2 h-[570px]">

          <img v-if="images[0]"
            :src="images[0].image_url"
            class="col-span-7 h-full object-cover rounded-tl-lg rounded-bl-lg cursor-pointer"
            @click="openModal(0)"
          />

          <div class="col-span-3 grid grid-rows-1 gap-2">

            <img
            v-if="images[1]"
            :src="images[1].image_url"
              class="h-full object-cover rounded-tr-lg cursor-pointer"
              @click="openModal(1)"
            />

            <img
            v-if="images[2]"
            :src="images[2].image_url"
              class="h-full object-cover rounded-br-lg cursor-pointer"
              @click="openModal(2)"
            />

          </div>
        </div>

      </div>

      <div class="hidden sm:block lg:hidden">
        <img v-if="images[0]"
            :src="images[0].image_url"
            class="w-full h-full object-cover rounded-xl cursor-pointer"
            @click="openModal(0)"
          />
      </div>
      
      <div class="flex flex-col gap-7 mt-10 border-b pb-10">

        <h1 class="text-3xl font-bold">{{ venue.name }}</h1>
        
        <div class="flex">
        
          <div class="flex flex-col w-1/2 gap-5 me-5">
            <div class="flex flex-col gap-4">
              <div class="flex items-center gap-1">
                <div class="flex gap-1">
                  <p class="text-gray-700 font-bold">{{ rating }}</p>
                  <Icon icon="ic:baseline-star" class="text-orange-400" width="20" height="20" />
                </div>
                <Icon icon="ph:dot-outline" width="20" height="20" />
                <p class="text-md text-gray-700">{{ venue.city.city }}, {{ venue.city.province }}</p>
              </div>

              <div class="flex gap-2">
                <div v-for="type in uniqueSportTypes" :key="type.id">
                  <div class="bg-gray-100 p-1 rounded">
                    <SportIcon :name="type.icon" :size="20" color="#3A3A3A"/>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2 text-justify">
              <h2 class="font-semibold">Information</h2>
              <p class="text-sm text-gray-700">{{ venue.description }}</p>
            </div>
            <div class="flex flex-col gap-5">
              <h2 class="font-semibold">Facilities</h2>
              <div class="flex flex-wrap gap-5">
                <div v-for="facility in venue.facility" :key="facility.id">
                <FacilityIcon :name="facility.facility_type_id" size="25" color="gray"/>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col w-1/2">
          <VenueMap v-if="venue"
            :lat="Number(venue.latitude)"
            :lng="Number(venue.longitude)"
            :name="venue.name"
          />

          <NuxtLink :href="venue.link_map" class="flex gap-2 items-center justify-center font-bold text-white bg-blue-900 rounded-br-lg rounded-bl-lg py-1 hover:bg-blue-800">
            <p>See Location</p>
            <Icon icon="logos:google-maps" width="18" height="18" />
          </NuxtLink>
        </div>

        </div>
      </div>

      <div class="mt-8">
        <h2 class="text-xl font-semibold mb-4">Available Courts</h2>
          <!-- DISINI -->
           <CourtBooking v-if="venue" :venue="venue" />
      </div>
    </div>
  </div>

</template>