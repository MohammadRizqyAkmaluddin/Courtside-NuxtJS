<script setup lang="ts">

import { nextTick } from 'vue'
import { api } from '~/services/api'
import { formatChatTime, formatTime2, formatDate } from '~/utils/format'
import type { Conversations, Message, Messages } from '~/types'
import { Icon } from '@iconify/vue'
import { onlineStatus } from '#imports'

const authUser = useAuthUserStore()
const route = useRoute()
const router = useRouter()
const conversations = ref<Conversations[]>([])
const selectedConversationId = ref<number | null>(null)
const showMessages = ref(false)
const chats = ref<Messages | any>([])
const chatBox = ref<HTMLElement | null>(null)
const message = ref('')

const loadingConversations = ref(false)
const isRefreshing = ref(false)

const filters = reactive({
    search: '',
    filter: ''
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const fetchConversations = async (isInitial = false) => {
    if (isInitial) {
        loadingConversations.value = true
    } else {
        isRefreshing.value = true
    }

    try {
        const res = await api<Conversations[]>('/conversations', {
          query: { 
              search: filters.search || undefined,
              filter: filters.filter || undefined
          }
        })

        conversations.value = res
    } catch (e) {
        console.error(e)
    } finally {
        if (isInitial) {
            loadingConversations.value = false
        } else {
            isRefreshing.value = false
        }
    }
}

const openChatFromRoute = async () => {
  const conversationId = Number(route.query.conversation_id)
  if (!conversationId || Number.isNaN(conversationId)) return

  await openChat(conversationId)
}

onMounted(async () => {
  await fetchConversations(true)
  await openChatFromRoute()
  subscribeToMessageChannel()

  interval = setInterval(() => {
    fetchConversations(false) // <-- background (NO skeleton)
  }, 10000)
})

watch(
  () => route.query.conversation_id,
  async () => {
    await openChatFromRoute()
  }
)


const triggerSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)

  searchTimeout = setTimeout(() => {
    fetchConversations()
  }, 300)
}

watch(
  () => filters.search,
  () => {
    triggerSearch()
  }
)

const echoChannel = ref<any>(null)
const pollInterval = ref<number | null>(null)

const fetchChatMessages = async (conversation_id: number, cursor?: string) => {
    const query: Record<string, string | undefined> = {}
    if (cursor) query.cursor = cursor

    const res: any = await api(`/conversations/${conversation_id}`, {
        query
    })

    const messages = Array.isArray(res.messages) ? [...res.messages].reverse() : []
    
    return {
        ...res,
        messages,
    }
}

const refreshOpenChat = async () => {
    if (!selectedConversationId.value) return

    try {
        const res: any = await fetchChatMessages(selectedConversationId.value)
        if (Array.isArray(res.messages)) {
            chats.value.messages = res.messages
            chats.value.next_cursor = res.next_cursor
        }
    } catch (e) {
        console.error(e)
    }
}

const chatBoxDesktop = ref<HTMLElement | null>(null)
const chatBoxMobile = ref<HTMLElement | null>(null)

const getChatBox = () => {
  if (window.innerWidth < 1024) {
    return chatBoxMobile.value
  }
  return chatBoxDesktop.value
}

const scrollChatToBottom = () => {
  const el = getChatBox()
  if (!el) return

  el.scrollTop = el.scrollHeight
}

const startPolling = () => {
    if (pollInterval.value) return
    pollInterval.value = window.setInterval(() => {
        if (selectedConversationId.value) {
            refreshOpenChat()
        }
    }, 3000)
}

const stopPolling = () => {
    if (pollInterval.value) {
        window.clearInterval(pollInterval.value)
        pollInterval.value = null
    }
}

const handleIncomingMessage = async (event: any) => {
    if (!event || !event.conversation_id) return

    const incoming: Message = {
        id: event.id,
        type: event.type,
        is_read: event.is_read,
        message: event.message,
        is_mine: false,
        sender: event.sender,
        sparring: event.sparring || null,
        created_at: event.created_at,
    }

    const conversationId = Number(event.conversation_id)
    const conversation = conversations.value.find(c => c.conversation_id === conversationId)

    if (conversation) {
        conversation.last_message = {
            type: event.type,
            is_mine: false,
            message: event.message,
            sparring_id: event.sparring_id,
            created_at: event.created_at,
            preview: event.type === 'text' ? event.message : 'Joined your sparring'
        }

        if (selectedConversationId.value !== conversationId) {
            conversation.unread = (conversation.unread || 0) + 1
        }
    }

    if (selectedConversationId.value === conversationId) {
        const messages = Array.isArray(chats.value.messages) ? [...chats.value.messages, incoming] : [incoming]

        chats.value = {
            ...chats.value,
            messages,
            conversation_id: conversationId
        }

        await nextTick()
        if (chatBox.value) {
            chatBox.value.scrollTop = chatBox.value.scrollHeight
        }

        await refreshOpenChat()
    }
}

const subscribeToMessageChannel = () => {
    const echo = useNuxtApp().$echo
    const userId = authUser.user?.id
    if (!echo || !userId) return

    const channelName = `conversation.${userId}`

    if (echoChannel.value) {
        echo.leave(channelName)
    }

    echoChannel.value = echo.private(channelName)
    echoChannel.value.listen('.message.sent', (event: any) => {
        handleIncomingMessage(event)
    })

    stopPolling()
}

