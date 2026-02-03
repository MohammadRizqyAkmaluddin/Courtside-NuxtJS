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
    <div class="min-h-screen flex flex-col">
    <Navbar></Navbar>

    <main class="flex-1 mt-10">
        <slot />
    </main>

    <Footer></Footer>
    </div>
</template>
