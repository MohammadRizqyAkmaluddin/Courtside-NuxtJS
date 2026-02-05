<template>
    <div class="navbar fixed top-0 left-0 w-full z-50 bg-white flex items-center justify-between px-[100px] py-4 border-b">
        <NuxtLink to="/"><img src="/logo.png" alt="" class="w-[150px]"></NuxtLink>

        <div class="flex gap-10">
            <NuxtLink to="/court" :class="isCourtActive ? 'text-black' : 'text-gray-600'" class="font-inter font-medium text-sm hover:text-black transition-colors">Explore Venue</NuxtLink>
            <NuxtLink to="/sparring" :class="isSparringActive ? 'text-black' : 'text-gray-600'" class="font-inter font-medium text-sm hover:text-black transition-colors">Find Sparring</NuxtLink>
            <NuxtLink to="/cup" :class="isLeagueActive ? 'text-black' : 'text-gray-600'" class="font-inter font-medium text-sm hover:text-black transition-colors">Courtside Cup</NuxtLink>
            <NuxtLink to="/user/activity" :class="isActivityActive ? 'text-black' : 'text-gray-600'" class="font-inter font-medium text-sm hover:text-black transition-colors">My Activity</NuxtLink>
        </div>
        <div v-if="!authUser.user && !authVenue.venue">
            <div class="flex gap-3 items-center">
                <NuxtLink to="/auth/login/user" class="font-Inter font-normal text-gray-600 border-e pe-2 hover:text-black">Login</NuxtLink>
                <NuxtLink to="/auth/register/user" class="flex items-center gap-2 font-Inter font-bold border border-blue-900 px-6 py-2 rounded-full text-blue-900 hover:bg-gray-100">Register<Icon icon="mdi:account-arrow-right-outline" class="w-6 h-6" /></NuxtLink>
            </div>
        </div>
        <div v-else>
            <div class="flex gap-5 items-center justify-center">
                <NuxtLink href="/user/profile"><img :src="authUser.user?.profile_image_url" class="w-12 h-12 rounded-full object-cover"/></NuxtLink>
                <button @click="logout" class="flex font-inter text-gray-300 hover:text-gray-400 text-sm"><Icon icon="majesticons:logout-line" width="20" height="20" />Logout</button>
            </div>
        </div>
    </div>
    
    
</template>

<script setup>
    import { Icon } from '@iconify/vue'

    const authUser = useAuthUserStore()
    const authVenue = useAuthVenueStore()

    const logout = () => {
        authUser.logout()
        navigateTo('/')
    }
    const route = useRoute()
    const isCourtActive = computed(() =>
        route.path.startsWith('/court')
    )
    const isSparringActive = computed(() =>
        route.path.startsWith('/sparring')
    )
    const isLeagueActive = computed(() =>
        route.path.startsWith('/cup')
    )
    const isActivityActive = computed(() =>
        route.path.startsWith('/user/activity')
    )
</script>