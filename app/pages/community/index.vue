<script setup lang="ts">

import type { Community } from '~/types'
import { ref, onMounted } from 'vue'
import { api } from '~/services/api'
import { Icon } from '@iconify/vue'

definePageMeta({
  layout: 'master'
})

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
        per_page: 5,
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

</script>

<template>
  <div class="space-y-6 mt-20 font-inter px-[100px]">

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-for="n in 6" :key="n" class="h-64 bg-gray-200 animate-pulse rounded-xl" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CommunityCard v-for="community in communities" :key="community" :community="community"/>
    </div>

    <div class="flex justify-center gap-2 mt-8">
      <button :disabled="page === 1" @click="page--" class="border p-2 rounded-full">
        <Icon icon="picon:left" width="15" height="15" />
      </button>
      <button v-for="p in lastPage" :key="p" @click="page = p" class="px-3 rounded-full" :class="p === page ? 'bg-blue-900 text-white' : 'border'">
        {{ p }}
      </button>
      <button :disabled="page === lastPage" @click="page++" class="p-2 border rouned-full">
        <Icon icon="picon:right" width="15" height="15" />
      </button>
    </div>
  </div>
</template>
