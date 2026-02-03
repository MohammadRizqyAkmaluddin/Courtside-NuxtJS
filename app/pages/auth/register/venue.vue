<script setup lang="ts">
definePageMeta({
  layout: 'master'
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
    <h1 class="text-2xl font-bold mb-4">Register User</h1>

    <form @submit.prevent="submit" class="space-y-3">
      <input v-model="form.name" placeholder="Nama" class="input" />
      <input v-model="form.email" placeholder="Email" class="input" />
      <input v-model="form.phone" placeholder="Phone" class="input" />
      <input v-model="form.password" type="password" placeholder="Password" class="input" />

      <button class="btn-primary w-full" :disabled="loading">
        {{ loading ? 'Loading...' : 'Register' }}
      </button>

      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
    </form>

    <p class="mt-4 text-sm">
      Sudah punya akun?
      <NuxtLink to="/auth/login/user" class="text-blue-600">Login</NuxtLink>
    </p>
  </div>
</template>
