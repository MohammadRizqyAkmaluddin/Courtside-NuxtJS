<script setup lang="ts">
    definePageMeta({
        layout: 'auth'
    })

const auth = useAuthUserStore()

const form = reactive({
  email: '',
  password: '',
  remember: false
})

const error = ref('')
const loading = ref(false)

const submit = async () => {
  loading.value = true
  error.value = ''

  try {
    await auth.login(form)
    await navigateTo('/')
  } catch (e) {
    console.error(e)
    error.value = 'Terjadi kesalahan saat login'
  }
}
</script>

<template>

  <form @submit.prevent="submit">
    <div class="flex flex-col gap-6 font-inter">
      <div class="flex flex-col">
        <div class="mb-5">
          <h2 class="font-bold text-2xl">Login</h2>
          <p class="text-gray-500">Welcome back! Let’s get you back in the game</p>
        </div>
        <div class="flex flex-col">
          <label for="email" class="mb-1 text-gray-700 text-sm">Email</label>
          <input v-model="form.email" type="text" name="email" placeholder="Email" class="border w-[400px] px-2 py-2 rounded-[10px] focus:outline-none">
        </div>
        <div class="flex flex-col mt-2">
          <label for="email" class="mb-1 text-gray-700 text-sm">Password</label>
          <input v-model="form.password" type="password" name="password" placeholder="Password" class="border w-[400px] rounded-[10px] px-2 py-2 focus:outline-none">
        </div>
      </div>
      <div class="flex justify-between text-sm font-inter">
        <div class="flex gap-2">
          <input type="checkbox" class="accent-blue-800">
          <h3>Remember me</h3>
        </div>
        <div class="flex">
          <NuxtLink href="#">Forgot password?</NuxtLink>
        </div>
      </div>
      <button class="bg-blue-900 text-white py-2 text-md font-medium rounded-[10px]">Login</button>
      <div class="flex gap-2 text-sm">
        <p>New to Courtside?</p>
        <NuxtLink href="/auth/register/user" class="text-blue-900 font-black hover:underline">Join Now</NuxtLink>
      </div>
      <div class="flex items-center w-[400px]">
        <div class="flex-1 border-t border-gray-300"></div>
        <span class="px-3 text-sm text-gray-500">or</span>
        <div class="flex-1 border-t border-gray-300"></div>
      </div>
      <button type="button" class="flex items-center justify-center gap-3 border text-sm rounded-full py-2 hover:bg-gray-100"><img src="/google.png" class="w-[25px]"> Login with Google</button>
    </div>

    <p v-if="error">{{ error }}</p>
  </form>

</template>
