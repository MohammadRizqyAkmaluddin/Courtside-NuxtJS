<script setup lang="ts">
definePageMeta({
    layout: 'venue'
})
import type { ApiResponse, BankAccount, Facility, OperationalHour, Venue, VenueImage } from '~/types';
import { api } from '~/services/api';
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';

// VARIABLES
const active = ref<'profile' | 'preference' | 'account' | null>('profile')
const profile = ref<Venue>()
const venueImage = ref<VenueImage[]>([])
const operationalHour = ref<OperationalHour[]>([])
const facility = ref<Facility[]>([])
const viewImageModal = ref(false)
const selectedImage = ref<VenueImage>()
const fileInput = ref<HTMLInputElement | null>(null)
const activeDropdown = ref<number | null>(null)
const bankAccount = ref<BankAccount[]>([])
const selectedBank = ref<any | null>()

// LOADING STATE
const loadingProfile = ref(false)
const loadingImages = ref(false)
const loadingOperationalHour = ref(false)
const loadingFacility = ref(false)
const loadingBank = ref(false)

// EDIT STATE
const eImage = ref(false)
const eName = ref(false)
const eDescription = ref(false)
const eAddress = ref(false)
const ePhone = ref(false)
const eHour = ref(false)
const eEmail = ref(false)
const ePassword = ref(false)
const eBank = ref(false)

// BUTTON CONTROL
const changeTo = (to: string) => {
    if (to == 'profile') {
        active.value = 'profile'
    } else if (to == 'preference') {
        active.value = 'preference'
        cancelChange()
    } else if (to == 'account') {
        active.value = 'account'
        cancelChange()
    }
}

const changeImage = () => {
    eImage.value = true
    eEmail.value = false
    ePassword.value = false
    eName.value = false
    eDescription.value = false
    eAddress.value = false
    ePhone.value = false
    eHour.value = false
    eBank.value = false
    profileForm.name = profile.value?.name
}
const changeName = () => {
    eName.value = true
    eEmail.value = false
    ePassword.value = false
    eImage.value = false
    eDescription.value = false
    eAddress.value = false
    ePhone.value = false
    eHour.value = false
    eBank.value = false
    profileForm.name = profile.value?.name
}
const changeDescription = () => {
    eDescription.value = true
    eEmail.value = false
    ePassword.value = false
    eImage.value = false
    eName.value = false
    eAddress.value = false
    ePhone.value = false
    eHour.value = false
    eBank.value = false
    profileForm.description = profile.value?.description
}
const changePhone = () => {
    ePhone.value = true
    eEmail.value = false
    ePassword.value = false
    eImage.value = false
    eDescription.value = false
    eName.value = false
    eAddress.value = false
    eHour.value = false
    eBank.value = false
    profileForm.phone = profile.value?.phone
}
const changeHour = () => {
    eHour.value = true
    eEmail.value = false
    ePassword.value = false
    ePhone.value = false
    eImage.value = false
    eDescription.value = false
    eName.value = false
    eAddress.value = false
    eBank.value = false
    profileForm.phone = profile.value?.phone
}
const changeEmail = () => {
    eEmail.value = true
    eHour.value = false
    ePassword.value = false
    ePhone.value = false
    eImage.value = false
    eDescription.value = false
    eName.value = false
    eAddress.value = false
    eBank.value = false
    profileForm.phone = profile.value?.phone
}
const changePassword = () => {
    ePassword.value = true
    eHour.value = false
    eEmail.value = false
    ePhone.value = false
    eImage.value = false
    eDescription.value = false
    eName.value = false
    eAddress.value = false
    eBank.value = false
    profileForm.phone = profile.value?.phone
}
const changeBank = () => {
    eBank.value = true
    ePassword.value = false
    eHour.value = false
    eEmail.value = false
    ePhone.value = false
    eImage.value = false
    eDescription.value = false
    eName.value = false
    eAddress.value = false
    profileForm.phone = profile.value?.phone
}
const cancelChange = () => {
    ePassword.value = false
    eBank.value = false
    eEmail.value = false
    eHour.value = false
    eName.value = false
    eImage.value = false
    eDescription.value = false
    eAddress.value = false
    ePhone.value = false
    emailError.value = ''
}

const viewImage = (image: VenueImage) => {
    viewImageModal.value = true
    selectedImage.value = image
}

const selectPrimary = (image: VenueImage) => {
    selectedImage.value = image
    activeDropdown.value = null
    setPrimary()
}
const selectRemove = (image: VenueImage) => {
    selectedImage.value = image
    activeDropdown.value = null
    removeImage()
}
const selectBank = (bank: any) => {
    selectedBank.value = bank
    editMainBank()
}
// UTILS

