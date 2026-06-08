<script setup lang="ts">
useHead({
    title: 'Courtside',
    link: [
        { rel: 'icon', type: 'image/png', sizes: '180x180', href: '/logo2.png'}
    ],
    meta: [
        { name: 'description', content: 'Booking lapangan online CourtHub' }
    ]
})

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { api } from '~/services/api'
import type { City } from '~/types'

const authVenue = useAuthVenueStore()

const cities = ref<City[]>([])
const loading = ref(false)
const showRegister = ref(false)
const showLogin = ref(true)

const openRegister = () => {
    showRegister.value = true
    showLogin.value = false
}
const openLogin = () => {
    showRegister.value = false
    showLogin.value = true
}

const loginForm = reactive({
    email: '',
    password: ''
})

const submitLogin = async () => {
    await authVenue.login(loginForm)
    await navigateTo('/venue/finance', { replace: true })
}

const registerForm = reactive({
    name: '',
    email: '',
    phone: '',
    password: '',
    city_id: 0,
    address: '',
})

const submitRegister = async () => {
    loading.value = true
    try {
        await authVenue.register(registerForm)
    } catch (e) {
        console.error(e)
    } finally {
        navigateTo('/venue/main')
        loading.value = false
    }
}

const fetchCities = async () => {
    loading.value = true
    try {
        cities.value = await api('/cities')
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}
onMounted(fetchCities)

</script>

<template>
    <div class="min-h-screen flex justify-center font-inter min-[600px]:hidden">
        <div class="w-full mx-[20px] mt-[120px] flex flex-col justify-between py-5">
            <div class="flex flex-col gap-5">
                <img src="/logo-cms.png" class="w-[150px]">
                <form v-if="showLogin" @submit.prevent="submitLogin">
                    <h1 class="text-gray-600 text-[12px] mb-3">Login to your venue management account</h1>
                    <div class="flex flex-col gap-2 font-inter">
                        <div class="flex flex-col gap-3 text-[12px]">
                            <input v-model="loginForm.email" type="text" name="email" placeholder="Email" class="border w-full px-5 py-3 rounded-[10px] focus:outline-none">
                            <input v-model="loginForm.password" type="password" name="password" placeholder="Password" class="border w-full rounded-[10px] px-5 py-3 focus:outline-none">
                        </div>
                        <NuxtLink class="cursor-pointer text-[11px] text-blue-900 font-bold">Forgot your password?</NuxtLink>
                        <button type="submit" :disabled="loginForm.email === '' || loginForm.password === ''" class="bg-blue-900 text-white py-2 text-sm font-bold rounded-md mt-2 disabled:bg-gray-200">
                            Login
                        </button>
                        <div class="flex gap-2 text-[12px] mt-2">
                            <p class="text-gray-600">Dont have an account?</p>
                            <button type="button" @click="openRegister" class="text-blue-900 font-bold hover:underline">Join Now</button>
                        </div>
                    </div>
                </form>
                <form v-else-if="showRegister" @submit.prevent="submitRegister">
                    <h1 class="text-gray-600 text-[12px] mb-3">Create new account to register your venue</h1>
                    <div class="flex flex-col gap-2 font-inter">
                        <div class="flex flex-col gap-3 text-[12px]">
                            <input v-model="registerForm.name" type="text" name="name" placeholder="Venue name" class="border w-full px-5 py-3 rounded-[10px] focus:outline-none">
                            <input v-model="registerForm.phone" type="text" name="phone" placeholder="Phone" class="border w-full px-5 py-3 rounded-[10px] focus:outline-none">
                            <select v-model="registerForm.city_id" name="city_id" class="border py-3 px-5 rounded-[10px] text-gray-400 appearance-none px-5 focus:outline-none">
                                <option value="" class="">Select Region</option>
                                <option v-for="city in cities" :value="city.id">
                                    {{ city.city }}
                                </option>
                            </select>
                            <input v-model="registerForm.address" type="text" name="address" placeholder="Address" class="border w-full px-5 py-3 h-[1 rounded-[10px] focus:outline-none">
                            <div class="flex gap-2">
                                <input v-model="registerForm.email" type="text" name="email" placeholder="Email" class="border w-full px-5 py-3 rounded-[10px] focus:outline-none">
                                <input v-model="registerForm.password" type="password" name="password" placeholder="Password" class="border w-full rounded-[10px] px-5 py-3 focus:outline-none">
                            </div>
                        </div>
                        <p class="text-[10px] mt-3">By clicking Agree & Join, you agree to the Courtside User Agreement, and Privacy Policy.</p>
                        <button type="submit" :disabled="loginForm.email === '' || loginForm.password === ''" class="bg-blue-900 text-white py-2 text-sm font-bold rounded-md mt-2 disabled:bg-gray-200">
                            Register
                        </button>
                        <div class="flex gap-2 text-[12px] mt-2">
                            <p class="text-gray-600">Already have an account?</p>
                            <button type="button" @click="openLogin" class="text-blue-900 font-bold hover:underline">Login</button>
                        </div>
                    </div>
                </form>
            </div>
            <p class="text-gray-300 text-[10px] text-center">© 2026 Courthub Sports Center All Right Reserved</p>
        </div>
    </div>

    <div class="min-h-screen flex justify-center font-inter max-[600px]:hidden">
        <div class="w-full flex gap-10 p-10">
            <div class="w-[40%] flex flex-col justify-center gap-5 px-0 lg:px-10">
                <div class="flex flex-col gap-3">
                    <img src="/logo-cms.png" class="w-[250px] mb-5">
                </div>
                <form v-if="showLogin" @submit.prevent="submitLogin">
                    <h1 class="text-gray-600 text-sm mb-4">Login to your venue management account</h1>
                    <div class="flex flex-col gap-2 font-inter">
                        <div class="flex flex-col gap-3 text-sm">
                            <input v-model="loginForm.email" type="text" name="email" placeholder="Email" class="border w-full px-5 py-3 rounded-[10px] focus:outline-none">
                            <input v-model="loginForm.password" type="password" name="password" placeholder="Password" class="border w-full rounded-[10px] px-5 py-3 focus:outline-none">
                        </div>
                        <NuxtLink href="#" class="text-[12px] text-blue-900 font-bold">Forgot your password?</NuxtLink>
                        <button type="submit" :disabled="loginForm.email === '' || loginForm.password === ''" class="bg-blue-900 text-white py-2 text-sm font-bold rounded-md mt-2 disabled:bg-gray-200">
                            Login
                        </button>
                        <div class="flex gap-2 text-sm mt-2">
                            <p class="text-gray-600">Dont have an account?</p>
                            <button type="button" @click="openRegister" class="text-blue-900 font-bold hover:underline">Join Now</button>
                        </div>
                    </div>
                </form>
                <form v-else-if="showRegister" @submit.prevent="submitRegister">
                    <h1 class="text-gray-600 text-sm mb-4">Create new account to register your venue</h1>
                    <div class="flex flex-col gap-2 font-inter">
                        <div class="flex flex-col gap-3 text-[12px]">
                            <input v-model="registerForm.name" type="text" name="name" placeholder="Venue name" class="border w-full px-5 py-3 rounded-[10px] focus:outline-none">
                            <input v-model="registerForm.phone" type="text" name="phone" placeholder="Phone" class="border w-full px-5 py-3 rounded-[10px] focus:outline-none">
                            <select v-model="registerForm.city_id" name="city_id" class="border py-3 px-5 rounded-[10px] text-gray-400 appearance-none px-5 focus:outline-none">
                                <option value="" class="">Select Region</option>
                                <option v-for="city in cities" :value="city.id">
                                    {{ city.city }}
                                </option>
                            </select>
                            <input v-model="registerForm.address" type="text" name="address" placeholder="Address" class="border w-full px-5 py-3 h-[1 rounded-[10px] focus:outline-none">
                            <div class="flex gap-2">
                                <input v-model="registerForm.email" type="text" name="email" placeholder="Email" class="border w-full px-5 py-3 rounded-[10px] focus:outline-none">
                                <input v-model="registerForm.password" type="password" name="password" placeholder="Password" class="border w-full rounded-[10px] px-5 py-3 focus:outline-none">
                            </div>
                        </div>
                        <p class="text-[12px] mt-5 text-gray-500">By clicking Agree & Join, you agree to the Courtside User Agreement, and Privacy Policy.</p>
                        <button type="submit" :disabled="loginForm.email === '' || loginForm.password === ''" class="bg-blue-900 text-white py-2 text-sm font-bold rounded-md mt-2 disabled:bg-gray-200">
                            Register
                        </button>
                        <div class="flex gap-2 text-sm mt-2">
                            <p class="text-gray-600">Already have an account?</p>
                            <button type="button" @click="openLogin" class="text-blue-900 font-bold hover:underline">Login</button>
                        </div>
                    </div>
                </form>
            </div>
            <div class="w-[60%] bg-[url('/login-venue.jpg')] bg-cover bg-center rounded-xl flex flex-col items-start justify-between p-10">
                <img src="/logo3.png" class="w-[120px]">
                <div class="flex flex-col text-white items-start mb-20 opacity-70">
                    <h1 class="font-bold text-5xl text-start">Your Venue <br> Management <br> Solution</h1>
                    <p class="mt-5 text-lg">All-in-one platform to handle <br> bookings, schedules, and venue operations</p>
                </div>
                <p class="text-gray-300 text-[10px] lg:text-sm">© 2026 Courthub Sports Center All Right Reserved</p>
            </div>
        </div>
    </div>
</template>