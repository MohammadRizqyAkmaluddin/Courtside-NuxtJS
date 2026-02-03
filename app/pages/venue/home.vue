<script setup lang="ts">
    const auth = useAuthVenueStore()
    definePageMeta({
        middleware: 'venue-auth',
        layout: 'master'
    })
</script>

<template>
    <h1>Venue Home</h1>
    <p>welcome, {{ auth.venue?.name }}</p>
</template>