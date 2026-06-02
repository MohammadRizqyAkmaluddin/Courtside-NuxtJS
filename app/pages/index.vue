<script setup lang="ts">
definePageMeta({
    layout: 'master'
})

import { Icon } from '@iconify/vue'

const playerTab = ref(false)
const venueTab = ref(true)

const changeToPlayer = () => {
    playerTab.value = true
    venueTab.value = false
}
const changeToVenue = () => {
    playerTab.value = false
    venueTab.value = true
}

</script>

<template>
    <div class="flex justify-between h-[600px] lg:h-[700px] bg-[url('/main-hero2.jpg')] bg-cover bg-center">
        <div class="w-full px-[40px] sm:px-[40px] lg:px-[100px] bg-black/30 lg:bg-black/0 flex flex-col justify- pt-[150px] gap-3 text-white">
            <p class="text-5xl lg:text-7xl font-bold">Esiest Way <br> To The Court</p>
            <p class="text-sm sm:text-sm lg:text-lg">Book sports courts effortlessly in one platform. <br>Find venues, check availability, and secure your game in minutes.</p>
            <Download />
        </div>
    </div>
    <div class="flex flex-col px-[40px] lg:px-[100px] mt-[50px] gap-10">
        <div class="flex flex-col items-start mt-5">
            <img src="/dashboard-mockup.png" alt="" class="w-50 mb-10 min-[1000px]:hidden">
            <div v-if="venueTab" class="flex items-center gap-3">
                <div class="flex flex-col items-start justify-start gap-3">
                    <div class="flex gap-2">
                        <button @click="changeToVenue" class="text-white bg-blue-900 px-6 py-2 border border-blue-100 text-blue-300 rounded-[10px] font-bold text-[12px]">VENUE OWNER</button>
                        <button @click="changeToPlayer" class="text-blue-900 border-blue-800 hover:bg-blue-100 px-6 py-2 border rounded-[10px] font-bold text-[12px]">PLAYER</button>
                    </div>
                    <h2 class="text-xl lg:text-2xl mt-3 font-bold">Manage your venue more practically and profitably.</h2>
                    <p class="text-sm lg:text-base  text-gray-600">It's time to make your venue more than just a venue. It all starts with simple, flexible, and profitable management through AYO Venue Management.</p>
                    <NuxtLink href="/venue/login" class="flex w-full gap-2 items-center justify-between lg:text-lg py-1 px-5 border border-blue-900 rounded-full text-blue-900 mt-5 hover:bg-blue-100">
                        Details Partnership <Icon icon="material-symbols-light:arrow-circle-right-outline" width="24" height="24" />
                    </NuxtLink>
                </div>
                <img src="/dashboard-mockup.png" alt="" class="h-[300px] ms-10 hidden min-[1000px]:flex">
            </div>
            <div v-if="playerTab" class="flex items-center gap-3">
                <div class="flex flex-col items-start justify-start gap-2">
                    <div class="flex gap-2">
                        <button @click="changeToVenue" class="text-blue-900 border-blue-800 hover:bg-blue-100 px-6 py-2 border rounded-[10px] font-bold text-[12px]">VENUE OWNER</button>
                        <button @click="changeToPlayer" class="text-white bg-blue-900 px-6 py-2 border border-blue-100 text-blue-300 rounded-[10px] font-bold text-[12px]">PLAYER</button>
                    </div>
                    <h2 class="text-xl lg:text-2xl mt-3 font-bold">Rent a field easily and quickly on your finger.</h2>
                    <p class="text-sm lg:text-base text-gray-600">Planning a workout this week but don't know where to play? Or don't have time to travel all the way to the venue just to book a field?</p>
                    <NuxtLink href="/court" class="flex w-full gap-2 items-center justify-between lg:text-lg py-1 px-5 border border-blue-900 rounded-full text-blue-900 mt-5 hover:bg-blue-100">
                        Find Venues <Icon icon="material-symbols-light:arrow-circle-right-outline" width="24" height="24" />
                    </NuxtLink>
                </div>
                <img src="/dashboard-mockup.png" alt="" class="h-[300px] ms-10 hidden min-[1000px]:flex">
            </div>
        </div>
        
        <div class="flex flex-col min-[1000px]:flex-row items-center gap-5 border-t pt-10 mt-5">
            <img src="/cup.png" alt="" class="w-[500px] rounded-[20px] ">
            <div class="flex flex-col gap-2 min-[1000px]:ms-10">
                <h1 class="text-xl lg:text-2xl font-bold">Join our competitive tournaments across multiple sports</h1>
                <p class="text-sm lg:text-base text-gray-600">Take part in a wide selection of competitions from Courtside and other competition operators. Experience the excitement of teaming up on the pitch with thousands of other amateur teams now!</p>
                <NuxtLink href="#" class="flex w-full gap-2 items-center justify-between lg:text-lg py-1 px-5 border border-blue-900 rounded-full text-blue-900 mt-5 hover:bg-blue-100">
                    Check Tournaments List<Icon icon="material-symbols-light:arrow-circle-right-outline" width="24" height="24" />
                </NuxtLink>
            </div>
        </div>

        <div class="flex flex-col md:flex-row items-center justify-center gap-5 border-t pt-10 mt-5">
            <img src="/sparring-mockup.png" alt="" class="w-[250px] lg:w-[370px] sm:mb-10">
            <div class="flex flex-col gap-2 text-start">
                <h1 class="text-xl lg:text-2xl font-bold">Find your sparring partner</h1>
                <p class="max-[1000px]:hidden text-sm lg:text-base text-gray-600">Now you don't have to worry about finding sparring partners. <br> Easily make new friends and opponents every week, only on the Courtside app!</p>
                <p class="min-[1000px]:hidden text-sm lg:text-base text-gray-600">Now you don't have to worry about finding sparring partners. Easily make new friends and opponents every week, only on the Courtside app!</p>
                
                <div class="flex flex-col gap-3 mt-7">
                    <div class="flex gap-2 items-center text-sm lg:text-base text-gray-600">
                        <Icon icon="material-symbols-light:check-circle" class="text-blue-800" width="34" height="34" /> 
                        <p>Over 100 players take part in sparring quests every week.</p>
                    </div>
                    <div class="flex gap-2 items-center text-sm lg:text-base text-gray-600">
                        <Icon icon="material-symbols-light:check-circle" class="text-blue-800" width="34" height="34" /> 
                        <p>Representing teams from every regions all over Indonesia.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>