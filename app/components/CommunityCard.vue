<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
    community: Object
})

const dayLabel = (day) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  return days[day - 1]
}

const formatTime = (time) => time.slice(0, 5)

const formatCurrency = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)

</script>

<template>
    <NuxtLink :to="`/community/${community.id}`" class="flex flex-col p-3 font-inter border rounded-lg shadow transition-shadow duration-200 hover:shadow-lg">
        <div class="flex justify-between">
            <div class="flex gap-3 items-center">
                <img :src="community.image_url" class="h-10 w-20 object-cover">
                <div class="flex flex-col">
                    <h2 class="text-lg font-semibold">{{ community.name }}</h2>
                    <SportIcon :key="community.sport_type?.id" :name="community.sport_type?.id" color="gray" :size="17"/>
                </div>
            </div>
        </div>
        <div class="flex flex-col text-sm mt-2 gap-1 text-gray-500">
            <div class="flex gap-1 items-center">
                <Icon icon="heroicons:calendar-date-range" width="17" height="20"/>
                <p>{{ dayLabel(community.day_of_week) }},</p>
                <p>{{ formatTime(community.start_time)}} - {{ formatTime(community.end_time)}}</p>
            </div>
            <div v-if="community.venue" class="flex flex-col gap-1">
                <div class="flex justify-between items-center">
                    <div class="flex gap-2 items-center">
                        <Icon icon="f7:sportscourt" width="17" height="17" />
                        <p>{{ community.venue.name }} </p>
                    </div>
                    <p>{{ community.venue.city.city }}</p>
                </div>
            </div>
            <div v-else>
                <div class="flex justify-between items-center">
                    <div class="flex gap-2 items-center">
                        <Icon icon="f7:sportscourt" width="17" height="17" />
                        <p>{{ community.venue_name }} </p>
                    </div>
                    <p>{{ community.city.city }}</p>
                </div>
            </div>
        </div>
    </NuxtLink>
</template>