function formatPhoneNumber(phone: any) {
  if (!phone) return ''

  // pastikan string & hanya angka
  const cleaned = phone.toString().replace(/\D/g, '')

  if (cleaned.length <= 4) return cleaned

  const parts = []

  for (let i = 0; i < cleaned.length; i += 4) {
    parts.push(cleaned.substring(i, i + 4))
  }

  return parts.join('-')
}

const handleFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  addImageForm.value.image = file
  await addImage()
  input.value = ''
}

const openDaysText = computed(() => {
  if (!operationalHour.value) return ''

  const openDays = operationalHour.value.filter(day => day.is_closed === 0).length

  return `${openDays} days open`
})

const getDayName = (day: any) => {
  const days = [
    'Monday',    // 1
    'Tuesday',   // 2
    'Wednesday', // 3
    'Thursday',  // 4
    'Friday',    // 5
    'Saturday',  // 6
    'Sunday'     // 7
  ]

  return days[day - 1] || ''
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
  currentY.value = e.touches[0]?.clientY ?? 0
}

const onTouchEnd = () => {
  if (!isDragging.value) return
  const diff = currentY.value - startY.value
  if (diff > 100) {
    cancelChange()
  }
  isDragging.value = false
  currentY.value = 0
}

// SUBMIT
const profileForm = reactive({
    name: profile.value?.name,
    description: profile.value?.description,
    phone: profile.value?.phone,
})

const editName = async () => {
    await api('/setting/editName', {
        method: 'POST',
        body: {
            name: profileForm.name 
        }
    })
    fetchProfile()
    eName.value = false
}

const editDescription = async () => {
    await api('/setting/editDescription', {
        method: 'POST',
        body: {
            description: profileForm.description 
        }
    })
    fetchProfile()
    eDescription.value = false
}

const addImageForm = ref({
    image: null as File | null
})

const addImage = async () => {
  const file = addImageForm.value.image
  if (!file) return

  const formData = new FormData()
  formData.append('image', file)

  await api('/setting/addImage', {
    method: 'POST',
    body: formData
  })

  fetchImages()
  eImage.value = true
}

const setPrimary = async () => {
    await api('/setting/setPrimary', {
        method: 'POST',
        body: {
            id: selectedImage.value?.id
        }
    })
    fetchImages()
    fetchProfile()
}

const removeImage = async () => {
    await api('/setting/removeImage', {
        method: 'POST',
        body: {
            id: selectedImage.value?.id
        }
    })
    fetchImages()
    fetchProfile()
}

const setOpen = async (selectedDay: string) => {
    await api('/setting/setOpen', {
        method: 'POST',
        body: {
            day_of_week: selectedDay
        }
    })

    fetchOperationalHour()
    eHour.value = true
}

const setClose = async (selectedDay: string) => {
    await api('/setting/setClose', {
        method: 'POST',
        body: {
            day_of_week: selectedDay
        }
    })

    fetchOperationalHour()
    eHour.value = true
}

const editEmailForm = reactive({
    email: '',
    password: ''
})
const emailError = ref('')
const editEmail = async () => {
    emailError.value = ''
    try {
        const res: any = await api('/setting/changeEmail', {
            method: 'POST',
            body: {
                email: editEmailForm.email,
                password: editEmailForm.password
            }
        })

        if (!res.success) {
            emailError.value = res.message
            return
        }

        fetchProfile()
        editEmailForm.email = ''
        editEmailForm.password = ''
        eEmail.value = false
    } catch (err: any) {
        emailError.value = err?.response?.data?.message || 'Something went wrong'
    }
}

const editPasswordForm = reactive({
    old_password: '',
    new_password: ''
})
const passwordError = ref('')
const editPassword = async () => {
    passwordError.value = ''
    try {
        const res: any = await api('/setting/changePassword', {
            method: 'POST',
            body: {
                old_password: editPasswordForm.old_password,
                new_password: editPasswordForm.new_password
            }
        })

        if (!res.success) {
            passwordError.value = res.message
            return
        }

        fetchProfile()
        editPasswordForm.old_password = ''
        editPasswordForm.new_password = ''
        ePassword.value = false
    } catch (err: any) {
        passwordError.value = err?.response?.data?.message || 'Something went wrong'
    }
}

const editMainBank = async () => {
    await api('/change-bank-account', {
        method: 'POST',
        body: {
            venue_bank_account_id: selectedBank.value
        }
    })
    fetchBankAccount()
}

