<script setup lang="ts">

import type { Community } from '~/types'
import { ref, onMounted } from 'vue'
import { api } from '~/services/api'
import { Icon } from '@iconify/vue'

definePageMeta({
  layout: 'master'
})

const communities = ref<Community[]>([])
const loading = ref(true)

const dayLabel = (day: number) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  return days[day - 1]
}

const formatTime = (time: string) => time.slice(0, 5)

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)

const fetchCommunity = async () => {
  try {
    const res = await api('/community') as { community: Community[] }
    communities.value = res.community
  } finally {
    loading.value = false
  }
}
onMounted(fetchCommunity)

</script>

<template>
  <div class="space-y-6 mt-20 font-inter px-[100px]">

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-for="n in 6" :key="n" class="h-64 bg-gray-200 animate-pulse rounded-xl" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="c in communities" :key="c.id" class="flex flex-col rounded-lg border bg-white shadow-sm overflow-hidden hover:shadow-lg">
        <NuxtLink :to="`/community/${c.id}`" class="flex flex-col p-3 gap-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-5">
              <img :src="c.image_url" class="h-[35px] w-[35px] object-cover" alt="community"/>
              <h2 class="text-md font-semibold">{{ c.name }}</h2>
            </div>
              <SportIcon :name="c.sport_type.id" size="15" color="gray" class="bg-gray-100 p-1 rounded"/>
          </div>
          <div class="text-sm text-gray-500 mt-2">
            <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <Icon icon="uil:schedule" width="17" height="17"/>
                  <p>{{ dayLabel(c.day_of_week) }},</p>
                  <div class="flex gap-1">
                    <p>{{ formatTime(c.start_time) }}</p>-<p>{{ formatTime(c.end_time) }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <Icon icon="tdesign:location" width="17" height="17" />
                  <div v-if="c.city">{{ c.city.city }}, {{ c.city.province }}</div>
                  <div v-else>{{ c.venue.city.city }}, {{ c.venue.city.province }}</div>
                </div>
              </div>
              <p class="text-black mt-3">{{ c.description }}</p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
