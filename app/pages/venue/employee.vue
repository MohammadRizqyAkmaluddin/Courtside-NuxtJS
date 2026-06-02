<script setup lang="ts">
definePageMeta({
    layout: 'venue'
})

import type {  ApiResponse, Employee } from '~/types';
import { ref, onMounted } from 'vue';
import { api } from '~/services/api';
import { Icon } from '@iconify/vue';

// VARIABLES
const employee = ref<Employee[]>([])
const positions = ref<any | null>()
const amount = ref<number | null>(null)
const showAddEmployee = ref(false)
const modalStartDate = ref<string | null>(null)
const showModify = ref(false)
const selectedEmployee = ref<any | null>(null)
const activeDropdown = ref<number | null>(null)

// LOADING STATE
const loadingEmployees = ref(false)

// BUTTON CONTROL
const openAddEmployee = () => {
  showAddEmployee.value = true
}
const closeAddEmployee = () => {
  showAddEmployee.value = false
}
const openModify = (e: Employee) => {
  showModify.value = true
  selectedEmployee.value = e
}
const closeModify = () => {
  showModify.value = false
  selectedEmployee.value = null
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
    closeAddEmployee()
  }
  isDragging.value = false
  currentY.value = 0
}


// UTILS
const formattedAmount = ref('')

const formatRupiah = (value: string) => {
  const number = value.replace(/\D/g, '')
  if (!number) return ''
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(Number(number))
}

const onInputAmount = (e: Event) => {
  const target = e.target as HTMLInputElement

  const raw = target.value.replace(/\D/g, '')

  amount.value = raw ? Number(raw) : null
  formattedAmount.value = raw ? formatRupiah(raw) : ''
}


function formatPhoneNumber(phone: any) {
  if (!phone) return ''
  const cleaned = phone.toString().replace(/\D/g, '')
  if (cleaned.length <= 4) return cleaned
  const parts = []
  for (let i = 0; i < cleaned.length; i += 4) {
    parts.push(cleaned.substring(i, i + 4))
  }
  return parts.join('-')
}

const getInitials = (name: string) => {
    if (!name) return '';
    const words = name.trim().split(' ');
    const firstTwo = words.slice(0, 2);
    return firstTwo.map(w => w[0]?.toUpperCase()).join('');
};

const colors = [
    'bg-blue-900',
];

const getColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};
const formatFullDate = (dateStr: string | null) => {
  if (!dateStr) return 'Select Date'
  const date = new Date(dateStr)

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}


// FORM
const employeeFilter = reactive({
  search: '',
  position: '',
  salary: ''
})

const addEmployeeForm = reactive({
  name: '',
  position: '',
  phone_number: '',
  gender: '',
  bod: '',
  religion: '',
  salary: ''
})

const modifyEmployeeForm = reactive({
  name: selectedEmployee.value || '',
  position: selectedEmployee.value,
  phone_number: '',
  gender: '',
  bod: '',
  religion: '',
  salary: ''
})

// SUBMIT
const addEmployee = async () => {
  try {
    await api('/employee/addEmployee', {
      method: 'POST',
      body: {
        name: addEmployeeForm.name,
        position: addEmployeeForm.position,
        phone_number: addEmployeeForm.phone_number,
        gender: addEmployeeForm.gender,
        bod: addEmployeeForm.bod,
        religion: addEmployeeForm.religion,
        salary: amount.value
      }
    })

    fetchEmployee()

    addEmployeeForm.name = ''
    addEmployeeForm.position = ''
    addEmployeeForm.phone_number = ''
    addEmployeeForm.gender = ''
    addEmployeeForm.bod = ''
    addEmployeeForm.religion = ''
    amount.value = null

    showAddEmployee.value = false
  } catch(e) {
    console.error(e)
  }
}

const modifyEmployee = async () => {
  try {
    await api('/employee/modify', {
      method: 'POST',
      body: {

      }
    })
  } catch (e) {
    console.error(e)
  }
}

// DATA FETCHER
const fetchEmployee = async () => {
    loadingEmployees.value = true
    try {
      const res: ApiResponse<Employee[]> = await api('/employee/indexEmployee', {
        query: {
          search: employeeFilter.search || undefined,
          position: employeeFilter.position || undefined,
          salary: employeeFilter.salary || undefined
        }
      })
      employee.value = res.data
    } catch (e) {
      console.error(e)
    } finally {
      loadingEmployees.value = false
    }
}