const editStatus = async () => {
    await api('/setting/accountStatus', {
        method: 'POST'
    })
    fetchProfile()
}

// DATA FETCHER
const fetchProfile = async () => {
    loadingProfile.value = true
    try {
        const res: ApiResponse<Venue> = await api('/auth/detail')
        profile.value = res.data
    } catch(e) {
        console.error(e)
    } finally {
        loadingProfile.value = false
    }
}

const fetchImages = async () => {
    loadingImages.value = true
    try {
        const res: ApiResponse<VenueImage[]> = await api('/auth/venueImages')
        venueImage.value = res.data
    } catch(e) {
        console.error(e)
    } finally {
        loadingImages.value = false
    }
}

const fetchOperationalHour = async () => {
    loadingOperationalHour.value = true
    try {
        const res: ApiResponse<OperationalHour[]> = await api('/auth/operationalHour')
        operationalHour.value = res.data
    } catch(e) {
        console.error(e)
    } finally {
        loadingOperationalHour.value = false
    }
}

const fetchFacility = async () => {
    loadingFacility.value = true
    try {
        const res: ApiResponse<Facility[]> = await api('/auth/facility')
        facility.value = res.data
    } catch(e) {
        console.error(e)
    } finally {
        loadingFacility.value = false
    }
}

const fetchBankAccount = async () => {
    loadingBank.value = true
    try {
        const res: ApiResponse<BankAccount[]> = await api('/bank-account')
        bankAccount.value = res.data
    } catch (e) {
        console.error(e)
    } finally {
        loadingBank.value = false
    }
}

onMounted(fetchProfile)
onMounted(fetchImages)
onMounted(fetchOperationalHour)
onMounted(fetchFacility)
onMounted(fetchBankAccount)
</script>

