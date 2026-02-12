<script setup lang="ts">
import { useAuthUserStore } from '@/stores/auth-user'

const auth = useAuthUserStore()

if (import.meta.client) {
  auth.loadFromStorage()
  auth.fetchUser()
}
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>