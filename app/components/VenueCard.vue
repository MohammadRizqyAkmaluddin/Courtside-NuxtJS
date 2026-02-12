<script setup>
import { computed } from 'vue'

const props = defineProps({
  venue: Object
})

const sportTypeIds = computed(() => {
  if (!props.venue?.court) return []

  return [...new Set(
    props.venue.court.map(c => c.sport_type_id)
  )]
})
</script>


<template>
  <NuxtLink :to="`/court/${venue.id}`" class="flex flex-col font-inter border rounded-lg shadow hover:shadow-xl transition-shadow duration-200">
    <img :src="venue.images?.[0]?.image_url" class="h-40 w-full object-cover rounded-t-lg">
    <div class="flex flex-col items-stretch py-3 px-4 gap-2">
      <h2 class="text-lg font-bold line-clamp-1">{{ venue.name }}</h2>
      <div class="flex flex-col gap-4">
        <div class="flex items-center">
          <SportIcon v-for="sportId in sportTypeIds"
            :key="sportId"
            :name="sportId"
            :size="15"
            color="gray"
          />
        </div>
        <div class="flex flex-col">
            <p class="text-[12px] text-gray-400">Start from</p>
            <div class="flex items-end justify-between">
              <div class="flex items-center gap-1">
                <p class="text-lg font-semibold flex flex-col items-start">Rp{{ new Intl.NumberFormat('id-ID').format(venue.court_min_price) }}</p>
                <p class="text-[12px] text-gray-400">/</p>
                <p class="text-[12px] text-gray-400">session</p>
              </div>
              <p class="text-[13px] text-gray-400">{{ venue.city?.city }}</p>
            </div>
        </div>
      </div>  
    </div>
  </NuxtLink>
  
  
</template>
