<script setup lang="ts">
definePageMeta ({
    layout: 'master'
})

import { ref, onMounted } from 'vue'
import type { User } from '~/types'
import { api } from '~/services/api'

const loading = ref(false)
const user = ref<User | null>(null) 

const fetchUser = async () => {
    loading.value = true

    try {
        user.value = await api ('/profile')
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}
onMounted(fetchUser)
</script>

<template>
    

</template>