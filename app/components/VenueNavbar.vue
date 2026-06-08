<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, onMounted, onBeforeUnmount} from 'vue'

const authVenue = useAuthVenueStore()

const route = useRoute()

const isFinance = computed(() => 
  route.path.startsWith('/venue/finance')
)
const isCourt = computed(() => 
  route.path.startsWith('/venue/court')
)
const isStore = computed(() => 
  route.path.startsWith('/venue/store')
)
const isBooking = computed(() => 
  route.path.startsWith('/venue/booking')
)
const isEmployee = computed(() => 
  route.path.startsWith('/venue/employee')
)
const isMessage = computed(() => 
  route.path.startsWith('/venue/message')
)
const isSetting = computed(() => 
  route.path.startsWith('/venue/setting')
)
const isHelp = computed(() => 
  route.path.startsWith('/venue/help')
)
const isNotification = computed(() => 
  route.path.startsWith('/venue/notification')
)

const logout = () => {
    authVenue.logout()
    navigateTo('/')
}

const mobileMenu = ref(false)
const toggleMenu = () => mobileMenu.value = !mobileMenu.value
const closeMenu = () => mobileMenu.value = false
</script>

<template>
  <!-- Wrapper -->
  <div>

    <!-- 🔝 Navbar -->
    <div class="fixed top-0 right-0 z-50 flex items-center justify-between w-full px-[20px] min-[1000px]:ps-[227px] min-[1000px]:pe-[40px] py-1 min-[1000px]:py-4 max-[1000px]:mt-3 min-[1000px]:pt-5 min-[1000px]:bg-white min-[1000px]:border-b">
      <div class="hidden min-[1000px]:flex gap-2 text-sm font-semibold text-blue-900">
        <p class="text-gray-500 font-light">Dashboard</p>
        <p>/</p>
        <p v-if="isFinance">Finance</p>
        <p v-else-if="isCourt">Court Management</p>
        <p v-else-if="isStore">Store</p>
        <p v-else-if="isBooking">Booking</p>
        <p v-else-if="isEmployee">Employment</p>
        <p v-else-if="isMessage">Message</p>
        <p v-else-if="isSetting">Setting</p>
      </div>
      <button class="min-[1000px]:hidden" @click="toggleMenu">
          <Icon icon="mdi:menu" class="w-5 h-5"/>
      </button>
      <NuxtLink to="#"><img src="/logo-cms.png" class="min-[1000px]:hidden w-[120px] ms-4 lg:w-[170px]"></NuxtLink>
      <div class="hidden min-[1000px]:flex gap-3 items-center">
        <button class="bg-white rounded-full p-2 text-gray-400">
          <Icon icon="mdi:bell-outline" width="20" height="20" class="hover:text-gray-600"/>
        </button>
        <NuxtLink to="/venue/setting" class="bg-white rounded-full p-2 text-gray-400">
          <Icon icon="proicons:settings" width="20" height="20" class="hover:text-gray-600"/>
        </NuxtLink>
        <img v-if="authVenue.venue?.first_image?.image_url" :src="authVenue.venue.first_image.image_url" class="w-[80px] h-[40px] object-cover rounded-full">
      </div>
      <div class="hidden max-[1000px]:flex gap-3 items-center">
        <img v-if="authVenue.venue?.first_image?.image_url" :src="authVenue.venue.first_image.image_url" class="w-[40px] h-[40px] object-cover rounded-full">
      </div>
    </div>

    <div v-if="mobileMenu" class="fixed inset-0 bg-black/60 z-50" @click="closeMenu"></div>

    <!-- Drawer -->
    <div :class="[ 'min-[1000px]:hidden fixed top-0 left-0 h-full pt-5 w-[15%] max-w-[320px] bg-white z-50 shadow-xl transform transition-transform duration-300',  
      mobileMenu ? 'translate-x-0' : 'translate-x-[-290px]']">

        <div class="flex flex-col justify-between items-center min-h-full py-5">
          
          <nav class="flex flex-col gap-4 w-fit text-gray-400 items-center">
            <NuxtLink to="/venue/finance" class="p-2 rounded-full transition-colors" :class="isFinance ? 'bg-blue-900 text-white' : 'bg-white hover:text-gray-600'">
              <Icon icon="si:wallet-detailed-line" width="15" height="15" />
            </NuxtLink>
            <NuxtLink to="/venue/court" class="p-2 rounded-full transition-colors" :class="isCourt ? 'bg-blue-900 text-white' : 'bg-white hover:text-gray-600'">
              <Icon icon="ph:court-basketball" width="15" height="15" />
            </NuxtLink>
            <NuxtLink to="/venue/store" class="p-2 rounded-full transition-colors" :class="isStore ? 'bg-blue-900 text-white' : 'bg-white hover:text-gray-600'">
              <Icon icon="roentgen:marketplace" width="15" height="15" />
            </NuxtLink>
            <NuxtLink to="/venue/booking" class="p-2 rounded-full transition-colors" :class="isBooking ? 'bg-blue-900 text-white' : 'bg-white hover:text-gray-600'">
              <Icon icon="icon-park-outline:transaction-order" width="15" height="15" />
            </NuxtLink>
            <NuxtLink to="/venue/employee" class="p-2 rounded-full transition-colors" :class="isEmployee ? 'bg-blue-900 text-white' : 'bg-white hover:text-gray-600'">
              <Icon icon="clarity:employee-solid" width="15" height="15" />
            </NuxtLink>
            <NuxtLink to="/venue/message" class="p-2 rounded-full transition-colors" :class="isMessage ? 'bg-blue-900 text-white' : 'bg-white hover:text-gray-600'">
              <Icon icon="tabler:message" width="15" height="15" />
            </NuxtLink>
            <NuxtLink to="/venue/notification" class="p-2 rounded-full transition-colors" :class="isNotification ? 'bg-blue-900 text-white' : 'bg-white hover:text-gray-600'">
              <Icon icon="mdi:bell-outline" width="15" height="15" />
            </NuxtLink>
            <NuxtLink to="/venue/cs" class="p-2 rounded-full transition-colors" :class="isHelp ? 'bg-blue-900 text-white' : 'bg-white hover:text-gray-600'">
              <Icon icon="streamline:customer-support-1" width="15" height="15" />
            </NuxtLink>
            <NuxtLink to="/venue/setting" class="p-2 rounded-full transition-colors" :class="isSetting ? 'bg-blue-900 text-white' : 'bg-white hover:text-gray-600'">
              <Icon icon="proicons:settings" width="15" height="15" />
            </NuxtLink>
          </nav>
          <button @click="logout" class="bg-white p-2 rounded-full text-gray-400">
            <Icon icon="ant-design:logout-outlined" width="15" height="15" />
          </button>
        </div>
    </div>

    <!-- 🧱 Sidebar -->
    <aside class="max-[1000px]:hidden fixed bg-white h-full py-[35px] left-0 h-[calc(100%-2rem)] flex flex-col justify-between w-[200px] ps-[5px] z-50 border-e">
      
      <!-- Menu -->
      <div class="flex flex-col justify-between h-full text-blue-900">
        <nav class="flex flex-col gap-2">
          <div class="flex items-center justify-center mb-10">
            <NuxtLink class="cursor-pointer"><img src="/logo-cms.png" class="w-[140px]"></NuxtLink>
          </div>
          <NuxtLink to="/venue/finance" class="flex gap-2 items-center rounded-tl-full rounded-bl-full p-3 transition-colors" :class="isFinance ? 'bg-blue-900 text-white' : 'bg-white hover:bg-gray-100'">
            <Icon icon="si:wallet-detailed-line" width="20" height="20" />
            <p class="text-sm">Finance</p>
          </NuxtLink>
          <NuxtLink to="/venue/court" class="flex gap-2 items-center rounded-tl-full rounded-bl-full p-3 transition-colors" :class="isCourt ? 'bg-blue-900 text-white' : 'bg-white hover:bg-gray-100'">
            <Icon icon="ph:court-basketball" width="20" height="20" />
            <p class="text-sm">Court Management</p>
          </NuxtLink>
          <NuxtLink to="/venue/store" class="p-3 flex gap-2 items-center rounded-tl-full rounded-bl-full transition-colors" :class="isStore ? 'bg-blue-900 text-white' : 'bg-white hover:bg-gray-100'">
            <Icon icon="lsicon:marketplace-outline" width="20" height="20" />
            <p class="text-sm">Venue Store</p>
          </NuxtLink>
          <NuxtLink to="/venue/booking" class="p-3 flex gap-2 items-center rounded-tl-full rounded-bl-full transition-colors" :class="isBooking ? 'bg-blue-900 text-white' : 'bg-white hover:bg-gray-100'">
            <Icon icon="icon-park-outline:transaction-order" width="20" height="20" />
            <p class="text-sm">Booking</p>
          </NuxtLink>
          <NuxtLink to="/venue/employee" class="p-3 flex gap-2 items-center rounded-tl-full rounded-bl-full transition-colors" :class="isEmployee ? 'bg-blue-900 text-white' : 'bg-white hover:bg-gray-100'">
            <Icon icon="clarity:employee-solid" width="20" height="20" />
            <p class="text-sm">Employment</p>
          </NuxtLink>
          <NuxtLink to="/venue/message" class="p-3 flex gap-2 items-center rounded-tl-full rounded-bl-full transition-colors" :class="isMessage ? 'bg-blue-900 text-white' : 'bg-white hover:bg-gray-100'">
            <Icon icon="tabler:message" width="20" height="20" />
            <p class="text-sm">Message</p>
          </NuxtLink>
          <NuxtLink to="/venue/cs" class="p-3 flex gap-2 items-center rounded-tl-full rounded-bl-full transition-colors" :class="isHelp ? 'bg-blue-900 text-white' : 'bg-white hover:bg-gray-100'">
            <Icon icon="streamline:customer-support-1" width="20" height="20" />
            <p class="text-sm">Courtside Helper</p>
          </NuxtLink>
          <NuxtLink to="/venue/setting" class="p-3 flex gap-2 items-center rounded-tl-full rounded-bl-full transition-colors" :class="isSetting ? 'bg-blue-900 text-white' : 'bg-white hover:bg-gray-100'">
            <Icon icon="proicons:settings" width="20" height="20" />
            <p class="text-sm">Setting</p>
          </NuxtLink>
        </nav>
        <button @click="logout" class="bg-white p-3 flex gap-2 items-center rounded-tl-full rounded-bl-full transition-colors hover:bg-gray-100">
          <Icon icon="ant-design:logout-outlined" width="20" height="20" />
          <p class="text-sm">Log out</p>
        </button>
      </div>

    </aside>

  </div>
</template>