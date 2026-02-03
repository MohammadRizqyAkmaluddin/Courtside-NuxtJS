<script setup lang="ts">
definePageMeta({
  layout: 'master'
})
const auth = useAuthVenueStore()

const form = reactive({
  email: '',
  password: '',
})

const submit = async () => {
  try {
    await auth.login(form)
    await navigateTo('/')
  } catch {
    alert('Login venue gagal')
  }
}
</script>

<template>
  <div>
    <h1>Venue Login</h1>

    <form @submit.prevent="submit">
      <div class="gap-3">
        <input v-model="form.email" placeholder="Email" class="border me-2"/>
        <input v-model="form.password" type="password" placeholder="Password" class="border me-2"/>

        <button class="bg-blue-300 px-5 py-1 rounded-full">login</button>
      </div>
    </form>
  </div>
</template>