const fetchPosition = async () => {
  try {
    positions.value = await api('/employee/getPositions')
  } catch(e) {
    console.error(e)
  }
}

onMounted(fetchPosition)
onMounted(fetchEmployee)
</script>

<template>

  <div class="flex flex-col gap-3 h-full w-full text-sm">
    <div class="flex flex-col md:flex-row justify-between w-full bg-white rounded-md p-3 gap-3">
      <div class="flex flex-col lg:flex-row gap-3 w-full md:w-2/3">
        <div class="flex items-center border border-gray-300 px-2 gap-2 rounded-full text-[12px] w-full">
            <Icon icon="glyphs:search-1-outline" class="text-gray-400" width="30" height="30" />
            <input 
              v-model="employeeFilter.search"
              @input="fetchEmployee"
              placeholder="Search Employee Name"
              class="py-2 outline-none w-full"
            />
        </div>
        <div class="flex gap-2 w-full">
            <div class="flex py-1 w-full text-[12px] items-center border border-gray-300 rounded-full px-2">
                <select v-model="employeeFilter.salary"
                @change="fetchEmployee"
                  class="text-gray-400 appearance-none px-5 w-full focus:outline-none"
                >
                    <option value="">Salary</option>
                    <option value="highest">Highest Salary</option>
                    <option value="lowest">Lowest Salary</option>
                </select>
            </div>
            <div class="flex py-1 w-full text-[12px] items-center border border-gray-300 rounded-full px-2">
                <select v-model="employeeFilter.position"
                  @change="fetchEmployee"
                    class="text-gray-400 appearance-none px-5 w-full focus:outline-none"
                >
                    <option value="">Position</option>
                    <option v-for="p in positions" :value="p">{{ p }}</option>

                </select>
            </div>
        </div>
      </div>
      <button @click="openAddEmployee" class="w-full md:w-1/5 bg-blue-900 text-white font-semibold p-2 rounded-md text-[12px]">
        Add Employee
      </button>
    </div>
    <div v-if="loadingEmployees">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="p-4 rounded-xl shadow bg-white animate-pulse flex flex-col gap-4">
          <div class="bg-gray-200 rounded-md p-3 flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gray-100 p-2"></div>
            <div class="flex flex-col gap-2 w-full">
              <div class="h-3 bg-gray-100 rounded w-40"></div>
              <div class="h-3 bg-gray-100 rounded w-28"></div>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <div class="h-3 bg-gray-100 rounded w-40"></div>
            <div class="h-3 bg-gray-100 rounded w-32"></div>
            <div class="h-3 bg-gray-100 rounded w-44"></div>
            <div class="h-3 bg-gray-100 rounded w-36"></div>
            <div class="h-3 bg-gray-100 rounded w-28"></div>
          </div>
          <div class="flex justify-between items-center mt-2">
            <div class="h-3 bg-gray-100 rounded w-16"></div>
            <div class="h-4 bg-gray-100 rounded w-28"></div>
          </div>

        </div>

      </div>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
      <button v-for="e in employee" @click.stop="activeDropdown = activeDropdown === e.id ? null : e.id" class="relative flex flex-col gap-2 relative justify-center"
        >
        <div class="flex flex-col p-3 bg-white rounded-md gap-3 shadow hover:shadow-md"
          :class="activeDropdown === e.id ? 'blur-[2px]' : ''">
          <div class="flex items-center gap-3 bg-blue-900 text-white rounded-md p-2">
            <span :class="['flex items-center bg-white text-blue-900 justify-center rounded-full text-[16px] font-bold w-9 h-9 shrink-0', getColor(e.name)]">
              {{ getInitials(e.name) }}
            </span>
            <div class="flex flex-col leading-snug items-start text-white">
              <p class="font-semibold text-xs">{{ e.name }}</p>
              <p class="text-[12px] text-gray-300">{{ e.position }}</p>
            </div>
          </div>
          <div class="flex text-[12px] px-2">
            <div class="flex flex-col w-[70px] items-start">
              <p>Contact:</p>
              <p>Gender:</p>
              <p>Birth Date:</p>
              <p>Religion:</p>
              <p>Hired:</p>
            </div>
            <div class="flex flex-col items-start">
              <p>{{ formatPhoneNumber(e.phone_number) }}</p>
              <p v-if="e.gender == 'M'">Male</p>
              <p v-else-if="e.gender == 'F'">Female</p>
              <p>{{ formatDate(e.bod) }}</p>
              <p>{{ e.religion }}</p>
              <p>{{formatDate(e.created_at)}}</p>
            </div>
          </div>
          <div class="flex justify-between items-center px-2">
            <p>Salary</p>
            <p class="font-semibold">Rp {{ formatNumber(e.salary) }}</p>
          </div>
        </div>
        <div v-if="activeDropdown === e.id" class="absolute w-full h-full z-20 bg-black/50 text-white rounded-md flex flex-col items-center justify-center gap-2">
          <button @click="openModify(e)" class="flex items-center bg-white text-gray-800 rounded-full p-1 px-2 text-[12px] font-semibold">
            Customize
          </button>
          <button class="flex gap-1 items-center bg-red-800 text-white rounded-full p-1 px-3 text-[12px] font-semibold hover:bg-red-700">
              Remove 
              <Icon icon="iconamoon:trash" width="13" height="13" />
          </button>
        </div>
      </button>
      
    </div>
  </div>

