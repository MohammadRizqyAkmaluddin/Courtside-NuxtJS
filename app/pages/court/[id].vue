<script setup lang="ts">
definePageMeta({
  layout: 'master'
})

import { api } from '~/services/api';
import type { Venue } from '~/types';
import { Icon } from '@iconify/vue';
import type { IconName } from '@/components/BaseIcon.vue'

const route = useRoute()
const venueId = route.params.id

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

onMounted(fetchVenue)
</script>


<template> 
  <div class="flex flex-col mt-10 px-[100px] mb-20 font-inter">
    <div v-if="loading">
      <div class="gap-2 animate-pulse">
        <div class="h-50 w-50 bg-gray-200 rounded-xl me-2 ms-2 mb-2"></div>
        <div class="gap-2">
          <div class="h-40 bg-gray-200 rounded-xl"></div>
        <div class="h-4 bg-gray-200 mt-3 w-3/4"></div>
        </div>
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
      
      <div class="flex flex-col gap-7 mt-10 border-b pb-5">

        <h1 class="text-3xl font-bold">{{ venue.name }}</h1>

        <div class="flex gap-5">
          <div class="flex flex-col gap-4 border-e pe-5">
            <div class="flex items-center gap-1">
              <div class="flex gap-1">
                <p class="text-gray-700 font-bold">4.5</p>
                <Icon icon="ic:baseline-star" class="text-orange-400" width="20" height="20" />
              </div>
              <Icon icon="ph:dot-outline" width="20" height="20" />
              <p class="text-md text-gray-700">{{ venue.city.city }}, {{ venue.city.province }}</p>
            </div>

            <div class="flex gap-2">
              <div v-for="type in uniqueSportTypes" :key="type.id">
                <div class="bg-gray-100 p-1 rounded">
                  <BaseIcon :name="type.icon" :size="20" color="#3A3A3A"/>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2 border-e pe-5">
            <h2 class="font-semibold">Description</h2>
            <p class="text-sm">{{ venue.description }}</p>
          </div>

          <div class="flex flex-col gap-2">
            <h2 class="font-semibold">Address</h2>
            <p class="text-sm">{{ venue.address }}</p>
          </div>
        </div>

      </div>

      <div class="mt-8">
        <h2 class="text-xl font-semibold mb-4">Available Courts</h2>
      
        <div class="grid grid-cols-3 gap-6">
          <div
            v-for="court in venue.court"
            :key="court.id"
            class="border rounded-xl overflow-hidden hover:shadow-lg transition"
          >
            <img :src="court.image_url"
              class="h-40 w-full object-cover"
            />
      
            <div class="p-4">
              <h3 class="font-semibold text-lg">
                {{ court.name }}
              </h3>
      
              <p class="text-sm text-gray-500">
                {{ court.sport_type.type }}
              </p>
      
              <p class="font-bold mt-2">
                Rp {{ court.price.toLocaleString('id-ID') }} / hour
              </p>
      
              <button
                class="mt-3 w-full bg-black text-white py-2 rounded-lg"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<!-- COURT LIST -->


  