<script setup lang="ts">
  definePageMeta({
    layout: 'master'
  })

import { api } from '@/services/api'
import { Icon } from '@iconify/vue'
import type { City, SportType} from '~/types'

const cities = ref<City[]>([])
const sportTypes = ref<SportType[]>([])

const fetchCities = async () => {
  const data = await api<City[]>('/cities')
  cities.value = data
}

const fetchSportTypes = async () => {
  const data = await api<SportType[]>('/sport-types')
  sportTypes.value = data
}

const venues = ref([])
const loading = ref(true)
const pagination = ref({
  total: 0,
  from: 0,
  to: 0,
})

const page = ref(1)
const lastPage = ref(1)

const filters = reactive({
  search: '',
  city_id: '',
  sport_type_id: ''
})

const fetchVenues = async () => {
  loading.value = true

  try {
    const res: any = await api('/venues', {
      query: {
        page: page.value,
        per_page: 12,
        search: filters.search || undefined,
        city_id: filters.city_id || undefined,
        sport_type_id: filters.sport_type_id || undefined
      }
    })

    venues.value = res.data
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

watch(page, fetchVenues)

onMounted(fetchVenues)
onMounted(fetchCities)
onMounted(fetchSportTypes)
</script>

<template>
  <div class="flex flex-col max-w-7xl px-[50px] mx-auto mt-20 gap-5 font-inter">

    <div class="flex flex-col md:flex-row items-stratch w-full justify-between gap-2 border-b pb-7">
      <div class="flex items-center border border-gray-300 px-2 gap-2 rounded-full text-sm w-full">
        <Icon icon="glyphs:search-1-outline" class="text-gray-400" width="30" height="30" />
        <input 
          v-model="filters.search"
          @input="page = 1; fetchVenues()"
          placeholder="Search venue name"
          class="py-2 outline-none w-full"
        />
      </div>
      <div class="flex gap-2 text-sm">
        <div class="flex w-1/2 py-2 items-center border border-gray-300 rounded-full px-3">
          <Icon icon="grommet-icons:location" class="text-gray-300" width="20" height="20" />
          <select
            v-model="filters.city_id"
            @change="page = 1; fetchVenues()"
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

        <div class="flex w-1/2 py-2 items-center border border-gray-300 rounded-full px-3">
          <Icon icon="fluent:sport-basketball-20-regular" class="text-gray-400" width="16" height="16" />
          <select
            v-model="filters.sport_type_id"
            @change="page = 1; fetchVenues()"
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

    <div class="flex justify-between items-center">
      <p class="text-sm text-gray-400">Choose the venue that suits you best</p>
      <div class="flex gap-2 items-center">
        <p class="text-gray-400 text-sm">Showing</p>
        <p class="text-sm">{{ pagination.total }} venue result</p>
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="animate-pulse">
        <div class="h-40 bg-gray-200 rounded-xl"></div>
        <div class="h-4 bg-gray-200 mt-3 w-3/4"></div>
      </div>
    </div>
    
    <div v-else class="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4">
      <VenueCard
        v-for="venue in venues"
        :key="venue"
        :venue="venue"
      />
    </div>

    <div class="flex justify-center gap-2 mt-8">
      <button
        class="border p-2 rounded-full"
        :disabled="page === 1"
        @click="page--"
      >
        <Icon icon="picon:left" width="15" height="15" />
      </button>

      <button
        v-for="p in lastPage"
        :key="p"
        @click="page = p"
        class="px-3 rounded-full"
        :class="p === page ? 'bg-blue-900 text-white' : 'border'"
      >
        {{ p }}
      </button>

      <button
        class="p-2 border rounded-full"
        :disabled="page === lastPage"
        @click="page++"
      >
        <Icon icon="picon:right" width="15" height="15" />
      </button>
    </div>
  </div>
</template>
