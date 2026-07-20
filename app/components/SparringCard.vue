<script setup>
const props = defineProps({
    sparring: Object,
    isSelected: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['select'])

</script>

<template>
    <button @click="emit('select', sparring)" :class="['flex flex-col p-10 font-inter border rounded-md shadow transition-shadow duration-200 hover:shadow-lg', isSelected ? 'ring-2 ring-blue-900' : '']">
        <div class="flex flex-col gap-3 items-center">
            <img :src="sparring.user.profile_image_url" class="w-[110px] h-[110px] rounded-full border object-cover">
            <div class="flex flex-col items-center w-full">
                <h2 class="text-lg font-semibold">{{  sparring.user?.name}}</h2>
                <p class="text-xs">Posted {{ formatDaysAgo(sparring.created_at) }}</p>
                <p class="text-sm mt-5 text-gray-600 text-center">{{ sparring.description }}</p>
                <div class="flex gap-2 mt-5 justify-between">
                    <SportIcon :key="sparring.sport_type?.id" :name="sparring.sport_type?.id" color="gray" :size="17" class="bg-gray-100 w-fit rounded-lg"/>
                    <p class="text-gray-500 text-xs rounded-md bg-gray-100 px-2">{{ sparring.level.level }} Player</p>
                </div>
                <p class="mt-2 text-xs text-gray-600">{{ sparring.city.city }}, {{ sparring.city.province }}</p>
            </div>
        </div>
    </button>
</template>

