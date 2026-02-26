<template>
    <div class="navbar fixed top-0 left-0 w-full z-50 bg-white flex items-center justify-between px-[50px] min-[1000px]:px-[100px] min-[1000px]:py-4 py-7 border-b">
        <!-- Logo -->
        <NuxtLink to="/" @click="closeMenu">
            <img src="/logo.png" class="w-[130px] md:w-[150px]">
        </NuxtLink>

        <!-- Desktop Menu -->
        <div class="hidden min-[1000px]:flex gap-10">
            <NuxtLink to="/court" :class="isCourtActive ? 'text-black' : 'text-gray-600'" class="font-inter font-medium text-sm hover:text-black transition-colors">Explore Venue</NuxtLink>
            <NuxtLink to="/community" :class="isCommunityActive ? 'text-black' : 'text-gray-600'" class="font-inter font-medium text-sm hover:text-black transition-colors">Sport Community</NuxtLink>
            <NuxtLink to="/sparring" :class="isSparringActive ? 'text-black' : 'text-gray-600'" class="font-inter font-medium text-sm hover:text-black transition-colors">Find Sparring</NuxtLink>
            <NuxtLink to="/cup" :class="isLeagueActive ? 'text-black' : 'text-gray-600'" class="font-inter font-medium text-sm hover:text-black transition-colors">Courtside Cup</NuxtLink>

            <NuxtLink v-if="authUser.user" to="/user/activity"
                :class="isActivityActive ? 'text-black' : 'text-gray-600'"
                class="font-inter font-medium text-sm hover:text-black transition-colors">
                My Activity
            </NuxtLink>
        </div>

        <!-- Desktop Auth -->
        <div class="hidden min-[1000px]:flex">
            <div v-if="!authUser.user && !authVenue.venue" class="flex gap-3 items-center">
                <NuxtLink to="/auth/login/user" class="text-gray-600 border-e pe-2 hover:text-black">Login</NuxtLink>
                <NuxtLink to="/auth/register/user" class="flex items-center gap-2 font-bold border border-blue-900 px-6 py-2 rounded-full text-blue-900 hover:bg-gray-100">
                    Register <Icon icon="mdi:account-arrow-right-outline" class="w-6 h-6" />
                </NuxtLink>
            </div>

            <div v-else class="flex gap-5 items-center">
                <NuxtLink href="/user/profile">
                    <img :src="authUser.user?.profile_image_url" class="w-12 h-12 rounded-full object-cover"/>
                </NuxtLink>
                <button @click="logout" class="flex text-gray-400 text-sm">
                    <Icon icon="majesticons:logout-line" width="20" height="20" />Logout
                </button>
            </div>
        </div>

        <!-- Burger Button -->
        <button class="min-[1000px]:hidden" @click="toggleMenu">
            <Icon :icon="mobileMenu ? 'mdi:close' : 'mdi:menu'" class="w-7 h-7"/>
        </button>
    </div>

    <!-- Overlay -->
    <div v-if="mobileMenu" class="fixed inset-0 bg-black/40 z-40" @click="closeMenu"></div>

    <!-- Drawer -->
    <div :class="[ 'fixed top-0 right-0 h-full w-[80%] max-w-[320px] bg-white z-50 shadow-xl transform transition-transform duration-300',
        mobileMenu ? 'translate-x-0' : 'translate-x-full']">

        <div class="flex flex-col p-10 gap-10">
            <div class="border-b pb-7">
                <div v-if="!authUser.user && !authVenue.venue" class="flex items-center justify-between gap-3 text-center">
                    <NuxtLink @click="closeMenu" to="/auth/login/user" class="text-gray-800 text-lg">Login</NuxtLink>
                    <NuxtLink @click="closeMenu" to="/auth/register/user" class="flex items-center justify-center gap-2 font-bold border border-blue-900 px-6 py-2 rounded-full text-blue-900 hover:bg-gray-100">Register</NuxtLink>
                </div>

                <div v-else class="flex flex-col gap-4">
                    <NuxtLink @click="closeMenu" to="/user/profile">Profile</NuxtLink>
                    <button @click="logout(); closeMenu()">Logout</button>
                </div>
            </div>
            
            <NuxtLink @click="closeMenu" to="/court">Explore Venue</NuxtLink>
            <NuxtLink @click="closeMenu" to="/community">Sport Community</NuxtLink>
            <NuxtLink @click="closeMenu" to="/sparring">Find Sparring</NuxtLink>
            <NuxtLink @click="closeMenu" to="/cup">Courtside Cup</NuxtLink>

            <NuxtLink v-if="authUser.user" @click="closeMenu" to="/user/activity">My Activity</NuxtLink>


        </div>
    </div>
    
    
</template>

<script setup>
    import { Icon } from '@iconify/vue'

    const authUser = useAuthUserStore()
    const authVenue = useAuthVenueStore()

    const mobileMenu = ref(false)
    const toggleMenu = () => mobileMenu.value = !mobileMenu.value
    const closeMenu = () => mobileMenu.value = false

    const logout = () => {
        authUser.logout()
        navigateTo('/')
    }
    const route = useRoute()
    const isCourtActive = computed(() =>
        route.path.startsWith('/court')
    )
    const isCommunityActive = computed(() =>
        route.path.startsWith('/community')
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