<div v-if="showModify" class="max-[1000px]:hidden fixed inset-0 z-50 flex items-center justify-center text-sm">
  <div @click="closeModify" class="absolute inset-0 bg-black/50"></div>

  <div class="absolute w-[500px] px-5 pb-5 bg-white rounded-md flex flex-col gap-3">
      <div class="flex justify-between border-b bg-blue-900 text-white rounded-md p-2 w-full mt-3 w-full">
          <div class="flex items-center gap-3">
            <span :class="['flex items-center bg-white text-blue-900 justify-center rounded-full text-[16px] font-bold w-9 h-9 shrink-0', getColor(selectedEmployee.name)]">
              {{ getInitials(selectedEmployee.name) }}
            </span>
            <div class="flex flex-col leading-snug items-start text-white">
              <p class="font-semibold text-xs">{{ selectedEmployee.name }}</p>
              <p class="text-[12px] text-gray-300">{{ selectedEmployee.position }}</p>
            </div>
          </div>
          <button @click="closeModify" class="text-white"><Icon icon="ic:baseline-close" width="20" height="20" /></button>
      </div>
      <input v-model="modifyEmployeeForm.name" type="text" :placeholder="selectedEmployee.name" class="border px-3 py-2 text-sm rounded-md focus:outline-none"/>
      <input v-model="modifyEmployeeForm.phone_number" type="text" :placeholder="formatPhoneNumber(selectedEmployee.phone_number)" class="border px-3 py-2 text-sm rounded-md focus:outline-none"/>
      
      <div class="flex gap-2 w-full">
        <div class="flex flex-col gap-2 border rounded-md items-start p-5 relative overflow-hidden w-full"
          :class="modifyEmployeeForm.bod ? 'text-black' : 'text-gray-400'">
          <div class="flex items-center gap-3">
            <Icon icon="fontisto:date" width="34" height="34" />
            <div class="flex flex-col items-start">
              <input 
              type="date"
              v-model="modifyEmployeeForm.bod"
              class="absolute inset-0 w-full h-full opacity-0 z-50"
              />
              <p class="text-xs">Date of birth</p>
              <p v-if="selectedEmployee.bod" class="text-sm font-semibold">{{ formatDate(selectedEmployee.bod) }}</p>
              <div v-else class="text-sm font-semibold pointer-events-none">
                {{ formatFullDate(modalStartDate) }}
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2 text-sm w-full">
          <select v-model="modifyEmployeeForm.gender" class="appearance-none border rounded-md p-2 px-3 w-full focus:outline-none"
            :class="modifyEmployeeForm.gender ? 'text-gray-400' : 'text-black'">
            <option value="">Gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
          <select v-model="modifyEmployeeForm.religion" class="appearance-none border rounded-md p-2 px-3 w-full focus:outline-none"
          :class="modifyEmployeeForm.religion ? 'text-gray-400' : 'text-black'">
            <option value="">Religion</option>
            <option value="Islam">Islam</option>
            <option value="Christion">Christian</option>
            <option value="Catholic">Catholic</option>
            <option value="Buddha">Buddha</option>
            <option value="Hindu">Hindu</option>
          </select>
        </div>
      </div>
      <input v-model="modifyEmployeeForm.position" type="text" placeholder="Position" class="border px-3 py-2 rounded-md focus:outline-none"/>
      <input type="text"
          :value="formattedAmount"
          @input="onInputAmount"
          inputmode="numeric"
          :placeholder="'Salary'"
          class="w-full border p-3 rounded-md focus:outline-none"
      />
      <button @click="modifyEmployee" class="bg-blue-900 text-white font-semibold text-sm rounded-md p-2">Submit</button>
  </div>