const sendMessage = async () => {
    if (!selectedConversationId.value || !message.value.trim()) return

    const body = {
        message: message.value.trim()
    }

    try {
        const res: any = await api(`/conversations/${selectedConversationId.value}/messages`, {
            method: 'POST',
            body
        })

        const outgoing: Message = {
            id: res.data.id,
            type: res.data.type,
            is_read: res.data.is_read,
            message: res.data.message,
            is_mine: true,
            sender: {
                id: authUser.user.id,
                name: authUser.user.name,
                profile_image_url: authUser.user.profile_image_url
            },
            sparring: null,
            created_at: res.data.created_at,
        }

        if (!Array.isArray(chats.value.messages)) {
            chats.value.messages = []
        }

        chats.value.messages = [...chats.value.messages, outgoing]
        message.value = ''

        const convo = conversations.value.find(c => c.conversation_id === selectedConversationId.value)
        if (convo) {
            convo.last_message = {
                type: outgoing.type,
                is_mine: true,
                message: outgoing.message,
                sparring_id: outgoing.sparring?.id || null,
                created_at: outgoing.created_at,
                preview: outgoing.message
            }
        }

        await nextTick()

        setTimeout(() => {
        scrollChatToBottom()
        }, 0)
    } catch (error) {
        console.error(error)
    }
}

const openChat = async (conversation_id: number) => {
  selectedConversationId.value = conversation_id
  showMessages.value = true

  const convo = conversations.value.find(
    c => c.conversation_id === conversation_id
  )
  if (convo) convo.unread = 0

  try {
    const [res] = await Promise.all([
      fetchChatMessages(conversation_id),
      api(`/conversations/${conversation_id}/read`, {
        method: 'PATCH'
      })
    ])

    chats.value = res

    await nextTick()

    setTimeout(() => {
    scrollChatToBottom()
    }, 0)

  } catch (e) {
    console.error(e)
  }
}

let interval: any = null

onMounted(() => {
  fetchConversations()
  subscribeToMessageChannel()

  interval = setInterval(() => {
    fetchConversations()
  }, 10000)
})

watch(
  () => authUser.user,
  () => {
    subscribeToMessageChannel()
  }
)

onUnmounted(() => {
  clearInterval(interval)
  stopPolling()

  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (echoChannel.value) {
    const echo = useNuxtApp().$echo
    const userId = authUser.user?.id
    if (echo && userId) {
      echo.leave(`conversation.${userId}`)
    }
    echoChannel.value = null
  }
})

