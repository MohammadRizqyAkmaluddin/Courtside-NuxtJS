<script setup lang="ts">
definePageMeta({
  layout: 'venue'
})

import { Icon } from '@iconify/vue'
import { ref, nextTick } from 'vue'
import { api } from '~/services/api'
import type { ApiResponse, Venue } from '~/types'

const messages = ref<any[]>([])
const input = ref('')
const loading = ref(false)
const profile = ref<Venue>()

const chatBox = ref<HTMLElement | null>(null)

const scrollToBottom = async () => {
  await nextTick()
  if (chatBox.value) {
    chatBox.value.scrollTop = chatBox.value.scrollHeight
  }
}

const sendMessage = async () => {
  if (!input.value.trim() || loading.value) return

  const msg = input.value
  input.value = ''

  // push user message
  messages.value.push({
    role: 'user',
    text: msg
  })

  loading.value = true
  await scrollToBottom()

  try {
    const res: any = await api('ai/support-chat', {
      method: 'POST',
      body: { message: msg }
    })

    messages.value.push({
      role: 'ai',
      text: res.reply
    })
  } catch (err) {
    messages.value.push({
      role: 'ai',
      text: 'Maaf, terjadi kesalahan. Silakan coba lagi atau hubungi support Courtside.'
    })
  }

  loading.value = false
  await scrollToBottom()
}

const handleKey = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    sendMessage()
  }
}

const fetchProfile = async () => {
    try {
        const res: ApiResponse<Venue> = await api('/auth/detail')
        profile.value = res.data
    } catch(e) {
        console.error(e)
    }
}
onMounted(fetchProfile)
</script>

<template>
  <div class="min-h-[400px]  flex flex-col bg-gray-50">

    <!-- HEADER -->
    <div class="p-4 border-b bg-white shrink-0">
      <h1 class="text-lg font-semibold flex items-center gap-2">Courtside AI Assistant <Icon icon="streamline:customer-support-1" width="16" height="16" /></h1>
      <p class="text-sm text-gray-500">
        Feel free to ask about anything in venue management system
      </p>
    </div>

    <!-- CHAT AREA (SCROLLABLE) -->
    <div
      ref="chatBox"
      class="flex-1 overflow-y-auto p-4 space-y-3"
    >
      <div v-if="messages.length === 0 && profile" class="text-center text-gray-400 mt-10 text-lg">
        <p>Hello</p>
        <p class="font-bold text-2xl">{{ profile?.name }}!</p>
        How can I assist you today?
      </div>

      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="flex"
        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[70%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap"
          :class="msg.role === 'user'
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-white border text-gray-800 rounded-bl-none shadow-sm'"
        >
          {{ msg.text }}
        </div>
      </div>

      <div v-if="loading" class="flex justify-start">
        <div class="bg-white border px-4 py-2 rounded-2xl text-sm text-gray-500 animate-pulse">
          Courtside is typing...
        </div>
      </div>
    </div>

    <!-- INPUT (ALWAYS BOTTOM) -->
    <div class="p-4 border-t bg-white shrink-0">
      <div class="flex gap-2">
        <input
          v-model="input"
          @keydown="handleKey"
          type="text"
          placeholder="Ask anything..."
          class="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring"
        />

        <button
          @click="sendMessage"
          class="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>

  </div>
</template>




