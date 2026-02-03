<script setup lang="ts">
    definePageMeta({
        layout: 'master'
    })

    const tabs = ['VENUE OWNER', 'PLAYER']
    const activeTab = ref('VENUE OWNER')

    import { Icon } from '@iconify/vue'
</script>

<template>
    <div class="flex justify-between ps-[100px] h-[700px] bg-[url('/main-hero2.jpg')] bg-cover bg-center">
        <div class="flex flex-col mt-[150px] gap-3 font-inter text-white">
            <p class="text-7xl font-bold">Esiest Way <br> To The Court</p>
            <p class="text-lg">Book sports courts effortlessly in one platform. <br>Find venues, check availability, and secure your game in minutes.</p>
            <Download />
        </div>
    </div>
    <div class="flex flex-col px-[100px] mt-[50px] gap-10">
        <div class="flex flex-col mt-10 gap-5">
            <div class="flex gap-2">
                <button v-for="tab in tabs"
                        :key="tab"
                        @click="activeTab = tab"
                        :class="[
                            'px-6 py-2 border border-blue-100 text-blue-300 rounded-[10px] font-inter font-bold text-[12px]',
                            activeTab === tab
                            ? 'text-white bg-blue-900'
                            : 'text-blue-900 border-blue-800 hover:bg-blue-100'
                        ]">
                        {{ tab }}    
                </button>
            </div>
            <div v-if="activeTab === 'VENUE OWNER'" class="flex gap-3">
                <div class="flex flex-col gap-3">
                    <h2 class="font-inter text-3xl mt-3 font-bold">Manage your venue <br> more practically and profitably.</h2>
                    <p class="text-lg font-inter text-gray-600">It's time to make your venue more than just a venue. It all starts with simple, flexible, and profitable management through AYO Venue Management.</p>
                    <NuxtLink href="#" class="flex gap-2 items-center justify-between font-inter text-lg py-1 px-5 border border-blue-900 rounded-full text-blue-900 mt-5 hover:bg-blue-100">
                        Details Partnership <Icon icon="material-symbols-light:arrow-circle-right-outline" width="24" height="24" />
                    </NuxtLink>
                </div>
                <img src="/dashboard-mockup.png" alt="" class="h-[300px] ms-10">
            </div>
            <div v-if="activeTab === 'PLAYER'" class="flex gap-3">
                <div class="flex flex-col gap-2">
                    <h2 class="font-inter text-3xl mt-3 font-bold">Rent a field easily and quickly <br> on your finger.</h2>
                    <p class="text-lg font-inter text-gray-600">Planning a workout this week but don't know where to play? Or don't have time to travel all the way to the venue just to book a field?</p>
                    <NuxtLink href="/court" class="flex gap-2 items-center justify-between font-inter text-lg py-1 px-5 border border-blue-900 rounded-full text-blue-900 mt-5 hover:bg-blue-100">
                        Find Venues <Icon icon="material-symbols-light:arrow-circle-right-outline" width="24" height="24" />
                    </NuxtLink>
                </div>
                <img src="/dashboard-mockup.png" alt="" class="h-[300px] ms-10">
            </div>
        </div>
        
        <div class="flex font-inter items-start gap-5 border-t pt-20 mt-10">
            <div class="flex gap-2">
                <img src="/cup.png" alt="" class="h-[300px] rounded-[20px]">
            </div>
            <div class="flex flex-col gap-2 ms-10">
                <h1 class="text-3xl font-bold">Join our competitive tournaments <br> across multiple sports</h1>
                <p class="text-lg font-inter text-gray-600">Take part in a wide selection of competitions from Courtside and other competition operators. <br> Experience the excitement of teaming up on the pitch with thousands of other amateur teams now!</p>
                <NuxtLink href="#" class="flex gap-2 items-center justify-between font-inter text-lg py-1 px-5 border border-blue-900 rounded-full text-blue-900 mt-5 hover:bg-blue-100">
                    Check Tournaments List<Icon icon="material-symbols-light:arrow-circle-right-outline" width="24" height="24" />
                </NuxtLink>
            </div>
        </div>

        <div class="flex font-inter items-center justify-center gap-5 border-t pt-20 mt-10">
            <div class="flex gap-2">
                <img src="/sparring-mockup.png" alt="" class="h-[500px]">
            </div>
            <div class="flex flex-col gap-2 text-start">
                <h1 class="text-3xl font-bold">Find your sparring partner</h1>
                <p class="text-lg font-inter text-gray-600">Now you don't have to worry about finding sparring partners. <br> Easily make new friends and opponents every week, only on the Courtside app!</p>
                
                <div class="flex flex-col gap-3 mt-7">
                    <p class="flex gap-2 items-center text-lg font-inter text-gray-600"><Icon icon="material-symbols-light:check-circle" class="text-blue-800" width="34" height="34" /> Over 100 players take part in sparring quests every week.</p>
                    <p class="flex gap-2 items-center text-lg font-inter text-gray-600"><Icon icon="material-symbols-light:check-circle" class="text-blue-800" width="34" height="34" /> Covering teams from all regions in Indonesia.</p>
                </div>
            </div>
        </div>
    </div>
    
    

</template>