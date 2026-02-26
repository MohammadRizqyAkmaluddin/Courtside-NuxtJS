<script setup lang="ts">

import type { City, SportType } from '~/types'
import { ref, onMounted } from 'vue'
import { api } from '~/services/api'
import { Icon } from '@iconify/vue'

definePageMeta({
  layout: 'master'
})

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


const communities = ref([])
const loading = ref(true)
const pagination = ref({
  total: 0,
  from: 0,
  to: 0
})

const page = ref(1)
const lastPage = ref(1)

const filters = reactive({
  search: '',
  city_id: '',
  sport_type_id: ''
})

const fetchCommunities = async () => {
  loading.value = true

  try {
    const res: any = await api('/communities', {
      query: {
        page: page.value,
        per_page: 6,
        search: filters.search || undefined,
        city_id: filters.city_id || undefined,
        sport_type_id: filters.sport_type_id || undefined
      }
    })
    
    communities.value = res.data
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
watch(page, fetchCommunities)
onMounted(fetchCommunities)
onMounted(fetchCities)
onMounted(fetchSportTypes)
</script>

<template>
  <div class="flex flex-col mx-auto gap-5 mt-20 font-inter px-[100px]">

    <div class="flex flex-col md:flex-row items-stratch w-full justify-between gap-2 border-b pb-7">
      <div class="flex items-center border border-gray-300 px-2 gap-2 rounded-full text-sm w-full">
        <Icon icon="glyphs:search-1-outline" class="text-gray-400" width="30" height="30" />
        <input 
          v-model="filters.search"
          @input="page = 1; fetchCommunities()"
          placeholder="Search venue name"
          class="py-2 outline-none w-full"
        />
      </div>
      <div class="flex gap-2 text-sm">
        <div class="flex w-1/2 items-center border border-gray-300 rounded-full px-3 py-2">
          <Icon icon="grommet-icons:location" class="text-gray-300" width="20" height="20" />
          <select
            v-model="filters.city_id"
            @change="page = 1; fetchCommunities()"
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
            @change="page = 1; fetchCommunities()"
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

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-for="n in 6" :key="n" class="h-64 bg-gray-200 animate-pulse rounded-xl" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CommunityCard v-for="community in communities" :key="community" :community="community"/>
    </div>

    <div class="flex justify-center gap-2 mt-20">
      <button :disabled="page === 1" @click="page--" class="border p-2 rounded-full">
        <Icon icon="picon:left" width="15" height="15" />
      </button>
      <button v-for="p in lastPage" :key="p" @click="page = p" class="px-3 rounded-full" :class="p === page ? 'bg-blue-900 text-white' : 'border'">
        {{ p }}
      </button>
      <button :disabled="page === lastPage" @click="page++" class="p-2 border rounded-full">
        <Icon icon="picon:right" width="15" height="15" />
      </button>
    </div>
  </div>
</template>
