<script setup lang="ts">
definePageMeta({
    layout: 'venue'
})

// IMPORT
import type { ApiResponse, Court } from '~/types';
import { api } from '~/services/api';
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { icon } from 'leaflet';

// VARIABLE
const route = useRoute()
const courtId = String(route.params.id)
const court = ref<Court | null>(null)

// LOADING STATE
const loadingCourt = ref(false)

// BUTTON CONTROL
const back = () => {
    navigateTo('/venue/court')
}

// DATA FETCHER
const fetchCourt = async () => {
    loadingCourt.value = true
    try {
        const res: ApiResponse<Court> = await api(`court/${courtId}`)
        court.value = res.data
    } catch (e) {
        console.error(e)
    } finally {
        loadingCourt.value = false
    }
}

onMounted(fetchCourt)
</script>

<template>

<button @click="back" class="flex gap-2 items-center text-blue-900">
    <Icon icon="icon-park-outline:left" width="17" height="17" />
    <p class="text-md font-bold">Manage Court</p>
</button>

<div v-if="loadingCourt">p</div>
<div v-else-if="court" class="flex flex-col">
    <h1 class="font-bold text-lg">{{ court.name }}</h1>
</div>


</template>