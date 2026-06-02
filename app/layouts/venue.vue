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

<style>
input[type="date"]::-webkit-calendar-picker-indicator {
position: absolute;
inset: 0;
width: 100%;
height: 100%;
opacity: 0;
cursor: pointer;
}
</style>
<template>

    <div class="h-screen bg-[#F2F5F9] overflow-hidden font-inter">

    <VenueNavbar />

    <main class="min-[1000px]:ml-[200px] min-[1000px]:mt-[70px] mt-[70px] h-[calc(100%-4rem)] overflow-y-auto p-6">
        <slot />
    </main>

    </div>
</template>