</div>

<div v-if="showAddEmployee" class="max-[1000px]:hidden fixed inset-0 z-50 flex items-center justify-center text-sm">
  <div @click="closeAddEmployee" class="absolute inset-0 bg-black/50"></div>

  <div class="absolute w-[500px] px-5 pb-5 bg-white rounded-md flex flex-col gap-3">
      <div class="flex justify-between border-b pb-3 mt-3">
          <h1 class="text-sm font-bold ">Add New Employee</h1>
          <button @click="closeAddEmployee" class="text-gray-500 hover:text-black"><Icon icon="ic:baseline-close" width="20" height="20" /></button>
      </div>
      <input v-model="addEmployeeForm.name" type="text" placeholder="Employee Name" class="border px-3 py-2 text-sm rounded-md focus:outline-none"/>
      <input v-model="addEmployeeForm.phone_number" type="text" placeholder="Phone Number" class="border px-3 py-2 text-sm rounded-md focus:outline-none"/>
      
      <div class="flex gap-2 w-full">
        <div class="flex flex-col gap-2 border rounded-md items-start p-5 relative overflow-hidden w-full"
          :class="addEmployeeForm.bod ? 'text-black' : 'text-gray-400'">
          <div class="flex items-center gap-3">
            <Icon icon="fontisto:date" width="34" height="34" />
            <div class="flex flex-col items-start">
              <input 
              type="date"
              v-model="addEmployeeForm.bod"
              class="absolute inset-0 w-full h-full opacity-0 z-50"
              />
              <p class="text-xs">Date of birth</p>
              <p v-if="addEmployeeForm.bod" class="text-sm font-semibold text-black">{{ formatDate(addEmployeeForm.bod) }}</p>
              <div v-else class="text-sm font-semibold pointer-events-none">
                {{ formatFullDate(modalStartDate) }}
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2 text-sm w-full">
          <select v-model="addEmployeeForm.gender" class="appearance-none border rounded-md p-2 px-3 w-full focus:outline-none"
            :class="addEmployeeForm.gender ? 'text-black' : 'text-gray-400'">
            <option value="">Gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
          <select v-model="addEmployeeForm.religion" class="appearance-none border rounded-md p-2 px-3 w-full focus:outline-none"
          :class="addEmployeeForm.religion ? 'text-black' : 'text-gray-400'">
            <option value="">Religion</option>
            <option value="Islam">Islam</option>
            <option value="Christion">Christian</option>
            <option value="Catholic">Catholic</option>
            <option value="Buddha">Buddha</option>
            <option value="Hindu">Hindu</option>
          </select>
        </div>
      </div>
      <input v-model="addEmployeeForm.position" type="text" placeholder="Position" class="border px-3 py-2 rounded-md focus:outline-none"/>
      <input type="text"
          :value="formattedAmount"
          @input="onInputAmount"
          inputmode="numeric"
          :placeholder="'Salary'"
          class="w-full border p-3 rounded-md focus:outline-none"
      />
      <button @click="addEmployee" class="bg-blue-900 text-white font-semibold text-sm rounded-md p-2">Submit</button>
  </div>
</div>

<div v-if="showAddEmployee" class="md:hidden fixed inset-0 z-50">
  <div @click="closeAddEmployee" class="absolute inset-0 bg-black/50"></div>
  <div class="absolute bottom-0 left-0 w-full bg-white rounded-t-2xl py-5 transition-transform duration-300 ease-out"
      :style="{ height: '80%', transform: isDragging ? `translateY(${Math.max(0, currentY - startY)}px)` : 'translateY(0)'}"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
  >
      <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3"></div>
      <div ref="scrollContainer" class="flex flex-col h-full justify-between gap-2 p-4 overflow-y-auto">
        
      </div>
  </div>
</div>

</template>