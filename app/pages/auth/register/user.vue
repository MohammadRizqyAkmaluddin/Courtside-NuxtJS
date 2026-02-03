<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const auth = useAuthUserStore()

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
})

const loading = ref(false)
const error = ref('')

const submit = async () => {
  loading.value = true
  error.value = ''

  try {
    await auth.register(form)
    await navigateTo('/')
  } catch (e) {
    console.error(e)
    error.value = 'Gagal register user'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <form @submit.prevent="submit" class="space-y-3">
      <div class="flex flex-col gap-6">
        <div class="flex flex-col">
          <div class="font-inter mb-5">
            <h2 class="font-inter font-bold text-2xl">Register</h2>
            <p class="text-gray-500">Join CourtSide and enjoy effortless court access.</p>
          </div>
          <div class="flex flex-col">
            <label for="email" class="font-inter mb-1 text-gray-700 text-sm">Name</label>
            <input v-model="form.name" type="text" name="name" placeholder="Name" class="border w-[400px] px-2 py-2 rounded-[10px] focus:outline-none">
          </div>
          <div class="flex flex-col mt-2">
            <label for="email" class="font-inter mb-1 text-gray-700 text-sm">Phone</label>
            <input v-model="form.phone" type="text" name="phone" placeholder="Phone" class="border w-[400px] px-2 py-2 rounded-[10px] focus:outline-none">
          </div>
          <div class="flex flex-col mt-2">
            <label for="email" class="font-inter mb-1 text-gray-700 text-sm">Email</label>
            <input v-model="form.email" type="text" name="email" placeholder="Email" class="border w-[400px] px-2 py-2 rounded-[10px] focus:outline-none">
          </div>
          <div class="flex flex-col mt-2">
            <label for="email" class="font-inter mb-1 text-gray-700 text-sm">Password</label>
            <input v-model="form.password" type="password" name="password" placeholder="Password" class="border w-[400px] rounded-[10px] px-2 py-2 focus:outline-none">
          </div>
        </div>
        <h3 class="font-inter text-[10px] w-[400px]">By clicking Agree & Join, you agree to the Courtside User Agreement, Privacy Policy, and Cookie Policy.</h3>
        <button class="bg-blue-900 text-white py-2 text-md font-medium rounded-[10px]" :disabled="loading">Agree & Join</button>
        <div class="flex gap-2 font-inter text-sm">
          <p>Already have an account?</p>
          <NuxtLink href="/auth/login/user" class="text-blue-900 font-black hover:underline">Login</NuxtLink>
        </div>
      </div>

      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
    </form>
  </div>
</template>