<template>
<div class="flex flex-col md:flex-row bg-white rounded-md text-sm h-full">
    <div class="hidden w-1/4 md:flex flex-col border-e text-gray-400 text-[12px] items-center">
        <button @click="changeTo('profile')" class="w-full text-start p-3"
            :class="active == 'profile' ? 'bg-blue-900 text-white' : 'text-gray-400'">
            Profile & Operational
        </button>
        <button @click="changeTo('account')" class="w-full text-start p-3"
            :class="active == 'account' ? 'bg-blue-900 text-white' : 'text-gray-400'">
            Account
        </button>
        <button @click="changeTo('preference')" class="w-full text-start p-3 rounded-tl-md" 
            :class="active == 'preference' ? 'bg-blue-900 text-white' : 'text-gray-400'">
            Preference
        </button>
    </div>
    <div class="md:hidden w-full flex flex-col border-b text-gray-400 text-[12px] items-center">
        <button @click="changeTo('profile')" class="w-full p-3 border-e"
            :class="active == 'profile' ? 'bg-blue-900 text-white' : 'text-gray-400'">
            Profile & Operational
        </button>
        <button @click="changeTo('account')" class="w-full p-3 rounded-tr-md"
            :class="active == 'account' ? 'bg-blue-900 text-white' : 'text-gray-400'">
            Account
        </button>
        <button @click="changeTo('preference')" class="w-full p-3 rounded-tl-md border-e" 
            :class="active == 'preference' ? 'bg-blue-900 text-white' : 'text-gray-400'">
            Preference
        </button>
    </div>
    <div class="w-full p-5 bg-white">
        <div v-if="active == 'preference'">
            <div class="flex items-center gap-2 font-semibold text-blue-900">
                <p class="text-gray-500 font-light">Setting</p>
                <p>/</p>
                <p>Preference</p>
            </div>
        </div>
        <div v-else-if="active == 'profile'">
            <div class="hidden md:flex items-center gap-2 font-semibold text-blue-900">
                <p class="text-gray-500 font-light">Setting</p>
                <p>/</p>
                <p>Profile & Operational</p>
            </div>
            <div v-if="loadingProfile" class="animate-pulse flex flex-col gap-6">
                <div class="flex justify-between items-start">
                    <div class="flex flex-col gap-2 w-full">
                    <div class="h-4 bg-gray-100 rounded w-20"></div>
                    <div class="h-5 bg-gray-100 rounded w-40"></div>
                    </div>
                    <div class="h-6 w-14 bg-gray-100 rounded-md"></div>
                </div>

                <hr>

                <!-- Description -->
                <div class="flex justify-between items-start">
                    <div class="flex flex-col gap-2 w-full">
                    <div class="h-4 bg-gray-100 rounded w-28"></div>
                    <div class="h-4 bg-gray-100 rounded w-40"></div>
                    </div>
                    <div class="h-6 w-14 bg-gray-100 rounded-md"></div>
                </div>

                <hr>

                <!-- Phone -->
                <div class="flex justify-between items-start">
                    <div class="flex flex-col gap-2 w-full">
                    <div class="h-4 bg-gray-100 rounded w-16"></div>
                    <div class="h-4 bg-gray-100 rounded w-40"></div>
                    </div>
                    <div class="h-6 w-14 bg-gray-100 rounded-md"></div>
                </div>

                <hr>

                <!-- Operational Hour -->
                <div class="flex justify-between items-start">
                    <div class="flex flex-col gap-2 w-full">
                    <div class="h-4 bg-gray-100 rounded w-40"></div>
                    <div class="h-4 bg-gray-100 rounded w-32"></div>
                    </div>
                    <div class="h-6 w-14 bg-gray-100 rounded-md"></div>
                </div>

                <hr>

                <!-- Venue Image -->
                <div class="flex justify-between items-start">
                    <div class="flex flex-col gap-3 w-full">
                        <div class="h-4 bg-gray-100 rounded w-32"></div>
                        <div class="w-40 h-24 md:w-[300px] md:h-[100px] bg-gray-100 rounded-xl"></div>
                    </div>
                    <div class="h-6 w-14 bg-gray-100 rounded-md"></div>
                </div>

            </div>
            <div v-else-if="profile" class="flex flex-col md:mt-5">
                <div class="flex items-center border-b py-5">
                    <div class="flex flex-col md:flex-row w-full gap-2 items-start md:items-center">
                        <p class="font-semibold w-[200px] flex items-center">Name</p>
                        <input v-if="eName" v-model="profileForm.name" type="text" :placeholder="profile.name" class="w-full border shadow border-blue-800 py-2 px-3 rounded-md focus:outline-none"/>
                        <p v-else class="text-[13px] md:text-sm">{{ profile.name }}</p>
                        <div v-if="eName" class="flex gap-2 w-1/2 md:w-1/3 h-full">
                            <button @click="cancelChange" class="border rounded-md py-2 w-full font-semibold">Cancel</button>
                            <button @click="editName" class="border rounded-md py-2 w-full font-semibold bg-blue-900 text-white">Update</button>
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button v-if="!eName" @click="changeName" class="border rounded-md py-1 px-3 font-semibold">Edit</button>
                    </div>
                </div>

                <div class="flex items-center border-b py-5">
                    <div class="flex flex-col md:flex-row w-full gap-2 items-start md:items-center">
                        <p class="font-semibold w-[200px] flex items-center">Description</p>
                        <textarea v-if="eDescription" v-model="profileForm.description" type="text" :placeholder="profile?.description" class="resize-none h-[100px] w-full border shadow border-blue-800 py-2 px-3 rounded-md focus:outline-none"/>
                        <div v-else>
                            <p class="hidden md:flex w-[700px]">{{ profile.description }}</p>
                            <p class="flex md:hidden text-[13px]">{{ profile.description }}</p>
                        </div>
                        <div v-if="eDescription" class="flex flex-row md:flex-col gap-2 w-1/2 md:w-1/3 h-full">
                            <button @click="cancelChange" class="border rounded-md py-2 w-full font-semibold">Cancel</button>
                            <button @click="editDescription" class="border rounded-md py-2 w-full font-semibold bg-blue-900 text-white">Update</button>
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button v-if="!eDescription" @click="changeDescription" class="border rounded-md py-1 px-3 font-semibold">Edit</button>
                    </div>
                </div>

                <div class="flex items-center border-b py-5">
                    <div class="flex flex-col md:flex-row w-full gap-2 items-start md:items-center">
                        <p class="font-semibold w-[200px] flex items-center">Phone</p>
                        <input v-if="ePhone" v-model="profileForm.phone" type="text" :placeholder="profile.phone" class="w-full border shadow border-blue-800 py-2 px-3 rounded-md focus:outline-none"/>
                        <p v-else class="text-[13px] md:text-sm">{{ formatPhoneNumber(profile.phone) }}</p>
                        <div v-if="ePhone" class="flex gap-2 w-1/2 md:w-1/3 h-full">
                            <button @click="cancelChange" class="border rounded-md py-2 w-full font-semibold">Cancel</button>
                            <button @click="editName" class="border rounded-md py-2 w-full font-semibold bg-blue-900 text-white">Update</button>
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button v-if="!ePhone" @click="changePhone" class="border rounded-md py-1 px-3 font-semibold">Edit</button>
                    </div>
                </div>
                <div class="flex items-center py-5 border-b">
                    <div class="flex flex-col md:flex-row w-full gap-2 items-start md:items-center">
                        <p class="font-semibold w-[200px] flex items-center">Operational Hour</p>
                        <p class="text-[13px] md:text-sm">{{ openDaysText }}</p>
                    </div>
                    <div class="flex justify-end">
                        <button v-if="!ePhone" @click="changeHour" class="border rounded-md py-1 px-3 font-semibold">Set</button>
                    </div>
                </div>
                <div v-if="venueImage" class="flex items-center py-5">
                    <div class="flex flex-col  w-full gap-2 items-start md:items-start">
                        <div class="flex justify-between items-center w-full">
                            <p class="font-semibold w-[200px] flex items-center">Venue Image</p>
                            <button v-if="!eImage" @click="changeImage" class="border rounded-md py-1 px-3 font-semibold">Edit</button>
                        </div>
                        <div class="flex gap-1 mt-4">
                            <img :src="profile.primary_image.image_url" class="w-[180px] md:w-[400px] object-cover rounded-md">
                            <div v-if="venueImage.length >= 3" class="flex flex-col gap-1">
                                <img :src="venueImage[1]?.image_url" class="w-[80px] md:w-[195px] object-cover rounded-md">
                                <div class="relative w-[80px] md:w-[195px] h-full rounded-md overflow-hidden">
                                    <img :src="venueImage[2]?.image_url" class="absolute inset-0 object-cover blur-sm scale-110">
                                    <div class="absolute inset-0 bg-black/40"></div>
                                    <div class="absolute inset-0 z-20 flex items-center justify-center">
                                        <p class="text-white text-sm md:text-2xl font-semibold">{{ venueImage.length-2 }}+</p>
                                    </div>
                                </div>
                            </div>
                            <div v-else-if="venueImage.length == 2" class="flex flex-col gap-1">
                                <img :src="venueImage[1]?.image_url" class="w-[80px] md:w-[195px] h-full object-cover rounded-md">
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="flex items-center py-5 border-b">
                    <div class="flex flex-col md:flex-row w-full gap-2 items-start md:items-center">
                        <p class="font-semibold w-[200px] flex items-center">Venue Image</p>
                        <p class="text-[13px] md:text-sm">You haven't upload any image</p>
                    </div>
                    <div class="flex justify-end">
                        <button v-if="!eImage" @click="changeImage" class="border rounded-md py-1 px-3 font-semibold">Add New</button>
                    </div>
                </div>

            </div>
        </div>
        <div v-else-if="active == 'account'">
            <div class="flex items-center gap-2 font-semibold text-blue-900">
                <p class="text-gray-500 font-light">Setting</p>
                <p>/</p>
                <p>Account</p>
            </div>
            <div v-if="profile" class="flex flex-col mt-5">
                <div class="flex items-center border-b py-5">
                    <div class="flex flex-col md:flex-row w-full gap-2 items-start md:items-center">
                        <p class="font-semibold w-[200px] flex items-center">Email</p>
                        <p v-if="emailError" class="text-red-500 text-xs mb-2">{{ emailError }}</p>
                        <div v-if="eEmail" class="flex gap-2 w-full">
                            <input v-model="editEmailForm.email" type="email" placeholder="Enter New Email" class="w-full border shadow border-blue-800 py-2 px-3 rounded-md focus:outline-none"/>
                            <input v-model="editEmailForm.password" type="password" placeholder="Enter Password" class="w-full border shadow border-blue-800 py-2 px-3 rounded-md focus:outline-none"/>
                        </div>
                        <p v-else class="text-[13px] md:text-sm">{{ profile.email }}</p>
                        <div v-if="eEmail" class="flex gap-2 w-1/2 md:w-1/3 h-full">
                            <button @click="cancelChange" class="border rounded-md py-2 w-full font-semibold">Cancel</button>
                            <button @click="editEmail" class="border rounded-md py-2 w-full font-semibold bg-blue-900 text-white">Update</button>
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button v-if="!eEmail" @click="changeEmail" class="border rounded-md py-1 px-3 font-semibold">Change</button>
                    </div>
                </div>
                <div class="flex items-center border-b py-5">
                    <div class="flex flex-col md:flex-row w-full gap-2 items-start md:items-center">
                        <p class="font-semibold w-[200px] flex items-center gap-1">Password <Icon icon="mingcute:lock-fill" width="17" height="17" /></p>
                        <p v-if="passwordError" class="text-red-500 text-xs mb-2">{{ passwordError }}</p>
                        <div v-if="ePassword" class="flex gap-2 w-full">
                            <input v-model="editPasswordForm.old_password" type="password" placeholder="Old Password" class="w-full border shadow border-blue-800 py-2 px-3 rounded-md focus:outline-none"/>
                            <input v-model="editPasswordForm.new_password" type="password" placeholder="New Password" class="w-full border shadow border-blue-800 py-2 px-3 rounded-md focus:outline-none"/>
                        </div>
                        <div v-else class="flex items-center">
                            <div v-for="i in 8">
                                <Icon icon="icon-park-outline:dot" width="15" height="15" />
                            </div>
                        </div>
                        <div v-if="ePassword" class="flex gap-2 w-1/2 md:w-1/3 h-full">
                            <button @click="cancelChange" class="border rounded-md py-2 w-full font-semibold">Cancel</button>
                            <button @click="editPassword" class="border rounded-md py-2 w-full font-semibold bg-blue-900 text-white">Update</button>
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button v-if="!ePassword" @click="changePassword" class="border rounded-md py-1 px-3 font-semibold">Change</button>
                    </div>
                </div>
                <div class="flex items-center border-b py-5">
                    <div class="flex flex-col md:flex-row w-full gap-2 items-start md:items-center">
                        <p class="font-semibold w-[200px]">Bank Account</p>
                        <div class="flex items-center">
                            <div v-for="bank in bankAccount">
                                <div v-if="bank.status == 'Main'" class="flex flex-col md:flex-row items-start md:items-center md:gap-2">
                                    <p class="font-semibold">{{ bank.bank_type }}</p>
                                    <p>{{ bank.bank_account }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button v-if="!eBank" @click="changeBank" class="border rounded-md py-1 px-3 font-semibold">Modify</button>
                    </div>
                </div>
                <div class="flex items-center border-b py-5">
                    <div class="flex flex-col md:flex-row w-full gap-2 items-start md:items-center">
                        <p class="font-semibold w-[200px] flex items-center gap-1">Account Status</p>
                        <p>{{ profile.status }}</p>
                    </div>
                    <div class="flex justify-end">
                        <button v-if="profile.status == 'Active'" @click="editStatus" class="border-red-800 border-2 text-red-800 rounded-full py-1 px-3 font-semibold">Deactivate</button>
                        <button v-else-if="profile.status == 'Inactive'" @click="editStatus" class="border-green-800 border-2 text-green-800 rounded-full py-1 px-3 font-semibold">Activate</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>


<!-- DESKTOP -->
<div v-if="eImage" class="max-[1000px]:hidden fixed inset-0 z-50 flex items-center justify-center">
    <div @click="cancelChange" class="absolute inset-0 bg-black/50"></div>

    <div @click="activeDropdown = null" class="w-[600px] absolute px-5 pb-5 bg-white rounded-md flex flex-col gap-3">
        <div class="flex justify-between border-b pb-3 mb-2 mt-3">
            <h1 class="text-sm font-bold ">Edit Profile Image</h1>
            <button @click="cancelChange" class="text-gray-500 hover:text-black"><Icon icon="ic:baseline-close" width="20" height="20" /></button>
        </div>

        <div class="flex w-full gap-4">
            <div v-if="venueImage" class="grid grid-cols-3 gap-2">
                <button @click="viewImage(img)" v-for="img in venueImage" :key="img.id" class="relative">
                    <div @click.stop="activeDropdown = activeDropdown === img.id ? null : img.id"
                        class="absolute top-2 right-2 z-20 bg-black/50 text-white rounded-full hover:bg-black"
                    >
                        <Icon icon="qlementine-icons:menu-dots-16" width="25" height="25" />
                    </div>

                    <div v-if="activeDropdown === img.id" class="absolute top-10 right-2 z-30 bg-white border shadow-lg rounded-md text-[12px] w-[150px] overflow-hidden">
                        <button @click.stop="selectPrimary(img)" v-if="!img.is_primary" class="w-full p-2 border-b hover:bg-gray-100"> 
                            Set Default
                        </button>
                        <button @click.stop="selectRemove(img)" class="w-full flex items-center justify-center gap-1 p-2 hover:bg-gray-100 text-red-500">
                            Delete
                            <Icon icon="iconamoon:trash" width="15" height="15" />
                        </button>
                    </div>
                    <img :src="img.image_url" class="w-[200px] h-[100px] object-cover rounded-md shadow hover:brightness-110" 
                        :class="img.is_primary ? 'border bg-blue-900 p-2' : ''"
                    >
                </button>
                
                <input 
                type="file" 
                ref="fileInput"
                class="hidden"
                accept="image/*"
                @change="handleFileChange"
                />
                <button @click="fileInput?.click()" class="flex flex-col justify-center items-center border rounded-md text-[12px] text-gray-500">
                    <Icon icon="material-symbols:image-outline" width="30" height="30" />
                    Add Image 
                </button>
            </div>
        </div>
    </div>
</div>

<!-- MOBILE -->
<div v-if="eImage" class="md:hidden fixed inset-0 z-50">
    <div @click="cancelChange" class="absolute inset-0 bg-black/50"></div>
    <div class="absolute bottom-0 left-0 w-full bg-white rounded-t-2xl py-5 transition-transform duration-300 ease-out"
        :style="{ height: '80%', transform: isDragging ? `translateY(${Math.max(0, currentY - startY)}px)` : 'translateY(0)'}"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
    >
        <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3"></div>
        <div ref="scrollContainer" class="flex flex-col h-full justify-between gap-2 p-4 overflow-y-auto">
            <div class="w-full rounded-md flex flex-col gap-3">
                <div v-if="loadingImages" class="flex flex-col gap-2 md:hidden">
                    <div v-for="i in 3" :key="i" class="animate-pulse bg-white rounded-2xl shadow p-3 pb-4">
                        <div class="w-full h-40 bg-gray-200 rounded-xl mb-2"></div>
                    </div>
                </div>
                <button v-else v-for="img in venueImage" @click.stop="activeDropdown = activeDropdown === img.id ? null : img.id" 
                    class="flex flex-col gap-2 relative items-center justify-center">
                    <img :src="img.image_url" class="w-full object-cover rounded-md shadow" 
                        :class="img.is_primary ? 'border bg-blue-900 p-2' : ''"
                    >
                    <div v-if="activeDropdown === img.id" class="absolute w-full h-full z-20 bg-black/50 text-white hover:bg-black flex flex-col items-center justify-center gap-2">
                        <button @click.stop="selectPrimary(img)" v-if="!img.is_primary" 
                            class="flex items-center bg-gray-200 text-gray-800 rounded-full p-1 px-2 text-[12px] font-semibold">
                            Set Default
                        </button>
                        <button @click.stop="selectRemove(img)" class="flex items-center bg-red-800 text-white rounded-full p-1 px-3 text-[12px] font-semibold">
                            Remove 
                            <Icon icon="iconamoon:trash" width="15" height="15" />
                        </button>
                    </div>
                </button>
            </div>
            <input 
            type="file" 
            ref="fileInput"
            class="hidden"
            accept="image/*"
            @change="handleFileChange"
            />
            <button @click="fileInput?.click()" class="rounded-md text-sm text-white bg-blue-900 p-2 font-semibold mt-2">
                Add Image 
            </button>
        </div>
    </div>
</div>


<div v-if="viewImageModal" class="max-[1000px]:hidden fixed inset-0 z-50 flex items-center justify-center">
    <div @click="viewImageModal = false" class="absolute inset-0 bg-black/50"></div>
    <div class="w-[800px] relative p-2 rounded-md">
        <div class="relative w-full">
            <button @click="viewImageModal = false" class="absolute top-2 right-2 z-10 bg-black/50 text-white rounded-full p-1 hover:bg-black">
                <Icon icon="ic:baseline-close" width="20" height="20" />
            </button>
            <img :src="selectedImage?.image_url" class="rounded-md w-full">
        </div>
    </div>
</div>

<div v-if="eHour" class="max-[1000px]:hidden fixed inset-0 z-50 flex items-center justify-center text-sm">
    <div @click="cancelChange" class="absolute inset-0 bg-black/50"></div>

    <div class="w-[600px] absolute px-5 pb-5 bg-white rounded-md flex flex-col gap-3">
        <div class="flex justify-between border-b pb-3 mb-2 mt-3">
            <h1 class="text-sm font-bold ">Edit Operational Hour</h1>
            <button @click="cancelChange" class="text-gray-500 hover:text-black"><Icon icon="ic:baseline-close" width="20" height="20" /></button>
        </div>
        <div class="flex flex-col w-full">
           <div v-for="hour in operationalHour" class="border-b p-4">
                <div class="flex justify-between">
                    <div class="flex flex-col">
                        <p class="font-semibold">{{ getDayName(hour.day_of_week) }}</p>
                        <div class="flex items-center gap-1">
                            <p v-if="hour.open_time">{{ hour.open_time }} - {{ hour.close_time }}</p>
                            <p v-else>Time is unset</p>
                            <button class="text-gray-500 hover:text-black"><Icon icon="uil:setting" width="15" height="15" /></button>
                        </div>
                    </div>
                    <div class="flex">
                        <label>
                            <input 
                            type="radio" 
                            :name="'status-' + hour.day_of_week"
                            value="closed"
                            v-model="hour.is_closed"
                            class="hidden"
                            @change="setClose(hour.day_of_week)"
                            />
                            <span 
                            class="px-2 p-1 text-[12px] font-semibold rounded-tl-full rounded-bl-full cursor-pointer border"
                            :class="hour.is_closed 
                                ? 'bg-gray-400 text-white' 
                                : 'bg-gray-100 text-gray-600'"
                            >
                            Closed
                            </span>
                        </label>
                        <label>
                            <input 
                            type="radio" 
                            :name="'status-' + hour.day_of_week"
                            value="open"
                            v-model="hour.is_closed"
                            class="hidden"
                            @change="setOpen(hour.day_of_week)"
                            />
                            <span 
                            class="px-2 p-1 text-[12px] font-semibold rounded-tr-full rounded-br-full cursor-pointer border"
                            :class="!hour.is_closed 
                                ? 'bg-green-700 text-white' 
                                : 'bg-gray-100 text-gray-600'"
                            >
                            Open
                            </span>
                        </label>
                    </div>
                </div>
           </div>
        </div>
    </div>
</div>

<!-- DESKTOP -->
<div v-if="eBank" class="max-[1000px]:hidden fixed inset-0 z-50 flex items-center justify-center text-sm">
    <div @click="cancelChange" class="absolute inset-0 bg-black/50"></div>

    <div class="w-[600px] absolute px-5 pb-5 bg-white rounded-md flex flex-col gap-3">
        <div class="flex justify-between border-b pb-3 mt-3">
            <div class="flex items-center gap-3">
                <h1 class="text-sm font-bold ">Bank Accounts</h1>
                
            </div>
            <button @click="cancelChange" class="text-gray-500 hover:text-black"><Icon icon="ic:baseline-close" width="20" height="20" /></button>
        </div>
        <div class="flex flex-col w-full">
           <button @click="selectBank(bank.id)" v-for="bank in bankAccount" :key="bank.id" class="flex items-center justify-between border-b p-4 gap-4 relative"
                :class="bank.status == 'Main' ? 'bg-gray-100' : ''">
                <img :src="`/bank/${bank.bank_type}.png`" class="w-[70px] h-[20px]">
                <p class="mt-1 text-sm">{{ bank.bank_account }}</p>
                <p class="text-gray-400 text-[12px]">{{ bank.holder_name }}</p>
           </button>
        </div>
        <div class="flex justify-between items-center">
            <p class="text-[12px] text-gray-500">You can only add up to 3 bank account</p>
            <button :disabled="bankAccount.length == 3" 
                class="bg-blue-900 text-white p-1 px-2 text-[12px] rounded-md"
                :class="bankAccount.length == 3 ? 'bg-gray-400' : 'hover:bg-blue-800'"
            >
                Add More Account
            </button>
        </div>
    </div>
</div>

<!-- MOBILE -->
<div v-if="eBank" class="md:hidden fixed inset-0 z-50">
    <div @click="cancelChange" class="absolute inset-0 bg-black/50"></div>
    <div class="absolute bottom-0 left-0 w-full bg-white rounded-t-2xl py-5 transition-transform duration-300 ease-out"
        :style="{ height: '80%', transform: isDragging ? `translateY(${Math.max(0, currentY - startY)}px)` : 'translateY(0)'}"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
    >
        <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3"></div>
        <div ref="scrollContainer" class="flex flex-col h-full justify-between gap-2 p-4 overflow-y-auto">
            <div class="flex flex-col w-full">
                <div @click="selectBank(bank.id)" v-for="bank in bankAccount" :key="bank.id" class="flex items-center justify-between border-b p-4 gap-4 relative"
                    :class="bank.status == 'Main' ? 'bg-gray-100' : ''">
                    <img :src="`/bank/${bank.bank_type}.png`" class="w-[70px] h-[20px]">
                    <p class="mt-1 text-sm">{{ bank.bank_account }}</p>
                    <p class="text-gray-400 text-[12px]">{{ bank.holder_name }}</p>
                </div>
            </div>
            <div class="flex flex-col gap-2">
                <p class="text-[12px] text-gray-500">You can only add up to 3 bank account</p>
                <button :disabled="bankAccount.length == 3" 
                    class="bg-blue-900 text-white p-2 font-semibold text-[12px] rounded-md"
                    :class="bankAccount.length == 3 ? 'bg-gray-400' : 'hover:bg-blue-800'"
                >
                    Add More Account
                </button>
            </div>
        </div>
    </div>
</div>


</template>
