<script setup>
    definePageMeta({
        middleware: 'user-auth',
        layout: 'master'
    })
    const auth = useAuthUserStore()
</script>

<template>
  <h1 class="text-red-500">User Home</h1>
  <p>Welcome, {{ auth.user?.name }}</p>
</template>



