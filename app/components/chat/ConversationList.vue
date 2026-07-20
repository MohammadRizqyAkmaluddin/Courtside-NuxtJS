<script setup>
const props = defineProps({
    conversations: Object,
    isSelected: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['select'])

</script>

<template>

    <div v-for="conv in conversations" :key="conv.conversation_id" @click="emit('select', conv)"
      class="ps-4 py-4 border-b cursor-pointer hover:bg-gray-100 flex items-center gap-3"
    >
      <img :src="conv.user.profile_image_url" class="w-10 h-10 rounded-full"/>
      <div class="flex-1">
        <p class="font-semibold">{{ conv.user.name }}</p>
        <p class="text-sm text-gray-500">{{ conv.last_message.preview }}</p>
      </div>
    </div>

</template>