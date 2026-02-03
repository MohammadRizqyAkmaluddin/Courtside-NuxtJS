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
</script>

<template>
    <main class="flex min-h-screen">
        <div class="w-1/2 flex flex-col items-center justify-center gap-10">
            <div class="flex flex-col items-start">
                <NuxtLink href="/"><img src="/logo.png" class="w-[200px] mb-10"></NuxtLink>
                <slot />
            </div>
        </div>
        <div class="w-1/2 bg-[url('/court-hero.jpg')] bg-cover bg-center flex flex-col items-start p-20">
            <p class="font-raleway text-[#3C2E1D] text-3xl">EASIEST WAY<p class="font-koulen text-5xl font-bold">TO THE COURT</p></p>
        </div>
    </main>
</template>