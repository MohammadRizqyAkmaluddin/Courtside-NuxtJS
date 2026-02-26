<script setup lang="ts">
definePageMeta({
    layout: 'master'
})

import { ref, computed } from 'vue';
import { api } from '~/services/api';
import type { Community } from '~/types';
import { Icon } from '@iconify/vue';
import { formatCurrency, formatTime, dayLabel } from '~/services/formating.js';
import { parseCommunityDescription } from '#imports';

const auth = useAuthUserStore()
const isAuth = computed(() => !!auth.user?.id)
const route = useRoute()
const communityId = String(route.params.id)
const community = ref<Community | null>(null)
const communities = ref([])
const loading = ref(true)

const fetchCommunity = async () => {
    try {
        community.value = await api(`/communities/${communityId}`)
        const res: any = await api(`/suggestion/${communityId}`)
        communities.value = res.data
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}
onMounted(fetchCommunity)

const parsedDescription = computed(() => {
  if (!community.value) return ''
  return parseCommunityDescription(community.value, { formatCurrency })
})

const showLogin = ref(false)

const error = ref('')
const loadingLogin = ref(false)
const loadingJoin = ref(false)

const openLogin = () => {
    showLogin.value = true
}
const closeLogin = () => {
    showLogin.value = false
}

const loginForm = reactive({
    email: '',
    password: ''
})

const submitLogin = async () => {
    loadingLogin.value = true
    error.value = ''

    try {
        await auth.login(loginForm)
    } catch (e) {
        console.error(e)
        error.value = 'Terjadi Kesalahan saat login'
    } finally {
        loadingLogin.value = false
        showLogin.value = false
        showJoin.value = true
        step.value = 1
    }
}

const showJoin = ref(false)
const step = ref<1 | 2 | 3>(1)

const openJoin = () => {
    showJoin.value = true
    step.value = 1
}
const selectPayment = () => {
    step.value = 2
}
const closeJoin = () => {
    showJoin.value = false
}
const backStep = () => {
    step.value = 1
}
</script>

<template>
    <div class="flex flex-col mt-10 font-inter">
        <div v-if="loading" class="animate-pulse space-y-6">
            <div class="flex ">
                <div class="h-[60px] bg-gray-200 w-full"></div>
            </div>
            <div class="bg-white rounded-xl p-6 shadow-sm px-[100px]">
                <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

                <!-- LEFT: Logo + Title -->
                <div class="flex gap-4 w-full md:w-2/3">
                    <!-- Logo -->
                    <div class="w-20 h-20 bg-gray-200 rounded-lg"></div>

                    <div class="flex-1 space-y-3">
                    <!-- Title -->
                    <div class="h-6 w-64 bg-gray-200 rounded"></div>

                    <!-- Badge -->
                    <div class="flex gap-2">
                        <div class="h-5 w-20 bg-gray-200 rounded-full"></div>
                        <div class="h-5 w-24 bg-gray-200 rounded-full"></div>
                    </div>

                    <!-- Button -->
                    <div class="h-10 w-40 bg-gray-200 rounded-lg mt-3"></div>
                    </div>
                </div>

                <!-- RIGHT: Stats Card -->
                <div class="w-full md:w-[420px] h-[110px] bg-gray-200 rounded-xl"></div>
                </div>
            </div>
            <div class="bg-white rounded-xl p-6 shadow-sm px-[100px]">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

                <!-- LEFT: About -->
                <div class="space-y-4">
                    <div class="h-5 w-40 bg-gray-200 rounded"></div>
                    <div class="h-4 w-full bg-gray-200 rounded"></div>
                    <div class="h-4 w-5/6 bg-gray-200 rounded"></div>
                    <div class="h-4 w-4/6 bg-gray-200 rounded"></div>

                    <div class="h-4 w-32 bg-gray-200 rounded mt-4"></div>
                    <div class="h-4 w-48 bg-gray-200 rounded"></div>
                </div>

                <!-- RIGHT: Location + Map -->
                <div class="md:col-span-2 space-y-4">
                    <!-- Location title -->
                    <div class="h-5 w-72 bg-gray-200 rounded"></div>

                    <!-- Map -->
                    <div class="h-[280px] md:h-[350px] bg-gray-200 rounded-xl"></div>

                    <!-- Button -->
                    <div class="h-10 w-full bg-gray-200 rounded-lg"></div>
                </div>

                </div>
            </div>
        </div>

        <div v-else-if="community" class="flex flex-col">
            <div class="flex bg-blue-900 p-5 text-sm px-[100px] text-white gap-2 items-center">
                <NuxtLink to="/">Home</NuxtLink>
                <Icon icon="mingcute:right-fill" width="15" height="15" />
                <NuxtLink to="/community">Explore Community</NuxtLink>
                <Icon icon="mingcute:right-fill" width="15" height="15" />
                <NuxtLink to="#">{{ community.name }}</NuxtLink>
            </div>
            <div class="flex lg:flex-row md:flex-col sm:flex-col items-center justify-between gap-10 lg:px-[100px] sm:px-0 mt-10">
                <div class="flex flex-col gap-5">
                    <div class="flex gap-3 items-center">
                        <img :src="community.image_url" class="w-20 h-20 object-cover">
                        <div class="flex flex-col">
                            <h2 class="text-2xl font-bold">{{ community.name }}</h2>
                            <div class="flex items-center gap-2">
                                <SportIcon :name="community.sport_type.id" :size="20" class="bg-gray-100 p-1 w-fit rounded-lg"/>
                                <p class="text-sm">{{ community.level.level }} Level</p>
                            </div>
                        </div>
                        <div v-if="!isAuth">
                            <button @click="openLogin" class="lg:hidden md:flex sm:flex bg-blue-900 py-4 px-4 font-bold text-white rounded-lg text-sm ms-10">Join Member</button>
                        </div>
                        <div v-else>
                            <button @click="openJoin" class="lg:hidden md:flex sm:flex bg-blue-900 py-4 px-4 font-bold text-white rounded-lg text-sm ms-10">Join Member</button>
                        </div>
                    </div>
                    <div v-if="!isAuth">
                        <button @click="openLogin" class="lg:flex md:hidden sm:hidden bg-blue-900 py-2 px-4 font-bold text-white justify-center rounded-lg text-sm">Join Member</button>
                    </div>
                    <div v-else>
                        <button @click="openJoin" class="lg:flex md:hidden sm:hidden bg-blue-900 py-2 px-4 font-bold text-white justify-center rounded-lg text-sm">Join Member</button>
                    </div>
                </div>
                <div class="flex items-center gap-5">
                    <div class="flex rounded-md p-5 border justify-between gap-10">
                        <div class="flex flex-col items-center">
                            <h2 class="text-sm text-gray-400">Total Member</h2>
                            <p class="font-bold text-sm text-blue-900">{{ community.total_member }} Person</p>
                        </div>
                        <div class="flex flex-col items-center ">
                            <h2 class="text-sm text-gray-400">Slot Available</h2>
                            <p class="font-bold text-sm text-blue-900">{{ community.max_slot - community.total_member }} Remaining</p>
                        </div>
                        <div class="flex flex-col items-center">
                            <div class="flex items-center gap-2 text-gray-400">
                                <h2 class="text-sm">Match Schedule</h2>
                                <Icon icon="heroicons:calendar-date-range" width="15" height="15"/>
                            </div>
                            <p class="font-bold text-sm text-blue-900">{{ dayLabel(community.day_of_week)  }}, {{ formatTime(community.start_time) }} - {{ formatTime(community.end_time) }}</p>
                        </div>
                        <div class="flex flex-col items-center">
                            <h2 class="text-sm text-gray-400">Member Fee</h2>
                            <p class="font-bold text-sm text-blue-900">{{ formatCurrency(community.membership_fee) }}</p>
                        </div>
                    </div>
                    
                </div>
            </div>

            <div class="flex justify-start px-[100px] lg:flex-row md:flex-col sm:flex-col text-sm gap-10 mt-10 text-gray-700 shadow-[0_0_12px_rgba(0,0,0,0.08)] py-10 min-h-[400px]">
                <div class="flex flex-col pe-10 lg:w-1/2 sm:w-full">
                    <div class="flex flex-col gap-3">
                        <div class="flex gap-2 items-center">
                            <Icon icon="majesticons:text-line" width="22" height="22" />
                            <h2 class="font-bold text-lg text-black">Community Information</h2>
                        </div>
                        <div class="prose prose-sm max-w-none text-gray-700 text-1xl" v-html="parsedDescription" />
                    </div>
                    <div class="flex gap-2 mt-5">
                        <p>Managed by</p>
                        <NuxtLink :to="`profile/${community.user.id}`" class="font-semibold text-gray-800">{{ community.user.name }}</NuxtLink>
                    </div>
                    <div class="flex gap-2">
                        <p>Contact Person:</p>
                        <p>{{ community.user.phone }}</p>
                    </div>
                    <div v-if="community.venue" class="flex flex-col mt-10 gap-3">
                        <p>Affiliated Venue</p>
                        <NuxtLink :to="`/court/${community.venue.id}`" class="flex items-center border p-3 rounded-md gap-2 w-fit">
                            <img :src="community.venue.first_image.image_url" class="h-10 w-30 object-cover">
                            <p class="text-sm font-bold">{{ community.venue.name }}</p>
                        </NuxtLink>
                    </div>
                </div>
                <div class="flex flex-col lg:w-1/2 sm:w-full">
                    <div v-if="community.address" class="h-[250px]">
                        <div class="flex gap-2 mb-2">
                            <p class="font-bold ">Location:</p>
                            <p class="text-gray-700">{{ community.address }} {{ community.city.city }}, {{ community.city.province }}</p>
                        </div>
                        <VenueMap
                            :lat="Number(community.latitude)"
                            :lng="Number(community.longitude)"
                            :name="community.venue_name"
                        />

                        <NuxtLink :href="community.map_link" class="flex gap-2 items-center justify-center font-bold text-white bg-blue-900 rounded-br-lg rounded-bl-lg py-1 hover:bg-blue-800">
                            <p>See Location</p>
                            <Icon icon="logos:google-maps" width="18" height="18" />
                        </NuxtLink>
                    </div>
                    <div v-else class="h-[250px] lg:pb-0 sm:pb-10">
                    
                        
                        <VenueMap
                            :lat="Number(community.venue.latitude)"
                            :lng="Number(community.venue.longitude)"
                            :name="community.venue.name"
                        />

                        <NuxtLink :href="community.venue.link_map" class="flex gap-2 items-center justify-center font-bold text-white bg-blue-900 rounded-br-lg rounded-bl-lg py-1 hover:bg-blue-800">
                            <p>See Location</p>
                            <Icon icon="logos:google-maps" width="18" height="18" />
                        </NuxtLink>
                    </div>
                </div>
            </div>

            <div class="flex flex-col px-[100px] mt-10 gap-5">
                <h2 class="font-bold text-1xl">More Suggestion</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <CommunityCard v-for="community in communities" :key="community" :community="community" />
                </div>
            </div>
        </div>
    </div>

    <div v-if="showLogin" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center font-inter">
        <div class="bg-white w-[500px] rounded-lg p-10 relative">
            <form @submit.prevent="submitLogin" >
                <div class="flex flex-col gap-6 font-inter">
                    <div class="flex flex-col">
                        <div class="flex justify-between">
                            <div class="mb-5">
                                <h2 class="font-bold text-2xl">Login</h2>
                                <p class="text-gray-500 text-sm">Welcome back! Let’s get you back in the game</p>
                            </div>
                            <button @click="closeLogin">
                                <Icon icon="ic:baseline-close" width="24" height="24" />
                            </button>
                        </div>
                        <div class="flex flex-col gap-2 text-sm">
                            <input v-model="loginForm.email" type="text" name="email" placeholder="Email" class="border w-full px-5 py-2 rounded-[10px] focus:outline-none">
                            <input v-model="loginForm.password" type="password" name="password" placeholder="Password" class="border w-full rounded-[10px] px-5 py-2 focus:outline-none">
                        </div>
                    </div>
                    <div class="flex justify-between text-sm font-inter">
                        <div class="flex gap-2">
                        <input type="checkbox" class="accent-blue-800">
                        <h3>Remember me</h3>
                        </div>
                        <NuxtLink href="#" class="text-sm">Forgot password?</NuxtLink>
                    </div>
                    <button class="bg-blue-900 text-white py-2 text-md font-medium rounded-[10px]">Login</button>
                    <div class="flex gap-2 text-sm">
                        <p>New to Courtside?</p>
                        <NuxtLink href="/auth/register/user" class="text-blue-900 font-black hover:underline">Join Now</NuxtLink>
                    </div>
                    <div class="flex items-center w-full">
                        <div class="flex-1 border-t border-gray-300"></div>
                        <span class="px-3 text-sm text-gray-500">or</span>
                        <div class="flex-1 border-t border-gray-300"></div>
                    </div>
                    <button type="button" class="flex items-center justify-center gap-3 border text-sm rounded-full py-2 hover:bg-gray-100"><img src="/google.png" class="w-[25px]"> Login with Google</button>
                </div>
            </form>
        </div>
    </div>

    <div v-if="showJoin && community" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center font-inter">
        <div class="bg-white w-[500px] rounded-xl pb-3 relative">
            <div class="top-1 py-5 px-6 bg-blue-900 rounded-tr-lg rounded-tl-lg flex items-center justify-between gap-1">
                <div v-if="step === 1">
                    <h2 class="flex items-center gap-2 text-md font-semibold text-white">Join {{ community.sport_type.type }} Community</h2>
                </div>
                <div v-if="step === 2" class="flex gap-2">
                    <button @click="backStep" class="text-sm text-gray-300 hover:text-white">
                        <Icon icon="ic:baseline-arrow-back-ios" width="18" height="18" />
                    </button>
                    <h2 class="flex items-center gap-2 text-md font-semibold text-white">Select Payment Method</h2>
                </div>
                <button @click="closeJoin"><Icon icon="material-symbols:close" width="24" height="24" class="text-white" /></button>
            </div>
            <div v-if="step === 1" class="flex flex-col p-6">
                <div class="flex gap-2 items-center mb-5">
                    <img :src="community.image_url" class="w-[60px] object-cover">
                    <div class="flex flex-col">
                        <h2 class=" font-bold">{{ community.name }}</h2>
                        <p class="">{{ community.level.level }} Level</p>
                    </div>
                </div>
                <div class="flex flex-col gap-2 border p-5 rounded-md mb-5">
                    <p class="text-sm flex items-center gap-2">
                        <Icon icon="heroicons:calendar-date-range" width="17" height="17"/>
                        {{ dayLabel(community.day_of_week)  }}, {{ formatTime(community.start_time) }} - {{ formatTime(community.end_time) }} 
                        <p class="text-sm text-gray-400">( total 4 sessions a month )</p>
                    </p>
                    <div class="flex items-center gap-2 mb-5">
                        <Icon icon="f7:sportscourt" width="16" height="16" />
                        <p v-if="community.venue" class="text-sm">{{ community.venue.name }}</p>
                        <p v-else class="text-sm">{{ community.venue_name }}</p>
                    </div>
                    <div class="flex flex-col border-t-2 pt-5 border-dotted">
                        <p class="text-sm">Monthly Subscription</p>
                        <p class="font-semibold"> {{ formatCurrency(community.membership_fee) }}</p>
                    </div>
                </div>
                <p class="text-sm text-gray-400 mb-3 px-4">Make sure this community is suitable for you</p>
                <button @click="selectPayment" class="bg-blue-900 text-white font-semibold py-2 rounded-md">Continue Payment</button>
            </div>
            <div v-if="step === 2" class="flex flex-col gap-5 p-6">
                
                <button @click="" class="bg-blue-900 text-white font-semibold py-2 rounded-md">Pay Now</button>
            </div>

        </div>
    </div>


</template>