const formatLastSeen = (lastSeen: string | null) => {
  if (!lastSeen) return 'Never online'

  const diff = Date.now() - new Date(lastSeen).getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes} minutes ago`
  if (hours < 24) return `${hours} hours ago`

  return new Date(lastSeen).toLocaleDateString()
}

const shouldGiveMargin = (messages: any, i: any) => {
  if (i >= messages.length - 1) return false
  return messages[i].is_mine !== messages[i + 1].is_mine
}

const shouldShowAvatar = (messages: any, i: any) => {
  const current = messages[i]

  // hanya untuk lawan bicara
  if (current.is_mine) return false

  // kalau message terakhir
  if (i === messages.length - 1) return true

  const next = messages[i + 1]

  // tampilkan kalau beda sender dengan next
  return current.is_mine !== next.is_mine
}

const shouldShowDate = (messages: any, i: any) => {
  if (i === 0) return true

  const current = new Date(messages[i].created_at).toDateString()
  const prev = new Date(messages[i - 1].created_at).toDateString()

  return current !== prev
}

const formatChatDateLabel = (dateStr: any) => {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const isSameDay = (a:any, b:any) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  if (isSameDay(date, today)) return 'Today'
  if (isSameDay(date, yesterday)) return 'Yesterday'

  const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays <= 6) {
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  return date.toLocaleDateString('id-ID')
}

const clearFilter = () => {
    filters.search = ''
}

const isMultiline = ref(false)

const autoResizes = (e:any) => {
  const el = e.target
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
  isMultiline.value = el.scrollHeight > 40
}

const closeMessage = () => {
    showMessages.value = false
    chats.value = ''
}

const isUserNearBottom = () => {
  if (!chatBox.value) return false

  const threshold = 100
  return (
    chatBox.value.scrollHeight - chatBox.value.scrollTop - chatBox.value.clientHeight < threshold
  )
}

watch(
  () => chats.value.messages,
  async () => {
    if (!isUserNearBottom()) return

    await nextTick()
    requestAnimationFrame(() => {
      scrollChatToBottom()
    })
  },
  { deep: true }
)

const sortedMessages = computed(() => {
  return [...(chats.value?.messages || [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
})



const confirmSparring = async (sparring_id?: number | string) => {
    if (!sparring_id) return

    try {
        const res: any = await api('/sparring/confirm', {
            method: 'POST',
            body: { sparring_id }
        })

        const updatedSparring = res?.data || { id: sparring_id, status: 'Accepted' }
        if (Array.isArray(chats.value?.messages)) {
            chats.value.messages = chats.value.messages.map((m: any) => {
                if (m.sparring && String(m.sparring.id) === String(sparring_id)) {
                    return { ...m, sparring: { ...m.sparring, ...updatedSparring } }
                }
                return m
            })
        }
        const convId = chats.value.conversation_id || selectedConversationId.value
        if (convId) {
            const convo = conversations.value.find((c: any) => c.conversation_id === convId)
            if (convo && convo.last_message && String(convo.last_message.sparring_id) === String(sparring_id)) {
                convo.last_message = {
                    ...convo.last_message,
                    message: 'Sparring accepted',
                    preview: 'Sparring accepted'
                }
            }
        }
        if (selectedConversationId.value) {
            await refreshOpenChat()
        }
    } catch (e) {
        console.error(e)
    }
}


const selectedSparring = ref<any | null>(null)
const showSparring = ref(false)

const openSparring = (sparring: Message) => {
    selectedSparring.value = sparring
    showSparring.value = true
}

const closeSparring = () => {
    selectedSparring.value = null
    showSparring.value = false
}


// MOBILE MODAL HANDLING
const startY = ref(0)
const currentY = ref(0)
const isDragging = ref(false)

const scrollContainer = ref<HTMLElement | null>(null)

const isAtTop = ref(false)

const onTouchStart = (e: TouchEvent) => {
  const el = scrollContainer.value
  isAtTop.value = el ? el.scrollTop === 0 : true
  startY.value = e.touches[0]?.clientY ?? 0
  isDragging.value = isAtTop.value
}

const onTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return

  e.preventDefault()

  currentY.value = e.touches[0]?.clientY ?? 0
}
const onTouchEnd = () => {
  if (!isDragging.value) return
  const diff = currentY.value - startY.value
  if (diff > 100) {
    showSparring.value = false
  }
  isDragging.value = false
  currentY.value = 0
}

</script>

<template>
  <Navbar></Navbar>
  <div class="flex flex-col gap-5 h-[calc(100vh-64px)] mt-[40px] lg:mt-[64px] overflow-hidden">
    <div class="flex">
        <div :class="['flex flex-col w-full lg:w-1/3 border-e-none lg:border-e min-h-screen max-h-screen', showMessages ? 'hidden sm:flex' : 'flex']">
            <div class="flex flex-col gap-2 px-5 py-6 w-full">
                <div class="flex gap-4 items-center">
                    <div class="flex items-center border border-gray-300 px-3 gap-3 rounded-full w-full h-fit py-1 bg-[#F8F8F8]">
                        <Icon icon="glyphs:search-1-outline" class="text-gray-900" width="25" height="25" />
                        <input
                        v-model="filters.search"
                        placeholder="Search"
                        class="outline-none w-full bg-transparent"
                        />
                        <Icon v-if="filters.search != ''" @click="clearFilter" icon="material-symbols:close" class="text-gray-600 cursor-pointer hover:text-black" width="25" height="25" />
                    </div>
                    <button><Icon icon="entypo:new-message" class="text-gray-400" width="25" height="25" /></button>
                </div>
                <div class="flex gap-2 font-semibold text-gray-500 text-sm lg:text-normal">
                    <button @click="filters.filter = ''" :class="['border rounded-full px-3 py-[3px] hover:bg-gray-100', filters.filter === '' ? 'border-blue-800 text-blue-900 bg-blue-100 hover:bg-blue-100' : 'hover:bg-gray-100']">All</button>
                    <button @click="filters.filter = 'unread'" :class="['border rounded-full px-3 py-[3px] hover:bg-gray-100', filters.filter === 'unread' ? 'border-blue-800 text-blue-900 bg-blue-100 hover:bg-blue-100' : 'hover:bg-gray-100']">Unread</button>
                    <button @click="filters.filter = 'sparring'" :class="['border rounded-full px-3 py-[3px]', filters.filter === 'sparring' ? 'border-blue-800 text-blue-900 bg-blue-100 hover:bg-blue-100' : 'hover:bg-gray-100']">Active Sparring</button>
                    <button class="border rounded-full px-3 py-[3px] hover:bg-gray-100">Group</button>
                </div>
            </div>

            <div v-if="loadingConversations">
                <div v-for="i in 8" :key="i" class="flex items-center gap-4 px-4 py-5 border-b">
                    <div class="w-16 h-16 rounded-full bg-gray-300 animate-pulse"></div>
                    <div class="flex-1">
                        <div class="flex justify-between items-center mb-2">
                            <div class="w-32 h-4 bg-gray-300 rounded animate-pulse"></div>
                            <div class="w-10 h-3 bg-gray-300 rounded animate-pulse"></div>
                        </div>
                        <div class="w-3/4 h-3 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>
            <div v-else class="overflow-y-auto custom-scrollbar flex-1 mb-16">
                <button v-for="convo in conversations" @click="openChat(convo.conversation_id)" 
                    :class="['flex items-start p-4 border-b last:border-b-0 w-full justify-between hover:bg-gray-100', chats.conversation_id === convo.conversation_id ? 'bg-gray-100' : '']">
                    <div class="flex gap-4 items-start">
                        <img :src="convo.user.profile_image_url" class="w-[60px] h-[60px] rounded-full object-cover border">
                        <div class="flex flex-col items-start leading-none">
                            <h2 class="font-semibold text-lg text-start">{{ convo.user.name }}</h2>
                            <div v-if="convo.last_message.is_mine" class="flex gap-2 text-start text-gray-500">
                                <p v-if="convo.last_message.type === 'text'" class="text-start">
                                    <span class="float-left w-[18px] mr-1 mt-[2px]">
                                        <Icon
                                        icon="sidekickicons:check-double-solid"
                                        :class="[convo.unread === 0 ? 'text-gray-600' : 'text-green-600']"
                                        width="19"
                                        height="19"
                                        />
                                    </span>
                                    <span class="line-clamp-2">
                                        {{ convo.last_message.message }}
                                    </span>
                                </p>
                                <div v-if="convo.last_message.type === 'sparring_invitation'" class="text-start flex items-center gap-2">
                                    <Icon icon="f7:sportscourt-fill"  width="17" height="17"/>
                                    <p class="line-clamp-2">Sparring confirmation</p>
                                </div>
                            </div>
                            <div v-else>
                                <p v-if="convo.last_message.type === 'text'" class="text-gray-500 text-start line-clamp-2">{{ convo.last_message.message }}</p>
                                <div v-if="convo.last_message.type === 'sparring_invitation'" class="text-start flex items-center gap-2 text-gray-500">
                                    <Icon icon="f7:sportscourt-fill"  width="17" height="17"/>
                                    <p class="line-clamp-2">Joined sparring</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col items-end gap-2">
                        <p :class="['text-xs font-semibold', convo.unread != 0 ? 'text-blue-900' : 'text-gray-500']">{{ formatChatTime(convo.last_message.created_at) }}</p>
                        <p v-if="convo.unread != 0" class="bg-blue-900 text-white font-semibold text-xs rounded-full p-2 w-fit h-[23px] flex items-center justify-center">
                            {{ convo.unread }}
                        </p>
                    </div>
                </button>
            </div>
        </div>
        <div v-if="showMessages" class="hidden w-full lg:flex flex-col justify-start">
            <div class="flex flex-col">
                <div class="flex gap-3 items-center bg-white px-5 py-3 border-b">
                    <img :src="chats.user.profile_image_url" class="w-[45px] h-[45px] object-cover rounded-full border">
                    <div class="flex flex-col leading-tight">
                        <h2 class="font-semibold">{{ chats.user.name }}</h2>
                        <span v-if="onlineStatus(chats.user.last_seen)" class="flex items-center gap-2">
                            <Icon icon="stash:circle-solid" class="text-green-600" width="17" height="17" />Online
                        </span>
                        <span v-else class="text-gray-400">Last seen {{ formatLastSeen(chats.user.last_seen) }}</span>
                    </div>
                </div>
                <div class="flex flex-col justify-end h-[735px]">
                    <div ref="chatBoxDesktop" class="flex flex-col p-5 gap-1 overflow-y-auto custom-scrollbar scroll-smooth">
                        
                        <div v-for="(chat, i) in sortedMessages" class="">
                            
                            <div v-if="shouldShowDate(sortedMessages, i)" class="flex justify-center my-1">
                                <span class="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-lg">
                                    {{ formatChatDateLabel(chat.created_at) }}
                                </span>
                            </div>
                            
                            <div :class="[ chat.is_mine ? 'flex justify-end bg' : 'flex items-end gap-2', shouldGiveMargin(sortedMessages, i) ? 'mb-3' : '']">
                                <template v-if="!chat.is_mine">
                                    <img v-if="shouldShowAvatar(sortedMessages, i)" :src="chats.user.profile_image_url" class="w-[40px] h-[40px] object-cover rounded-full border"/>
                                    <div v-else class="w-[40px] h-[40px]"></div>
                                </template>
                                <div v-if="chat.message" :class="['flex gap-4 w-fit items-end rounded-2xl border', chat.is_mine ? 'bg-blue-800 text-white' : 'bg-[#F8F8F8]']">
                                    <p class="p-2 px-3">{{ chat.message }}</p>
                                    <p :class="['text-xs p-2', chat.is_mine ? 'text-blue-200' : 'text-gray-500']">{{ formatTime2(chat.created_at) }}</p>
                                </div>
                                <div @click="openSparring(chat)" v-else :class="['flex flex-col cursor-pointer leading-none w-fit border items-end rounded-tr-3xl rounded-tl-3xl rounded-br-2xl rounded-bl-2xl p-[5px]', chat.is_mine ? 'bg-blue-800' : 'bg-[#F8F8F8]']">
                                    <div :class="['flex flex-col leading-snug min-w-[350px] rounded-tr-3xl rounded-tl-3xl rounded-br-xl rounded-bl-xl gap-1', chat.is_mine ? 'bg-blue-900 ' : 'bg-white']">
                                        <img :src="`/sport-type/${chat.sparring.sport_type.id}.png`" alt="Football" class="w-[400px] h-[70px] object-cover rounded-tr-3xl rounded-tl-3xl">
                                        <div class="flex justify-between items-end">
                                            <div class="flex flex-col items-start p-2 px-4">
                                                <p :class="['font-semibold text-gray-700', chat.is_mine ? 'text-white' : 'text-gray-700']">{{ chat.sparring.sport_type.type }} Sparring</p>
                                                <div class="flex gap-2">
                                                    <div :class="['flex text-sm gap-1 items-center', chat.is_mine ? 'text-gray-300' : 'text-gray-400']">
                                                        <Icon icon="clarity:date-line" width="15" height="15" />
                                                        <p>{{ formatDate(chat.sparring.sparring_date) }}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <p v-if="chat.is_mine === false && chat.sparring.status === 'Pending'" class="pe-2 text-xs text-gray-500">{{ formatTime2(chat.created_at) }}</p>
                                        </div>
                                        <div v-if="chat.is_mine === false && chat.sparring.status === 'Pending'" class="flex w-full font-semibold text-sm text-gray-700 border-t">
                                            <button @click="confirmSparring(chat.sparring.id)" class="p-3 w-1/2 border-e hover:bg-gray-100">Confirm</button>
                                            <button class="p-3 w-1/2 hover:bg-gray-100">Reject</button>
                                        </div>
                                    </div>
                                    <div v-if="chat.is_mine === false && chat.sparring.status === 'Accepted'" class="flex justify-between items-end w-full px-2 py-1">
                                        <div v-if="chat.sparring.status === 'Accepted'" class="flex text-sm gap-1 items-center text-gray-700">
                                            <Icon icon="ic:baseline-check" width="17" height="17" />
                                            <p class="">Sparring confirmed</p>
                                        </div>
                                        <div v-if="chat.sparring.status === 'Rejected'" class="flex text-sm gap-1 items-center text-gray-700">
                                            <Icon icon="ic:baseline-check" width="17" height="17" />
                                            <p class="">Sparring rejected</p>
                                        </div>
                                        <p :class="['text-xs', chat.is_mine ? 'text-blue-200' : 'text-gray-500']">{{ formatTime2(chat.created_at) }}</p>
                                    </div>
                                    <div v-if="chat.is_mine" class="flex justify-between items-end w-full px-2 py-1">
                                        <div v-if="chat.sparring.status === 'Pending'" class="flex text-sm gap-1 items-center text-gray-300">
                                            <Icon icon="weui:time-outlined" class="text-white" width="17" height="17" />
                                            <p class="">Waiting for confirmation</p>
                                        </div>
                                        <div v-if="chat.sparring.status === 'Accepted'" class="flex text-sm gap-1 items-center text-gray-300">
                                            <Icon icon="ic:baseline-check" class="text-white" width="17" height="17" />
                                            <p class="">Sparring confirmed</p>
                                        </div>
                                        <p :class="['text-xs', chat.is_mine ? 'text-blue-200' : 'text-gray-500']">{{ formatTime2(chat.created_at) }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex justify-end fixed bottom-2 right-0 w-full z-20 gap-1">
                <div class="flex w-1/3"></div>
                <div class="flex justify-end bg-white items-end gap-2 p-2 w-full">
                    <div :class="['flex items-end gap-2 border w-full px-2 p-[4px] transition-all duration-200',isMultiline ? 'rounded-2xl' : 'rounded-full']">
                        <button class="p-2 mb-1 rounded-full hover:bg-gray-100 shrink-0">
                            <Icon icon="ic:round-add" width="25" class="text-gray-600"/>
                        </button>
                        <textarea
                            v-model="message"
                            rows="1"
                            placeholder="Type a message..."
                            class="flex-1 p-2 mb-[4px] resize-none bg-transparent outline-none max-h-32 overflow-y-auto custom-scrollbar"
                            @input="autoResizes"
                            @keydown.enter.prevent="sendMessage"
                        ></textarea>
                        <button @click="sendMessage" v-if="message != ''" class="bg-blue-800 hover:bg-blue-700 mb-1 text-white rounded-full p-3 shrink-0">
                            <Icon icon="mdi:send" width="18" />
                        </button>
                        <button v-else class="p-2 hover:bg-blue-800 text-gray-600 hover:text-white rounded-full shrink-0">
                            <Icon icon="material-symbols:mic-outline" width="25"/>
                        </button>
                    </div>

                </div>
            </div>
        </div>
        <div v-if="showMessages" class="w-full flex flex-col justify-start lg:hidden">
            <div class="flex flex-col">
                <div class="flex gap-3 items-center bg-white px-5 py-3 border-b">
                    <div @click="closeMessage" class="flex">
                        <Icon icon="weui:back-filled" class="text-green-600" width="24" height="24" />
                    </div>
                    <img :src="chats.user.profile_image_url" class="w-[38px] h-[38px] object-cover rounded-full border">
                    <div class="flex flex-col leading-tight">
                        <h2 class="font-semibold">{{ chats.user.name }}</h2>
                        <span v-if="onlineStatus(chats.user.last_seen)" class="flex items-center gap-2 text-sm">
                            <Icon icon="stash:circle-solid" class="text-green-600" width="17" height="17" />Online
                        </span>
                        <span v-else class="text-gray-400 text-sm">Last seen {{ formatLastSeen(chats.user.last_seen) }}</span>
                    </div>
                </div>
                <div class="flex flex-col justify-end h-[687px]">
                    <div ref="chatBoxMobile" class="flex flex-col px-5 pb-5 gap-1  overflow-y-auto custom-scrollbar">
                        <div v-for="(chat, i) in sortedMessages" class="">
                            
                            <div v-if="shouldShowDate(sortedMessages, i)" class="flex justify-center my-5">
                                <span class="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-lg">
                                    {{ formatChatDateLabel(chat.created_at) }}
                                </span>
                            </div>
                            
                            <div :class="[ chat.is_mine ? 'flex justify-end bg' : 'flex items-end gap-2', shouldGiveMargin(sortedMessages, i) ? 'mb-3' : '']">
                                <template v-if="!chat.is_mine">
                                    <img v-if="shouldShowAvatar(sortedMessages, i)" :src="chats.user.profile_image_url" class="w-[40px] h-[40px] object-cover rounded-full border"/>
                                    <div v-else class="w-[40px] h-[40px]"></div>
                                </template>
                                <div v-if="chat.message" :class="['flex gap-4 w-fit items-end rounded-2xl border', chat.is_mine ? 'bg-blue-800 text-white' : 'bg-[#F8F8F8]']">
                                    <p class="p-2 px-3">{{ chat.message }}</p>
                                    <p :class="['text-xs p-2', chat.is_mine ? 'text-blue-200' : 'text-gray-500']">{{ formatTime2(chat.created_at) }}</p>
                                </div>
                                <div @click="openSparring(chat)" v-else :class="[ 'flex flex-col leading-none w-fit border items-end rounded-tr-3xl rounded-tl-3xl rounded-br-2xl rounded-bl-2xl p-[5px]', chat.is_mine ? 'bg-blue-800' : 'bg-[#F8F8F8]']">
                                    <div :class="['flex flex-col leading-snug min-w-[250px] rounded-tr-3xl rounded-tl-3xl rounded-br-xl rounded-bl-xl', chat.is_mine ? 'bg-blue-900 ' : 'bg-white']">
                                        <img :src="`/sport-type/${chat.sparring.sport_type.id}.png`" alt="Football" class="w-[270px] h-[60px] object-cover rounded-tr-3xl rounded-tl-3xl">
                                        <div class="flex justify-between items-end">
                                            <div class="flex flex-col items-start p-2 px-3">
                                                <p :class="['font-semibold text-sm text-gray-700', chat.is_mine ? 'text-white' : 'text-gray-700']">{{ chat.sparring.sport_type.type }} Sparring</p>
                                                <div class="flex gap-2">
                                                    <div :class="['flex text-xs gap-1 items-center', chat.is_mine ? 'text-gray-300' : 'text-gray-400']">
                                                        <Icon icon="clarity:date-line" width="15" height="15" />
                                                        <p>{{ formatDate(chat.sparring.sparring_date) }}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <p v-if="chat.is_mine === false && chat.sparring.status === 'Pending'" class="p-2 text-xs text-gray-500">{{ formatTime2(chat.created_at) }}</p>
                                        </div>
                                        <div v-if="chat.is_mine === false && chat.sparring.status === 'Pending'" class="flex w-full font-semibold text-sm text-gray-700 border-t">
                                            <button @click="confirmSparring(chat.sparring.id)" class="p-3 w-1/2 border-e hover:bg-gray-100">Confirm</button>
                                            <button class="p-3 w-1/2 hover:bg-gray-100">Reject</button>
                                        </div>
                                    </div>
                                    <div v-if="chat.is_mine === false && chat.sparring.status === 'Accepted'" class="flex justify-between items-end w-full px-2 py-1">
                                        <div v-if="chat.sparring.status === 'Accepted'" class="flex text-sm gap-1 items-center text-gray-700">
                                            <Icon icon="ic:baseline-check" width="17" height="17" />
                                            <p class="">Sparring confirmed</p>
                                        </div>
                                        <div v-if="chat.sparring.status === 'Rejected'" class="flex text-sm gap-1 items-center text-gray-700">
                                            <Icon icon="ic:baseline-check" width="17" height="17" />
                                            <p class="">Sparring rejected</p>
                                        </div>
                                        <p :class="['text-xs', chat.is_mine ? 'text-blue-200' : 'text-gray-500']">{{ formatTime2(chat.created_at) }}</p>
                                    </div>
                                    <div v-if="chat.is_mine" class="flex justify-between items-end w-full px-2 py-1">
                                        <div v-if="chat.sparring.status === 'Pending'" class="flex text-sm gap-1 items-center text-gray-300">
                                            <Icon icon="weui:time-outlined" class="text-white" width="17" height="17" />
                                            <p class="">Waiting for confirmation</p>
                                        </div>
                                        <div v-if="chat.sparring.status === 'Accepted'" class="flex text-sm gap-1 items-center text-gray-300">
                                            <Icon icon="ic:baseline-check" class="text-white" width="17" height="17" />
                                            <p class="">Sparring confirmed</p>
                                        </div>
                                        <p :class="['text-xs', chat.is_mine ? 'text-blue-200' : 'text-gray-500']">{{ formatTime2(chat.created_at) }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex justify-end fixed bottom-2 right-0 w-full z-20 gap-1">
                <div class="hidden lg:flex w-1/3"></div>
                <div class="flex justify-end bg-white items-end gap-2 px-1 w-full">
                    <div :class="['flex items-end gap-2 border w-full px-2 p-[4px] transition-all duration-200',isMultiline ? 'rounded-2xl' : 'rounded-full']">
                        <button class="p-2 mb-1 rounded-full hover:bg-gray-100 shrink-0">
                            <Icon icon="ic:round-add" width="25" class="text-gray-600"/>
                        </button>
                        <textarea
                            v-model="message"
                            rows="1"
                            placeholder="Type a message..."
                            class="flex-1 p-2 mb-[4px] resize-none bg-transparent outline-none max-h-32 overflow-y-auto custom-scrollbar"
                            @input="autoResizes"
                            @keydown.enter.prevent="sendMessage"
                        ></textarea>
                        <button @click="sendMessage" v-if="message != ''" class="bg-blue-800 hover:bg-blue-700 mb-1 text-white rounded-full p-3 shrink-0">
                            <Icon icon="mdi:send" width="18" />
                        </button>
                        <button v-else class="p-2 hover:bg-blue-800 text-gray-600 hover:text-white rounded-full shrink-0">
                            <Icon icon="material-symbols:mic-outline" width="25"/>
                        </button>
                    </div>

                </div>
            </div>
        </div>
        <div v-else class="hidden w-full h-auto p-5 lg:flex flex-col items-center gap-2 justify-center">
            <img src="/logo.png" alt="Courtside" class="w-[300px]">
            <p class="text-gray-600 text-lg">Start your conversations</p>
        </div>
        
    </div>
  </div>

<div v-if="showSparring" @click="closeSparring" class="hidden font-inter fixed inset-0 bg-black/50 z-50 md:flex items-center justify-center">
    <div class="flex flex-col bg-white w-[500px] rounded-md gap-8 relative">
        <img :src="`/sport-type/${selectedSparring.sparring.sport_type.id}.png`" alt="Football" class="w-full object-cover rounded-tr-md rounded-tl-md">
        <div class="flex flex-col gap-2 items-start px-5">
            <h1 class="text-sm font-semibold">Opponent Information</h1>
            <NuxtLink to="#" class="flex items-center justify-start gap-3">
                <img :src="selectedSparring.sparring.open_sparring.profile_image" alt="Football" class="w-[125px] h-[75px] object-cover rounded-md">
                <div class="flex flex-col gap-1 justify-start">
                    <div class="flex flex-col leading-tight justify-start">
                        <h2 class="font-semibold text-lg">{{ selectedSparring.sparring.open_sparring.creator_name}}</h2>
                        <p class="text-gray-500">{{ selectedSparring.sparring.open_sparring.email}}</p>
                    </div>
                    <div class="flex gap-2 items-center text-xs font-semibold text-gray-600">
                        <p class="bg-gray-100 rounded-md p-1 px-3">{{ formatAge(selectedSparring.sparring.open_sparring.bod)}} years old</p>
                        <p class="bg-gray-100 rounded-md p-1 px-3">{{selectedSparring.sparring.level}}</p>
                    </div>
                </div>
            </NuxtLink>
        </div>
        <div class="flex flex-col gap-2 items-start px-5 border-y py-5">
            <div class="flex justify-between w-full items-center">
                <p class="text-sm">Confirmation status</p>
                <p v-if="selectedSparring.sparring.status === 'Accepted'" class="border border-green-800 text-sm rounded-md p-1 px-3 text-green-800">Accepted by opponent</p>
                <p v-else-if="selectedSparring.sparring.status === 'Pending'" class="border border-blue-800 text-sm rounded-md p-1 px-3 text-blue-800">Waiting for confirmation</p>
                <p v-else-if="selectedSparring.sparring.status === 'Rejected'" class="border border-red-800 text-sm rounded-md p-1 px-3 text-red-800">Your opponent has rejected</p>
            </div>
            <div class="flex justify-between w-full items-center">
                <p class="text-sm">Matchday</p>
                <div class="flex items-center gap-2">
                    <Icon icon="clarity:date-line" width="15" height="15" />
                    <p class="text-sm">{{ formatDate(selectedSparring.sparring.sparring_date) }}</p>
                </div>
            </div>
        </div>
        <div class="flex w-full px-5 items-end gap-3">
            <div class="flex flex-col gap-2 items-start w-1/2">
                <h1 class="text-sm font-semibold">Venue location</h1>
                <NuxtLink v-if="selectedSparring.sparring.venue != null" :to="`/court/${selectedSparring.sparring.venue.id}`" class="flex flex-col items-start justify-start gap-3">
                    <div class="flex flex-col gap-1 justify-start">
                        <div class="flex flex-col leading-tight justify-start">
                            <h2 class="font-semibold">{{ selectedSparring.sparring.venue.name}}</h2>
                            <p class="text-gray-500 text-sm">{{ selectedSparring.sparring.city.city}}, {{ selectedSparring.sparring.city.province}}</p>
                        </div>
                    </div>
                </NuxtLink>
                <div v-else class="flex flex-col items-start justify-start gap-3">
                    <div class="flex flex-col gap-1 justify-start">
                        <div class="flex flex-col leading-tight justify-start">
                            <h2 class="font-semibold">Venue Unspecified</h2>
                            <p class="text-gray-500 text-xs leading-tight">This player is open to discuss for any venue location around {{ selectedSparring.sparring.city.city}}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex-col gap-1 items-center w-1/2">
                <button :disabled="selectedSparring.sparring.status === 'Accepted'" :class="['w-full text-sm font-semibold px-3 py-3 rounded-md h-fit', selectedSparring.sparring.status === 'Pending' ? 'bg-blue-900 text-white hover:bg-blue-800' : 'bg-gray-100 text-gray-600']">Cancel Sparring</button>
                <p v-if="selectedSparring.sparring.status === 'Accepted'" class="text-xs text-gray-300">You cannot cancel this sparring</p>
            </div>
        </div>
        <button @click="closeSparring" class="w-full border-t flex justify-center py-3 hover:bg-gray-100 ">Close</button>
    </div>
</div>

<div v-if="showSparring" class="lg:hidden fixed inset-0 z-50">
    <div @click="closeSparring" class="absolute inset-0 bg-black/50"></div>
    <div class="absolute bottom-0 left-0 w-full bg-white rounded-t-2xl py-5 transition-transform duration-300 ease-out"
        :style="{ height: '80%', transform: isDragging ? `translateY(${Math.max(0, currentY - startY)}px)` : 'translateY(0)'}"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
    >
        <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <div ref="scrollContainer" class="flex flex-col h-full gap-10 p-4 pb-5">
            <img :src="`/sport-type/${selectedSparring.sparring.sport_type.id}.png`" alt="Football" class="w-full object-cover rounded-tr-md rounded-tl-md">
            <div class="flex flex-col gap-2 items-start">
                <h1 class="text-sm font-semibold">Opponent Information</h1>
                <NuxtLink class="flex items-center justify-start gap-3">
                    <img :src="selectedSparring.sparring.open_sparring.profile_image" alt="Football" class="w-[125px] h-[75px] object-cover rounded-md">
                    <div class="flex flex-col gap-1 justify-start">
                        <div class="flex flex-col leading-tight justify-start">
                            <h2 class="font-semibold text-lg">{{ selectedSparring.sparring.open_sparring.creator_name}}</h2>
                            <p class="text-gray-500">{{ selectedSparring.sparring.open_sparring.email}}</p>
                        </div>
                        <div class="flex gap-2 items-center text-xs font-semibold text-gray-600">
                            <p class="bg-gray-100 rounded-md p-1 px-3">{{ formatAge(selectedSparring.sparring.open_sparring.bod)}} years old</p>
                            <p class="bg-gray-100 rounded-md p-1 px-3">{{selectedSparring.sparring.level}}</p>
                        </div>
                    </div>
                </NuxtLink>
            </div>
            <div class="flex flex-col gap-2 items-start border-y py-5">
                <div class="flex justify-between w-full items-center">
                    <p class="text-sm">Confirmation status</p>
                    <p v-if="selectedSparring.sparring.status === 'Accepted'" class="border border-green-800 text-sm rounded-md p-1 px-3 text-green-800">Accepted by opponent</p>
                    <p v-else-if="selectedSparring.sparring.status === 'Pending'" class="border border-blue-800 text-sm rounded-md p-1 px-3 text-blue-800">Waiting for confirmation</p>
                    <p v-else-if="selectedSparring.sparring.status === 'Rejected'" class="border border-red-800 text-sm rounded-md p-1 px-3 text-red-800">Your opponent has rejected</p>
                </div>
                <div class="flex justify-between w-full items-center">
                    <p class="text-sm">Matchday</p>
                    <div class="flex items-center gap-2">
                        <Icon icon="clarity:date-line" width="15" height="15" />
                        <p class="text-sm">{{ formatDate(selectedSparring.sparring.sparring_date) }}</p>
                    </div>
                </div>
            </div>
            <div class="flex w-full items-end gap-2">
                <div class="flex flex-col gap-2 items-start w-1/2">
                    <h1 class="text-sm font-semibold">Venue location</h1>
                    <NuxtLink v-if="selectedSparring.sparring.venue != null" :to="`/court/${selectedSparring.sparring.venue.id}`" class="flex flex-col items-start justify-start gap-3">
                        <div class="flex flex-col gap-1 justify-start">
                            <div class="flex flex-col leading-tight justify-start">
                                <h2 class="font-semibold">{{ selectedSparring.sparring.venue.name}}</h2>
                                <p class="text-gray-500 text-sm">{{ selectedSparring.sparring.city.city}}, {{ selectedSparring.sparring.city.province}}</p>
                            </div>
                        </div>
                    </NuxtLink>
                    <div v-else class="flex flex-col items-start justify-start gap-3">
                        <div class="flex flex-col gap-1 justify-start">
                            <div class="flex flex-col leading-tight justify-start">
                                <h2 class="font-semibold">Venue Unspecified</h2>
                                <p class="text-gray-500 text-xs leading-tight">This player is open to discuss for any venue location around {{ selectedSparring.sparring.city.city}}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col gap-1 items-center w-1/2">
                    <button :disabled="selectedSparring.sparring.status === 'Accepted'" :class="['w-full text-sm font-semibold px-3 py-3 rounded-md h-fit', selectedSparring.sparring.status === 'Pending' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-600']">Cancel Sparring</button>
                    <p v-if="selectedSparring.sparring.status === 'Accepted'" class="text-xs text-gray-300">You cannot cancel this sparring</p>
                </div>
            </div>
        </div>
    </div>
</div>
</template>


<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(100, 116, 139, 0.5);
  border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100, 116, 139, 0.8);
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 116, 139, 0.5) transparent;
}
</style>