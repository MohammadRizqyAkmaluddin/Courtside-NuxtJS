<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { api } from '~/services/api'

const authUser = useAuthUserStore()

const showDropdown = ref(false)
const showLogin = ref(false)
const showRegister = ref(false)
const error = ref('')
const holding = ref<any|null>(null)

const openRegister = () => {
    showRegister.value  = true
    showLogin.value = false
    mobileMenu.value = false
}
const closeRegister = () => {
    showRegister.value = false
}

const openLogin = () => {
    showLogin.value = true
    showRegister.value  = false
    mobileMenu.value = false
}
const closeLogin = () => {
    showLogin.value = false
}

const loginForm = reactive({
    email: '',
    password: ''
})

const submitLogin = async () => {
    try {
        await authUser.login(loginForm)
    } catch (e) {
        console.error(e)
    } finally {
        showLogin.value = false
    }
}

const registerForm = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
})

const submitRegister = async () => {
  error.value = ''

  try {
    await authUser.register(registerForm)
  } catch (e) {
    console.error(e)
    error.value = 'Gagal register user'
  } finally {
    showRegister.value = false
  }
}

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

const openDropdown = () => {
  showDropdown.value = !showDropdown.value
}
const closeDropdown = () => {
  showDropdown.value = false
}
const handleClickOutside = (e: any) => {
  if (!e.target.closest('.relative')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const level = ref<any | null>(null)

const fetchLevel = async () => {
    try {
        const res: any = await api('/my-activity/level')
        level.value = res.data
    } catch (e) {
        console.error(e)
    }
}

const fetchHolding = async () => {
  try {
    holding.value = await api('/my-activity/booking-holds')
  } catch (e) {
    console.error(e)
  }
}

onMounted(fetchLevel)
onMounted(fetchHolding)
</script>

<template>
    <div class="font-inter navbar fixed top-0 left-0 w-full z-20 bg-white flex items-center justify-between px-[20px] min-[1000px]:px-[100px] min-[1000px]:py-2 py-3 border-b">
        <!-- Logo -->
        <NuxtLink to="/" @click="closeMenu">
            <img src="/logo.png" class="w-[100px] md:w-[150px]">
        </NuxtLink>

        <!-- Desktop Menu -->
        <div class="hidden min-[1000px]:flex gap-10">
            <NuxtLink to="/court" :class="isCourtActive ? 'text-black' : 'text-gray-600'" class="font-inter font-medium text-sm hover:text-black transition-colors">Explore Venue</NuxtLink>
            <NuxtLink to="/community" :class="isCommunityActive ? 'text-black' : 'text-gray-600'" class="font-inter font-medium text-sm hover:text-black transition-colors">Sport Community</NuxtLink>
            <NuxtLink to="/sparring" :class="isSparringActive ? 'text-black' : 'text-gray-600'" class="font-inter font-medium text-sm hover:text-black transition-colors">Find Sparring</NuxtLink>
            <NuxtLink to="/cup" :class="isLeagueActive ? 'text-black' : 'text-gray-600'" class="font-inter font-medium text-sm hover:text-black transition-colors">Courtside Cup</NuxtLink>
            <NuxtLink v-if="!authUser.user" to="/venue/login" target="_blank" class="font-inter font-medium text-sm text-gray-600 hover:text-black transition-colors">Venue Management App</NuxtLink>
            <NuxtLink v-if="authUser.user" to="/user/activity"
                :class="isActivityActive ? 'text-black' : 'text-gray-600'"
                class="font-inter flex font-medium text-sm hover:text-black transition-colors">
                <div class="flex items-start">
                    <p>My Activity</p>
                </div>
            </NuxtLink>
        </div>

        <!-- Desktop Auth -->
        <div class="hidden min-[1000px]:flex">
            <div v-if="!authUser.user" class="flex gap-3 items-center">
                <button @click="openLogin" class="text-gray-600 border-e pe-2 hover:text-black">Login</button>
                <button @click="openRegister" class="flex items-center gap-2 font-bold border border-blue-900 px-6 py-2 rounded-full text-blue-900 hover:bg-gray-100">
                    Register <Icon icon="mdi:account-arrow-right-outline" class="w-6 h-6" />
                </button>
            </div>
            <div v-else class="flex gap-5 items-center">
                <NuxtLink to="/user/profile"><img :src="authUser.user?.profile_image_url" class="w-12 h-12 rounded-full object-cover border border-gray-300"/></NuxtLink>
                <button @click="logout" class="flex items-center text-sm gap-1 font-bold border border-blue-900 px-4 py-2 rounded-full text-blue-900 hover:bg-gray-100">
                    <Icon icon="majesticons:logout-line" width="17" height="17" />Logout
                </button>
            </div>
        </div>

        <!-- Burger Button -->
        <button class="min-[1000px]:hidden" @click="toggleMenu">
            <Icon :icon="mobileMenu ? 'mdi:close' : 'mdi:menu'" class="w-5 h-5"/>
        </button>
    </div>

    <!-- Overlay -->
    <div v-if="mobileMenu" class="fixed inset-0 bg-black/60 z-50" @click="closeMenu"></div>

    <!-- Drawer -->
    <div :class="[ 'fixed top-0 right-0 h-full w-[70%] max-w-[320px] bg-white z-50 shadow-xl transform transition-transform duration-300',
        mobileMenu ? 'translate-x-0' : 'translate-x-full']">

        <div class="flex flex-col justify-between min-h-full">
            <div class="flex flex-col gap-1">
                <div v-if="authUser.user" class="flex gap-5 ps-5 pt-10 items-center justify-start border-b pb-10">
                    <NuxtLink to="/user/profile" class="flex flex-col gap-5 items-start">
                        <img :src="authUser.user?.profile_image_url" class="w-12 h-12 rounded-full object-cover border border-gray-300"/>
                        <div class="flex flex-col">
                            <p class="text-sm font-semibold">{{ authUser.user.name }}</p>
                            <p class="text-[12px]">{{ authUser.user.email }}</p>
                        </div>
                    </NuxtLink>
                </div>                
                <div class="flex flex-col text-sm text-gray-800 me-5 mt-5">
                    <NuxtLink @click="closeMenu" to="/court" :class="isCourtActive ? 'bg-blue-900 text-white rounded-tr-md rounded-br-md' : 'text-blue-900'" class="p-4 px-5 flex items-center gap-2">
                        Explore Venue
                    </NuxtLink>
                    <NuxtLink @click="closeMenu" to="/community" :class="isCommunityActive ? 'bg-blue-900 text-white rounded-tr-md rounded-br-md' : 'text-blue-900'" class="p-4 px-5 flex items-center gap-2">
                        Sport Community
                    </NuxtLink>
                    <NuxtLink @click="closeMenu" to="/sparring" :class="isSparringActive ? 'bg-blue-900 text-white rounded-tr-md rounded-br-md' : 'text-blue-900'" class="p-4 px-5 flex items-center gap-2">
                        Find Sparring
                    </NuxtLink>
                    <NuxtLink @click="closeMenu" to="/cup" :class="isLeagueActive ? 'bg-blue-900 text-white rounded-tr-md rounded-br-md' : 'text-blue-900'" class="p-4 px-5 flex items-center gap-2">
                        Courtside Cup
                    </NuxtLink>
                    <NuxtLink v-if="!authUser.user" @click="closeMenu" to="/venue/login" target="_blank" class="border-t p-4 px-5 flex items-center gap-2">
                        Venue Management App
                    </NuxtLink>
                    <NuxtLink v-if="authUser.user" @click="closeMenu" to="/user/activity" :class="isActivityActive ? 'bg-blue-900 text-white rounded-tr-md rounded-br-md' : 'text-blue-900'" class="p-4 px-5 flex items-center gap-2">
                        My Activity
                    </NuxtLink>
                </div>
            </div>
            <button v-if="authUser.user" @click="logout" class="text-sm flex items-center justify-center gap-1 mb-5 font-bold border border-blue-900 px-4 py-1 mx-5 rounded-full text-blue-900 hover:bg-gray-100">
                <Icon icon="majesticons:logout-line" width="15" height="15" />Logout
            </button>
            <div v-else-if="!authUser.user" class="flex flex-col items-center justify-between gap-2 text-center p-5">
                <button @click="openLogin" class="border border-blue-900 w-full p-2 rounded-full font-semibold text-blue-900 text-sm">Login</button>
                <div class="border-b w-[90%] border-gray-300"></div>
                <button @click="openRegister" to="/auth/register/user" class="flex w-full items-center justify-center gap-2 font-semibold border border-blue-900 text-sm py-2 rounded-full text-blue-900 hover:bg-gray-100">Register</button>
            </div>
        </div>
    </div>     
    <div v-if="showLogin" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center font-inter">
        <div class="bg-white w-[350px] rounded-lg p-10 relative">
            <div class="flex justify-between items-start">
                <img src="/logo.png" class="w-[130px] md:w-[150px] mb-5">
                <button @click="closeLogin">
                    <Icon icon="ic:baseline-close" width="20" height="20" />
                </button>
            </div>
            <form @submit.prevent="submitLogin">
                <div class="flex flex-col gap-4 font-inter">
                    <div class="flex flex-col items-end">
                        <p class="text-gray-500 text-sm mb-5">Welcome back! Let’s get you back in the game</p>
                        <div class="w-full flex flex-col gap-2 text-[12px]">
                            <input v-model="loginForm.email" type="text" name="email" placeholder="Email" class="border w-full px-5 py-2 rounded-[10px] focus:outline-none">
                            <input v-model="loginForm.password" type="password" name="password" placeholder="Password" class="border w-full rounded-[10px] px-5 py-2 focus:outline-none">
                        </div>
                        <NuxtLink href="#" class="text-[12px] text-blue-900 font-bold mt-2">Forgot your password?</NuxtLink>
                    </div>
                    <button type="submit" class="bg-blue-900 text-white py-2 text-md font-bold rounded-[10px]">Login</button>
                    <div class="flex gap-2 text-[12px]">
                        <p>New to Courtside?</p>
                        <button type="button" @click="openRegister" class="text-blue-900 font-black hover:underline">Join Now</button>
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
    <div v-if="showRegister" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center font-inter">
        <div class="bg-white w-[350px] rounded-lg p-10 relative">
            <div class="flex justify-between items-start">
                <img src="/logo.png" class="w-[130px] md:w-[150px] mb-5">
                <button @click="closeRegister">
                    <Icon icon="ic:baseline-close" width="20" height="20" />
                </button>
            </div>
            <form @submit.prevent="submitRegister" >
                <div class="flex flex-col gap-4 font-inter">
                    <div class="flex flex-col">
                        <p class="text-gray-500 text-sm mb-5">Join Courtside and enjoy effortless court access</p>
                        <div class="flex flex-col gap-2 text-[12px]">
                            <input v-model="registerForm.name" type="text" name="email" placeholder="Name" class="border w-full px-5 py-2 rounded-[10px] focus:outline-none">
                            <input v-model="registerForm.phone" type="text" name="email" placeholder="Phone" class="border w-full px-5 py-2 rounded-[10px] focus:outline-none">
                           <div class="flex gap-2">
                            <input v-model="registerForm.email" type="text" name="email" placeholder="Email" class="border w-full px-5 py-2 rounded-[10px] focus:outline-none">
                            <input v-model="registerForm.password" type="password" name="password" placeholder="Password" class="border w-full rounded-[10px] px-5 py-2 focus:outline-none">
                            </div>
                        </div>
                        <p class="text-[10px] mt-3">By clicking Agree & Join, you agree to the Courtside User Agreement, and Privacy Policy.</p>
                    </div>
                    <button class="bg-blue-900 text-white py-2 text-md font-medium rounded-[10px]">Register</button>
                    <div class="flex gap-2 text-[12px]">
                        <p>Already have an account?</p>
                        <button @click="openLogin" class="text-blue-900 font-black hover:underline">Login</button>
                    </div>
                    <div class="flex items-center w-full">
                        <div class="flex-1 border-t border-gray-300"></div>
                        <span class="px-3 text-sm text-gray-500">or</span>
                        <div class="flex-1 border-t border-gray-300"></div>
                    </div>
                    <button type="button" class="flex items-center justify-center gap-3 border text-sm rounded-full py-2 hover:bg-gray-100"><img src="/google.png" class="w-[25px]"> Join with Google</button>
                </div>
            </form>
        </div>
    </div>
    
</template>
