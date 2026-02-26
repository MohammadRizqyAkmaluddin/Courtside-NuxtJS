<script setup lang="ts">
import { Icon } from '@iconify/vue';

const props = defineProps<{
    size?: number | string 
    color?: string
}>()

const router = useRouter()
const backButton = () => {
    router.back()
}
</script>

<template>
    <NuxtLink to="/">Home</NuxtLink>
    <Icon icon="mingcute:right-fill" :width="size ?? 15" :height="size ?? 15" :color="color"/>
    <button @click="backButton">{{ custom }}</button>
    <Icon icon="mingcute:right-fill" :width="size ?? 15" :height="size ?? 15" :color="color" />
    <NuxtLink to="#">{{ custom }}</NuxtLink>
</template>