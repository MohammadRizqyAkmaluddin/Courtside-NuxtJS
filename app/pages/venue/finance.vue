<script setup lang="ts">
definePageMeta({
    layout: 'venue'
})

import {
  Chart,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  Tooltip,
  Filler
} from 'chart.js'

Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LogarithmicScale,
  LinearScale,
  Tooltip,
  Filler
)

import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import type {  Balance,  ApiResponse, PendingWithdraw, BankAccount, WithdrawHistory, ProductIncomeChart, ProductIncomeOverview  } from '~/types'
import { api } from '~/services/api'
import { formatNumber } from '#imports'
import IncomeChart from '~/components/IncomeChart.vue'



const loading = ref(false)
const loadingHistory = ref(false)
const loadingChart = ref(true)
const loadingBarChart = ref(true)

const balance = ref<Balance | null>(null)
const bankAccount = ref<BankAccount[]>([])
const mainBankAccount = ref<BankAccount | null>(null)
const amount = ref<number | null>(null)
const formattedAmount = ref('')
const pendingExists = ref<PendingWithdraw | null>(null)
const histories = ref<WithdrawHistory[]>([])

const showWithdraw = ref(false)
const showWithdrawDetail = ref(true)
const showChangeBank = ref(false)
const showPendingRequest = ref(false)
const showNewAccount = ref(false)
const showInputBank = ref(false)
const showInputEWallet = ref(false)

const scrollContainer = ref<HTMLElement | null>(null)

const startY = ref(0)
const currentY = ref(0)
const isDragging = ref(false)

const success = ref('')
const error = ref('')

// =========================
// 🔥 MODAL CONTROL
// =========================
const openWithdraw = () => {
  showWithdraw.value = true
  activeModal.value = 'withdraw'

  if (pendingExists.value) {
    showWithdrawDetail.value = false
    showPendingRequest.value = true
  } else {
    showWithdrawDetail.value = true
    showPendingRequest.value = false
  }
}
const closeWithdraw = () => {
  showWithdraw.value = false
  showWithdrawDetail.value = false
  showChangeBank.value = false
}
const openChange = () => {
  showChangeBank.value = true
  showWithdrawDetail.value = false
  error.value = ''
}
const closeChange = () => {
  showChangeBank.value = false
  showWithdrawDetail.value = true
}
const openNewAccount = () => {
  showNewAccount.value = true
  showChangeBank.value = false
  showWithdrawDetail.value = false
  error.value = ''
}
const closeNewAccount = () => {
  showNewAccount.value = false
  if (mainBankAccount.value) {
    showChangeBank.value = true
  } else {
    showChangeBank.value = false
    showWithdrawDetail.value = true
  }
}
const selectBank = () => {
  showInputBank.value = true
  showInputEWallet.value = false
  newAccountForm.account_type = 'Bank'
}
const selectEWallet = () => {
  showInputBank.value = false
  showInputEWallet.value = true
  newAccountForm.account_type = 'E-Wallet'
}

const activeModal = ref<'withdraw' | 'history' | null>(null)

// =========================
// 🔥 SWIPE DOWN CLOSE
// =========================
const isAtTop = ref(false)

const onTouchStart = (e: TouchEvent) => {
  const el = scrollContainer.value

  // cek apakah scroll lagi di paling atas
  isAtTop.value = el ? el.scrollTop === 0 : true

  startY.value = e.touches[0]?.clientY ?? 0

  // cuma aktif drag kalau scroll di atas
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
    if (activeModal.value === 'withdraw') {
      closeWithdraw()
    } else if (activeModal.value === 'history') {
      closeHistory()
    }
  }

  isDragging.value = false
  currentY.value = 0
}


// format ke Rupiah
const formatRupiah = (value: string) => {
  const number = value.replace(/\D/g, '')
  if (!number) return ''
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(Number(number))
}

// handle input
const onInputAmount = (e: Event) => {
  const target = e.target as HTMLInputElement

  const raw = target.value.replace(/\D/g, '')

  amount.value = raw ? Number(raw) : null
  formattedAmount.value = raw ? formatRupiah(raw) : ''
}

const fetchBalance = async () => {
  loading.value = true
  try {
    const res: ApiResponse<Balance> = await api('/balance')
    balance.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const fetchPendingExists = async () => {
    loading.value = true
    try {
        const res: ApiResponse<PendingWithdraw> = await api('/pending-exists')
        pendingExists.value = res.data
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const cancelRequest = async () => {
  try {
    await api('/cancel-request', {
      method: 'POST'
    })

    await fetchPendingExists()
    showPendingRequest.value = false
    showWithdrawDetail.value = true
  } catch (e) {
    console.error(e)
  }
}

const changeBank = async (id: number) => {
  try {
    await api('/change-bank-account', {
      method: 'POST',
      body: {
        venue_bank_account_id: id
      }
    }) 
    showChangeBank.value = false
    showWithdrawDetail.value = true

    await fetchMainBankAccount() 
    await fetchBankAccount() 
  } catch (e) {
    console.error(e)
  }
}

const fetchMainBankAccount = async () => {
  loading.value = true
  try {
    const res: ApiResponse<BankAccount> = await api('/main-bank-account')
    mainBankAccount.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// =========================
// 🔥 SUBMIT WITHDRAW
// =========================
const submitWithdraw = async () => {
  error.value = ''
  success.value = ''

  if (!amount.value || amount.value <= 0) {
    error.value = 'Input at least within the minimum amount'
    return
  }

  if (amount.value > (balance.value?.balance ?? 0)) {
    error.value = 'The amount exceeds your balance'
    return
  }

  if (amount.value < 10000) {
    error.value = 'Input at least within the minimum amount'
    return
  }
  if (mainBankAccount.value == null) {
    error.value = 'Please add new destination account'
    return
  }

  loading.value = true

  try {
    await api('/withdraw', {
      method: 'POST',
      body: {
        amount: amount.value
      }
    })

    await fetchBalance()
    await fetchPendingExists()
    amount.value = null
    showWithdrawDetail.value = false
    showPendingRequest.value = true
  } catch (err: any) {
    error.value = err?.data?.message || 'Terjadi error'
  } finally {
    loading.value = false
  }
}

const fetchBankAccount = async () => {
  loading.value = true
  try {
    const res: ApiResponse<BankAccount[]> = await api('/bank-account')
    bankAccount.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const newAccountForm = reactive({
    account_type: '',
    account_number: null,
    bank_type: '',
    account_name: ''
})

const addNewAccount = async () => {
  try {
    await api('/add-account', {
      method: 'POST',
      body: {
        account_number: newAccountForm.account_number,
        bank_type: newAccountForm.bank_type,
        account_type: newAccountForm.account_type
      }
    })
    
    await fetchBankAccount()
    await fetchMainBankAccount()

    showNewAccount.value = false
    showChangeBank.value = false
    showWithdrawDetail.value = true
  } catch (e) {
    console.error(e)
  }
}

const formatFullDate = (dateStr: string | null) => {
  if (!dateStr) return 'Select Date'
  const date = new Date(dateStr)

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const modalHistories = ref<WithdrawHistory[]>([])     // untuk modal (all data)
const startDate = ref<string | null>(null)
const endDate = ref<string | null>(null)

const modalStartDate = ref<string | null>(null)
const modalEndDate = ref<string | null>(null)


const modalLoading = ref(false)
const loadingMonthlyIncome = ref(false)

const currentPage = ref(1)
const totalPages = ref(1)
const perPage = ref(5)

const filter = ref('')              // buat card
const modalFilter = ref('')         // buat modal

const showHistoryModal = ref(false)

const fetchWDHistory = async () => {
  loadingHistory.value = true
  try {
    const params: any = {
      page: currentPage.value,
      per_page: perPage.value
    }

    if (filter.value) {
      params[filter.value] = true
    }

    const res: any = await api('/wd-history', { params })

    histories.value = res.data.data
    totalPages.value = res.data.last_page

  } catch (e) {
    console.error(e)
  } finally {
    loadingHistory.value = false
  }
}

const fetchModalHistory = async () => {
  modalLoading.value = true
  try {
    const params: any = {
      per_page: 1000
    }

    if (modalStartDate.value && modalEndDate.value) {
      params.start_date = modalStartDate.value
      params.end_date = modalEndDate.value
    }

    const res: any = await api('/wd-history', { params })

    modalHistories.value = res.data.data

  } catch (e) {
    console.error(e)
  } finally {
    modalLoading.value = false
  }
}


const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchWDHistory()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchWDHistory()
  }
}

const showHistories = ref(false)
const showHistoryFilter = ref(false)

const openHistory = () => {
  showHistoryModal.value = true
  showHistories.value = true
  showHistoryFilter.value = false
  activeModal.value = 'history'
  fetchModalHistory()
}

const openHistoryFilter = () => {
  showHistories.value = false
  showHistoryFilter.value = true
}

const confirmHistoryFilter = () => {
  showHistoryFilter.value = false
  showHistories.value = true
  fetchModalHistory()
}

const backToHistory = () => {
  showHistoryFilter.value = false
  showHistories.value = true
}

const closeHistory = () => {
  showHistories.value = false
  showHistoryFilter.value = false
  showHistoryModal.value = false
}

onMounted(fetchWDHistory)
onMounted(fetchBalance)
onMounted(fetchBankAccount)
onMounted(fetchMainBankAccount)
onMounted(fetchPendingExists)




const year = ref<any | null>(null)

const chartRef = ref<HTMLCanvasElement | null>(null)
const chartRefBar = ref<HTMLCanvasElement | null>(null)
let chartInstance: any = null

const selectedYear = ref(new Date().getFullYear())

const fetchIncomeChart = async () => {
  loadingMonthlyIncome.value = true // ✅ pindah ke sini

  try {
    const res: any = await api('/income/monthly', {
      params: { year: selectedYear.value }
    })

    const data = res.data
    year.value = res.year
    const currentMonth = new Date().getMonth()

    const chartData = data.map((item: any, index: number) => {
      return index <= currentMonth ? item.total : null
    })

    loadingMonthlyIncome.value = false 
    await nextTick()
    renderChart(chartData)

  } catch (e) {
    console.error(e)
    loadingMonthlyIncome.value = false
  }
}

const renderChart = (chartData: number[]) => {
  const labels = ['Jan','Feb','Mar','Apr', 'May', 'Jun', 'Jul']
  if (chartInstance) {
    chartInstance.destroy()
  }
  
  if (!chartRef.value) return
  chartInstance = new Chart(chartRef.value as HTMLCanvasElement, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Income',
          data: chartData,
          borderColor: '#0D66DC',
          backgroundColor: 'rgba(37,99,235,0.1)',
          tension: 0,
          fill: true,
          pointRadius: 3,
          spanGaps: false 
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          offset: false,
          grid: {
            display: false
          },
          border: {
            display: false
          },
          ticks: {
            color: '#9ca3af'
          }
        },
        y: {
          beginAtZero: false,
          suggestedMin: 2,
          suggestedMax: Math.max(...chartData.filter(v => v !== null)) * 1.3,
          ticks: {
            display: false,
            maxTicksLimit: 10
          },

          grid: {
            display: true,
            color: 'rgba(220, 220, 220, 0.14)',
            lineWidth: 7,
          },

          border: {
            display: false
          }
        }
      }
    }
  })
  
}
import { nextTick } from 'vue'


onMounted(async () => {
  await fetchIncomeChart()
})



const showIncome = ref(false)

const openIncome = () => {
  showIncome.value = true
}

const loadingProductIncome = ref(false)

const productIncome = ref<ProductIncomeOverview>()

const fetchProductIncome = async () => {
  loadingProductIncome.value = true
  try {
    const res: ApiResponse<ProductIncomeOverview> = await api('/income/productIncome')
    productIncome.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loadingProductIncome.value = false
  }
}

onMounted(fetchProductIncome)
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-col lg:flex-row gap-2">
      <div class="flex flex-col gap-2 w-full">
        <div class="flex gap-5 border p-4 rounded-lg justify-between items-center bg-white w-full">
          <div class="flex flex-col">
              <p class=" text-gray-400 text-[12px]">Total Balance:</p>
              
              <div v-if="loading">
                <div class="animate-pulse bg-gray-100 rounded-md w-[150px] h-5">
                </div>
              </div>
              <p v-else-if="balance" class="text-normal font-bold text-blue-900 text-sm">Rp {{ formatNumber(balance.balance) }}</p>
          </div>
          <button @click="openWithdraw" class="font- font-bold h-fit text-[10px] bg-blue-900 text-white px-5 py-2 rounded-md">WITHDRAW</button>
        </div>
        <div class="flex flex-col border p-4 rounded-lg justify-between items-start bg-white w-full text-[12px]">
          <!-- HEADER -->
          <div class="flex justify-between w-full mb-5">
            <p class="text-sm font-semibold">Withdraw Histories</p>

            <button 
              @click="openHistory"
              class="text-xs bg-blue-900 text-white px-3 py-1 rounded-md"
            >
              Show All
            </button>
          </div>

          <!-- HEADER TABLE -->
          <div class="flex justify-between w-full border-b pb-2">
            <p>Destination</p>
            <p>Amount</p>
          </div>

          <div v-if="loadingHistory" class="mt-5 space-y-8 w-full h-[333px]">
            <div v-for="i in 5" :key="i" class="flex items-center justify-between animate-pulse">
              
              <!-- kiri (logo + teks) -->
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gray-300 rounded"></div>
                <div class="space-y-2">
                  <div class="w-24 h-3 bg-gray-300 rounded"></div>
                  <div class="w-32 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>

              <!-- kanan (amount + date) -->
              <div class="text-right space-y-2">
                <div class="w-24 h-3 bg-gray-300 rounded"></div>
                <div class="w-20 h-3 bg-gray-200 rounded"></div>
              </div>

            </div>
          </div>
          <div v-else class="w-full min-h-[352px]">
            <div v-for="history in histories" :key="history.id" class="flex justify-between border-b py-4">
              <div class="flex flex-col items-start">
                <img :src="`/bank/${history.bank.bank_type}.png`" class="h-[20.5px] object-contain">
                <p class="text-gray-500">{{ history.bank.bank_account }}</p>
              </div>

              <div class="flex flex-col items-end">
                <p class="text-sm font-semibold">
                  Rp{{ formatNumber(history.amount) }}
                </p>
                <p class="flex items-center text-gray-500">
                  {{ formatDate2(history.updated_at) }}
                  <Icon icon="bi:dot" width="15" height="15" />
                  {{ formatTime2(history.updated_at) }}
                </p>
              </div>
            </div>
          </div>

          <!-- LOADING -->
          

          <!-- PAGINATION -->
          <div class="flex justify-between w-full mt-4">
            <button @click="prevPage" :disabled="currentPage === 1" class="disabled:opacity-30">
              <Icon icon="icon-park-outline:left" width="24" height="24" />
            </button>

            <p class="text-sm">{{ currentPage }} / {{ totalPages }}</p>

            <button @click="nextPage" :disabled="currentPage === totalPages" class="disabled:opacity-30">
              <Icon icon="mingcute:right-line" width="24" height="24" />
            </button>
          </div>        
        </div>
      </div>
      
      <div class="flex flex-col gap-2 w-full lg:w-2/3">
        <div class="flex flex-col gap-5 bg-white border py-5 rounded-lg">
          <div class="flex justify-between text-sm px-6">
            <div class="flex gap-2">
              <h1 class="font-semibold">Monthly Income</h1>
              <p class="text-gray-500 text-[12px]">{{ year }}</p>
            </div>
            <button @click="openIncome" class="text-[12px] font-semibold border bg-blue-900 rounded-md px-2 py-1 text-white hover:text-gray-200">
              Detail
            </button>
          </div>
          <div class="h-full px-4">
            <div v-if="loadingMonthlyIncome" class="shadow-sm animate-pulse">
              <div class="flex flex-col gap-5">
                <div class="h-2 bg-gray-100 rounded"></div>
                <div class="h-2 bg-gray-100 rounded"></div>
                <div class="h-2 bg-gray-100 rounded"></div>
                <div class="h-2 bg-gray-100 rounded"></div>
                <div class="h-2 bg-gray-100 rounded"></div>
              </div>
              <div class="flex justify-between mt-3 px-2">
                <div class="h-3 bg-gray-100 rounded w-6"></div>
                <div class="h-3 bg-gray-100 rounded w-6"></div>
                <div class="h-3 bg-gray-100 rounded w-6"></div>
                <div class="h-3 bg-gray-100 rounded w-6"></div>
                <div class="h-3 bg-gray-100 rounded w-6"></div>
              </div>
            </div>
            <canvas v-else ref="chartRef"></canvas>
          </div>
        </div>
        <div class="flex flex-col gap-4 bg-white border p-5 lg:(p-0 pe-8 pt-5 pb-4) rounded-lg">
          <div class="flex justify-between items-center">
            <h2 class="text-sm font-semibold">Income Overview</h2>
          </div>
            <IncomeChart />
        </div>
      </div>
    </div>
    <div v-if="loadingProductIncome" class="bg-white rounded-xl p-5 shadow-sm animate-pulse">
      <div class="flex justify-between mb-4">
        <div class="flex flex-col gap-2">
          <div class="h-4 bg-gray-300 rounded w-40"></div>
          <div class="h-3 bg-gray-300 rounded w-28"></div>
        </div>

        <div class="flex flex-col items-end gap-2">
          <div class="h-4 bg-gray-300 rounded w-32"></div>
          <div class="h-4 bg-gray-300 rounded w-40"></div>
        </div>
      </div>
      <div class="h-3 bg-gray-300 rounded w-64 mb-4"></div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div v-for="i in 8" :key="i"
          class="border border-dashed rounded-md p-4 flex justify-between items-center">

          <!-- LEFT TEXT -->
          <div class="flex flex-col gap-2 w-full">
            <div class="h-3 bg-gray-300 rounded w-3/4"></div>
            <div class="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>

          <!-- RIGHT SIDE -->
          <div class="flex items-center gap-4 ml-4">
            <div class="h-3 bg-gray-300 rounded w-8"></div>
            <div class="h-3 bg-gray-300 rounded w-16"></div>
          </div>

        </div>

      </div>
    </div>
    <div v-else-if="productIncome" class="flex flex-col border px-7 pb-7 pt-5 gap-2 rounded-lg justify-between items-start bg-white w-full text-[12px]">
      <div class="flex justify-between w-full">
        <div class="flex flex-col justify-between">
          <div class="flex flex-col">
            <p class="text-sm font-semibold">Store Sellings</p>
            <p class="text-gray-500">(non-platform income)</p>
          </div>
          <p class="max-[1000px]:hidden text-gray-500 mt-5">Product Name / Unit Sold / Total Margin</p>
          <div class="min-[1000px]:hidden flex gap-3 text-sm rounded-md h-fit rounded-md my-4">
            <div class="flex gap-2 border-e pe-4 h-fit">
              <p class="text-[12px]">Net Profit</p>
              <p class="text-[12px] font-semibold">Rp{{ formatNumber(productIncome.total_margin) }}</p>
            </div>
            <div class="flex gap-2">
              <p class="text-[12px]">Item Sold</p>
              <p class="text-[12px] font-semibold">{{ productIncome.total_sold_item }}</p>
            </div>
          </div>
        </div>
        <div class="max-[1000px]:hidden flex flex-col text-sm rounded-md h-fit rounded-md">
          <div class="flex flex-col lg:flex-row text-center gap-0 lg:gap-2 items-end">
            <p class="text-[12px]">Item Sold</p>
            <p class="font-semibold text-sm ">{{ productIncome.total_sold_item }}</p>
          </div>
          <div class="flex flex-col lg:flex-row text-center gap-0 lg:gap-2 items-end">
            <p class="text-[12px]">Net Profit</p>
            <p class="font-semibold">Rp{{ formatNumber(productIncome.total_margin) }}</p>
          </div>
        </div>
      </div>
      <div class="min-[1000px]:hidden flex gap-4 w-full items-center text-gray-500 px-2">
        <p class="w-1/3 text-start ">Product</p> 
        <p class="w-1/3 text-center">Unit Sold</p>
        <p class="w-1/3 text-end">Total Margin</p>
      </div>
      <div class="flex flex-col lg:flex-row gap-5 w-full">
        <div v-if="loadingProductIncome">
          p
        </div>
        
        <div v-else class="grid grid-cols-1 lg:grid-cols-4 w-full gap-3 rounded-md">
          <div v-for="p in productIncome?.income" class="p-3 border-2 border-dashed flex w-full">
            <div class="flex gap-4 w-full items-center">
              <p class="w-1/3 text-start ">{{ p.name }}</p> 
              <p class="w-1/3 text-center">({{p.total_qty}})</p>
              <p class="w-1/3 text-end">Rp{{ formatNumber(p.total_margin) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <div v-if="showHistoryModal" class="min-[1000px]:hidden fixed inset-0 z-50 flex items-end justify-center">
    <div @click="closeHistory" class="absolute inset-0 bg-black/50"></div>

    <div class="absolute bottom-0 left-0 w-full bg-white rounded-t-2xl p-5 flex flex-col transition-transform duration-300 ease-out"
      :style="{ height: '80%', transform: isDragging ? `translateY(${Math.max(0, currentY - startY)}px)` : 'translateY(0)'}"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4"></div>

      <div v-if="showHistories" class="flex flex-col flex-1 min-h-0">
        <div class="flex justify-between items-center mb-3">
          <p class="font-semibold text-sm">Withdraw Histories</p>
          <button @click="openHistoryFilter" class="text-[12px] bg-blue-900 text-white px-2 py-1 rounded-md ">Filter By Date</button>
        </div>

        <!-- LIST -->
        <div v-if="modalLoading" class="p-4 space-y-6">
          <div v-for="i in 5" :key="i" class="flex items-center justify-between animate-pulse">
            
            <!-- kiri (logo + teks) -->
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gray-300 rounded"></div>
              <div class="space-y-2">
                <div class="w-24 h-3 bg-gray-300 rounded"></div>
                <div class="w-32 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>

            <!-- kanan (amount + date) -->
            <div class="text-right space-y-2">
              <div class="w-24 h-3 bg-gray-300 rounded"></div>
              <div class="w-20 h-3 bg-gray-200 rounded"></div>
            </div>

          </div>
        </div>

        <div v-else-if="modalHistories" ref="scrollContainer" class="flex-1 overflow-y-auto min-h-0">  
          <div class="flex justify-between w-full border-b pb-2 text-[12px] mt-5">
            <p>Destination</p>
            <p>Amount</p>
          </div>
          <div 
            v-for="history in modalHistories" 
            :key="history.id"
            class="flex justify-between border-b py-5"
          >
            <div class="flex flex-col">
              <img :src="`/bank/${history.bank.bank_type}.png`" class="w-[60px] object-contain">
              <p class="text-gray-500 text-xs">{{ history.bank.bank_account }}</p>
            </div>

            <div class="flex flex-col items-end">
              <p class="text-sm font-semibold">
                Rp{{ formatNumber(history.amount) }}
              </p>
              <p class="text-gray-500 text-xs flex items-center">
                {{ formatDate2(history.updated_at) }}
                <Icon icon="bi:dot" width="15" height="15" />
                {{ formatTime2(history.updated_at) }}
              </p>
            </div>
          </div>
        </div>

        <div v-else>

        </div>
      </div>

      <div v-if="showHistoryFilter" class="flex flex-col">
        <button @click="backToHistory" class="flex items-center gap-2">
          <Icon icon="weui:back-filled" width="15" height="15" />
          <p class="font-semibold text-sm">Filter Date</p>
        </button>

        <!-- LIST -->
        <div class="overflow-y-auto flex flex-col gap-4 w-full">
          
          <div class="flex flex-col mt-5">
            <!-- START DATE -->
              
              <div class="flex flex-col border-b items-start p-5 relative overflow-hidden text-blue-900">
                
                <!-- INPUT (REAL CLICK AREA) -->
                <div class="flex items-center gap-3">
                  <Icon icon="fontisto:date" width="34" height="34" />
                  <div class="flex flex-col items-start">
                    <input 
                    type="date"
                    v-model="modalStartDate"
                    class="absolute inset-0 w-full h-full opacity-0 z-50"
                    />
                    <!-- DISPLAY -->
                    <p class="text-xs text-gray-400">Start From</p>
                    <div class="text-sm font-semibold pointer-events-none">
                      {{ formatFullDate(modalStartDate) }}
                    </div>
                  </div>
                </div>

              </div>
                                  
            <!-- END DATE -->

              <div class="flex flex-col items-start p-5 relative rounded-md overflow-hidden text-blue-900">

                <div class="flex items-center gap-3">
                  <Icon icon="fontisto:date" width="34" height="34" />
                  <div class="flex flex-col items-start">
                    <input 
                    type="date"
                    v-model="modalEndDate"
                    class="absolute inset-0 w-full h-full opacity-0 z-50"
                    />
                    <!-- DISPLAY -->
                    <p class="text-xs text-gray-400 ">To Date</p>
                    <div class="text-sm font-semibold pointer-events-none">
                      {{ formatFullDate(modalEndDate) }}
                    </div>
                  </div>
                </div>

              </div>

          </div>

          <!-- QUICK ACTION -->
          <div class="flex gap-2">
            <button @click="modalStartDate = null; modalEndDate = null" class="text-sm text-white rounded-md bg-gray-200 p-2 font-semibold w-full">Reset</button>
            <button @click="confirmHistoryFilter" class="bg-blue-900 p-2 rounded-md text-white font-semibold text-sm w-full">Apply</button>
          </div>
        </div>
      </div>

    </div>
  </div>

  <div v-if="showWithdraw" class="max-[1000px]:hidden fixed inset-0 z-50 flex items-center justify-center">
    <div @click="closeWithdraw" class="absolute inset-0 bg-black/50"></div>
    <div class="absolute w-[400px] bg-white rounded-md p-5 flex flex-col justify-start">

        <div v-if="showWithdrawDetail">
          <div class="flex justify-between text-blue-900 mb-5">
            <h2 class="text-sm font-bold">Request Withdrawal</h2>
            <button @click="closeWithdraw"><Icon icon="ic:round-close" width="18" height="18" /></button>
          </div>
          <div class="bg-blue-900 p-5 rounded-md">
            <div class="mb-4">
                <p class="text-[12px] text-white">Available Balance</p>
                <p class="text-xl text-white font-bold">
                    Rp {{ formatNumber(balance?.balance || 0) }}
                </p>
            </div>
            
            <div class="flex justify-between items-start">
              <div class="flex flex-col mb-5">
                <p class="text-blue-200 text-[12px]">Bank Destination</p>
                <p class="text-blue-200 text-sm">{{ mainBankAccount?.bank_account }} - {{ mainBankAccount?.bank_type }}</p>
              </div>
              <button v-if="mainBankAccount" @click="openChange" class="text-white text-[13px] border px-2 rounded-md">select other</button>
              <button v-else @click="openNewAccount" class="text-white text-[13px] border px-2 rounded-md">Add new account</button>
            </div>

            <p class="text-[12px] text-blue-200 mb-1">Input Amount</p>
            
            <input
              type="text"
              :value="formattedAmount"
              @input="onInputAmount"
              inputmode="numeric"
              placeholder="Rp"
              class="w-full border px-3 py-2 rounded-md mb-2 text-lg font-semibold text-gray-500"
            />

            <p class="text-xs text-blue-200 mb-3">Minimum amount Rp10.000</p>
          </div>
        </div>

        <div v-if="showChangeBank" class="flex flex-col bg-white gap-2">
          <div class="flex justify-between mb-5 text-blue-900">
            <button @click="closeChange" class="flex items-center text-sm font-bold">
              <Icon icon="weui:back-filled" width="20" height="20" />
              <p>Select Transfer Method</p>
            </button>
            <button @click="closeWithdraw"><Icon icon="ic:round-close" width="18" height="18" /></button>
          </div>
            <button v-for="(bank, index) in bankAccount" :key="bank.id" class="p-4 rounded border hover:bg-blue-100"
            :class="[bank.status === 'Main' ? 'bg-blue-100 text-blue-900' : 'text-gray-600',
              index !== bankAccount.length - 1 ? 'border-b' : '']"
            @click="changeBank(bank.id)"
          >
            <div class="flex justify-between">
              <div class="flex flex-col items-start gap-1">
                <p class="text-sm font-bold">{{ bank.bank_account }}</p>
                <p class="text-sm ">{{ bank.holder_name }}</p>
              </div>
              <img :src="`/bank/${bank.bank_type}.png`" class="w-[80px] object-contain"
                :class="bank.status === 'Main' ? 'opacity-100' : 'opacity-80'">
            </div>
          </button>

          <p class="text-[12px] text-gray-500">You can add up to 3 transfer method</p>
          <button v-if="bankAccount.length < 3" @click="openNewAccount" class="mt-5 text-gray-500 w-fit font-semibold text-sm flex items-center justify-end gap-2">Add new transfer method <Icon icon="material-symbols:add-ad-outline-rounded" width="15" height="15" /></button>
        </div>

        <div v-if="showNewAccount" class="flex flex-col bg-white gap-2">
          <div class="flex justify-between mb-5 text-blue-900">
            <button @click="closeNewAccount" class="flex items-center text-sm font-bold">
              <Icon icon="weui:back-filled" width="20" height="20" />
              <p>Add New Transfer Account</p>
            </button>
            <button @click="closeWithdraw"><Icon icon="ic:round-close" width="18" height="18" /></button>
          </div>
            <div class="flex w-full border-b pb-4 mb-2">
              <button @click="selectBank" class="w-1/2 text-[12px] border flex gap-2 items-center justify-center p-3 rounded-tl-md rounded-bl-md"
                :class="showInputBank ? 'bg-blue-900 text-white font-bold' : 'text-gray-600'"
              >
                <Icon icon="proicons:bank" width="20" height="20" />
                <p>Bank</p> 
              </button>
              <button @click="selectEWallet" class="w-1/2 text-[12px] border flex gap-2 items-center justify-center p-3 rounded-tr-md rounded-br-md"
                :class="showInputEWallet ? 'bg-blue-900 text-white font-bold' : 'text-gray-600'"
              >
              <Icon icon="fluent:wallet-credit-card-32-regular" width="20" height="20" />
              <p>E-Wallet</p> 
              </button>
            </div>

            <input v-model="newAccountForm.account_number"
              type="text" 
              placeholder="Account Number" 
              class="text-[12px] border rounded-md p-2 focus:outline-none"
              inputmode="numeric"
            >
            <input v-model="newAccountForm.account_name"
              type="text" 
              placeholder="Holder Name" 
              class="text-[12px] border rounded-md p-2 focus:outline-none"
              inputmode="text"
            >
            <select v-if="showInputBank" v-model="newAccountForm.bank_type" class="text-[12px] text-gray-500 border p-2 rounded-md focus:outline-none">
              <option value="">Bank Selection</option>
              <option value="BCA">Bank Central Asia (BCA)</option>
              <option value="BRI">Bank Rakyat Indonesia (BRI)</option>
              <option value="BNI">Bank Negara Indonesia (BNI)</option>
              <option value="BSI">Bank Syariah Indonesia (BSI)</option>
              <option value="BTN">Bank Tabungan Negara (BTN)</option>
              <option value="Mandiri">Bank Mandiri</option>
              <option value="Cimb Niaga">Bank Cimb Niaga</option>
              <option value="Permata">Bank Permata</option>
              <option value="Danamon">Bank Danamon</option>
            </select>
            <select v-if="showInputEWallet" v-model="newAccountForm.bank_type" class="text-[12px] text-gray-500 border p-2 rounded-md focus:outline-none">
              <option value="">E-Wallet Selection</option>
              <option value="Dana">Dana</option>
              <option value="Gopay">Gopay</option>
              <option value="OVO">OVO</option>
              <option value="ShopeePay">ShopeePay</option>
              <option value="LinkAja">LinkAja</option>
              <option value="Sakuku">Sakuku</option>
            </select>

            <button @click="addNewAccount" class="w-full bg-blue-900 rounded-md text-white text-sm p-2 mt-3 font-bold">Add New Account</button>
        </div>

        <div v-if="showPendingRequest">
          <div class="flex flex-col items-center gap-1 text-sm text-blue-900">
            <Icon icon="streamline-sharp:time-lapse-solid" width="30" height="30" />
            <h2 class="font-bold">Withrawal Requested</h2>
          </div>
          <p class="text-[12px] text-gray-400 mt-5 mb-2 text-center">this validation process will take up to 1 hours</p>
          <div v-if="pendingExists" class="flex flex-col border rounded-md px-5">
            <div class="flex flex-col gap-1 py-5">
              <div class="flex justify-between text-[12px]">
                <p class="text-gray-700">Bank Account</p>
                <p class="text-gray-700 font-semibold">{{ pendingExists.bank.bank_account }}</p>
              </div>
              <div class="flex justify-between text-[12px]">
                <p class="text-gray-700">Reference ID</p>
                <p class="text-gray-700 font-semibold">{{ pendingExists.reference_id }}</p>
              </div>
              <div class="flex justify-between text-[12px]">
                <p class="text-gray-700">Method</p>
                <p class="text-gray-700 font-semibold">Bank Transfer</p>
              </div>
              <div class="flex justify-between text-[12px]">
                  <p class="text-gray-700">Request Date</p>
                  <p class="text-gray-700 font-semibold">{{ formatTime2(pendingExists.created_at) }}, {{ formatDate(pendingExists.created_at) }}</p>
              </div>
              <div class="flex justify-between text-[12px] mt-5">
                  <p class="text-gray-700">Status</p>
                  <p class="text-gray-700 font-semibold font-bold px-2 rounded-md"
                    :class="
                    [
                      pendingExists.status == 'Pending' ? 'bg-yellow-100 text-yellow-900' : '',
                      pendingExists.status == 'Processing' ? 'bg-blue-100 text-blue-900' : 'Processing',
                    ]"
                    >
                    {{ pendingExists?.status }}
                  </p>
              </div>
            </div>
            <div class="flex justify-between border-t py-2">
              <img :src="`/bank/${pendingExists?.bank.bank_type}.png`" class="w-[60px] object-contain">
              <div class="flex flex-col items-start">
                <p class="text-[12px] text-gray-500">Amount</p>
                <p class="text-[13px] font-bold">Rp{{ formatNumber(pendingExists?.amount ?? 0) }}</p>
              </div>
            </div>
          </div>
          
          <button @click="cancelRequest" class="w-full mt-2 font-bold bg-blue-900 text-white text-sm py-2 rounded-md disabled:bg-gray-200"
            :disabled="pendingExists?.status == 'Processing'">
            Cancel Request
          </button>

          <p class="text-[12px] text-gray-400 mt-2">You can't cancel request while the status turn into processing</p>
        </div>

        <p v-if="error" class="text-red-500 text-[12px] mb-2 mt-2">Invalid: {{ error }}</p>

        <button v-if="showWithdrawDetail" @click="submitWithdraw" class="w-full font-bold bg-blue-900 text-white text-sm py-3 rounded-md disabled:opacity-50"
          :class="error ? '' : 'mt-5'">
            <span v-if="loading">Loading...</span>
            <span v-else>Withdraw</span>
        </button>
    </div>
  </div>

  <div v-if="showWithdraw" class="min-[1000px]:hidden fixed inset-0 z-50">
      <div @click="closeWithdraw" class="absolute inset-0 bg-black/50"></div>
      <div class="absolute bottom-0 left-0 w-full bg-white rounded-t-2xl p-5 transition-transform duration-300 ease-out"
          :style="{ height: '80%', transform: isDragging ? `translateY(${Math.max(0, currentY - startY)}px)` : 'translateY(0)'}"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
      >
          <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4"></div>

        <div v-if="showWithdrawDetail">
          <h2 class="text-sm font-bold mb-5 mt-5 text-blue-900">Request Withdrawal</h2>
          <div class="bg-blue-900 p-5 rounded-md">
            <div class="mb-4">
                <p class="text-[12px] text-white">Available Balance</p>
                <p class="text-xl text-white font-bold">
                    Rp {{ formatNumber(balance?.balance || 0) }}
                </p>
            </div>
            
            <div class="flex justify-between items-start">
              <div class="flex flex-col mb-5">
                <p class="text-blue-200 text-[12px]">Destination Account</p>
                <p class="text-blue-200 text-sm">{{ mainBankAccount?.bank_account }} - {{ mainBankAccount?.bank_type }}</p>
              </div>
              <button v-if="mainBankAccount" @click="openChange" class="text-white text-[13px] border px-2 rounded-md">select other</button>
              <button v-else @click="openNewAccount" class="text-white text-[13px] border px-2 rounded-md">Add new account</button>
            </div>

            <p class="text-[12px] text-blue-200 mb-1">Input Amount</p>
            
            <input
              type="text"
              :value="formattedAmount"
              @input="onInputAmount"
              inputmode="numeric"
              placeholder="Rp"
              class="w-full border px-3 py-2 rounded-md mb-2 text-lg font-semibold text-gray-500"
            />

            <p class="text-xs text-blue-200 mb-3">Minimum amount Rp10.000</p>
          </div>
        </div>

          <div v-if="showChangeBank" class="flex flex-col bg-white gap-2">
            <button @click="closeChange" class="flex items-center text-sm font-bold mb-5 mt-2 text-blue-900">
              <Icon icon="weui:back-filled" width="20" height="20" />
              <p>Select Transfer Method</p>
            </button>
            <button v-for="(bank, index) in bankAccount" :key="bank.id" class="p-4 rounded border hover:bg-blue-100"
              :class="[bank.status === 'Main' ? 'bg-blue-100 text-blue-900' : 'text-gray-600',
                index !== bankAccount.length - 1 ? 'border-b' : '']"
              @click="changeBank(bank.id)"
            >
              <div class="flex justify-between">
                <div class="flex flex-col items-start gap-1">
                  <p class="text-sm font-bold">{{ bank.bank_account }}</p>
                  <p class="text-sm ">{{ bank.holder_name }}</p>
                </div>
                <img :src="`/bank/${bank.bank_type}.png`" class="w-[80px] object-contain"
                  :class="bank.status === 'Main' ? 'opacity-100' : 'opacity-80'">
              </div>
            </button>

            <p class="text-[12px] text-gray-500">You can add up to 3 transfer method</p>
            <button v-if="bankAccount.length < 3" @click="openNewAccount" class="mt-5 text-gray-500 w-fit font-semibold text-sm flex items-center justify-end gap-2">Add new transfer method <Icon icon="material-symbols:add-ad-outline-rounded" width="15" height="15" /></button>
          </div>

          <div v-if="showNewAccount" class="flex flex-col bg-white gap-2">
              <button @click="closeNewAccount" class="flex items-center text-sm font-bold mb-5 mt-2 text-blue-900">
                <Icon icon="weui:back-filled" width="20" height="20" />
                <p>Add New Transfer Account</p>
              </button>
              
              <div class="flex w-full border-b pb-4 mb-2">
                <button @click="selectBank" class="w-1/2 text-[12px] border flex gap-2 items-center justify-center p-3 rounded-tl-md rounded-bl-md"
                  :class="showInputBank ? 'bg-blue-900 text-white font-bold' : 'text-gray-600'"
                >
                  <Icon icon="proicons:bank" width="20" height="20" />
                  <p>Bank Transfer</p> 
                </button>
                <button @click="selectEWallet" class="w-1/2 text-[12px] border flex gap-2 items-center justify-center p-3 rounded-tr-md rounded-br-md"
                  :class="showInputEWallet ? 'bg-blue-900 text-white font-bold' : 'text-gray-600'"
                >
                <Icon icon="fluent:wallet-credit-card-32-regular" width="20" height="20" />
                <p>E-Wallet</p> 
                </button>
              </div>

              <input v-model="newAccountForm.account_number"
                type="text" 
                placeholder="Account Number" 
                class="text-[12px] border rounded-md p-2 focus:outline-none"
                inputmode="numeric"
              >
              <input v-model="newAccountForm.account_name"
                type="text" 
                placeholder="Holder Name" 
                class="text-[12px] border rounded-md p-2 focus:outline-none"
                inputmode="text"
              >
              <select v-if="showInputBank" v-model="newAccountForm.bank_type" class="text-[12px] text-gray-500 border p-2 rounded-md focus:outline-none">
                <option value="">Bank Selection</option>
                <option value="BCA">Bank Central Asia (BCA)</option>
                <option value="BRI">Bank Rakyat Indonesia (BRI)</option>
                <option value="BNI">Bank Negara Indonesia (BNI)</option>
                <option value="BSI">Bank Syariah Indonesia (BSI)</option>
                <option value="BTN">Bank Tabungan Negara (BTN)</option>
                <option value="Mandiri">Bank Mandiri</option>
                <option value="Cimb Niaga">Bank Cimb Niaga</option>
                <option value="Permata">Bank Permata</option>
                <option value="Danamon">Bank Danamon</option>
              </select>
              <select v-if="showInputEWallet" v-model="newAccountForm.bank_type" class="text-[12px] text-gray-500 border p-2 rounded-md focus:outline-none">
                <option value="">E-Wallet Selection</option>
                <option value="Dana">Dana</option>
                <option value="Gopay">Gopay</option>
                <option value="OVO">OVO</option>
                <option value="ShopeePay">ShopeePay</option>
                <option value="LinkAja">LinkAja</option>
                <option value="Sakuku">Sakuku</option>
              </select>

              <button @click="addNewAccount" class="w-full bg-blue-900 rounded-md text-white text-sm p-2 mt-3 font-bold">Add New Account</button>
          </div>

          <div v-if="showPendingRequest" class="mt-10">
            <div class="flex flex-col items-center gap-1 text-sm text-blue-900">
              <Icon icon="streamline-sharp:time-lapse-solid" width="30" height="30" />
              <h2 class="font-bold">Withrawal Requested</h2>
            </div>
            <p class="text-[12px] text-gray-400 mt-5 mb-2 text-center">this validation process will take up to 1 hours</p>
            <div v-if="pendingExists" class="flex flex-col border rounded-md px-5">
              <div class="flex flex-col gap-1 py-5">
                <div class="flex justify-between text-[12px]">
                  <p class="text-gray-700">Bank Account</p>
                  <p class="text-gray-700 font-semibold">{{ pendingExists.bank.bank_account }}</p>
                </div>
                <div class="flex justify-between text-[12px]">
                  <p class="text-gray-700">Reference ID</p>
                  <p class="text-gray-700 font-semibold">{{ pendingExists.reference_id }}</p>
                </div>
                <div class="flex justify-between text-[12px]">
                  <p class="text-gray-700">Method</p>
                  <p class="text-gray-700 font-semibold">Bank Transfer</p>
                </div>
                <div class="flex justify-between text-[12px]">
                    <p class="text-gray-700">Request Date</p>
                    <p class="text-gray-700 font-semibold">{{ formatTime2(pendingExists.created_at) }}, {{ formatDate(pendingExists.created_at) }}</p>
                </div>
                <div class="flex justify-between text-[12px] mt-5">
                    <p class="text-gray-700">Status</p>
                    <p class="text-gray-700 font-semibold font-bold px-2 rounded-md"
                      :class="
                      [
                        pendingExists.status == 'Pending' ? 'bg-yellow-100 text-yellow-900' : '',
                        pendingExists.status == 'Processing' ? 'bg-blue-100 text-blue-900' : 'Processing',
                      ]"
                      >
                      {{ pendingExists?.status }}
                    </p>
                </div>
              </div>
              <div class="flex justify-between border-t py-2">
                <img :src="`/bank/${pendingExists?.bank.bank_type}.png`" class="w-[60px] object-contain">
                <div class="flex flex-col items-start">
                  <p class="text-[12px] text-gray-500">Amount</p>
                  <p class="text-[13px] font-bold">Rp{{ formatNumber(pendingExists?.amount ?? 0) }}</p>
                </div>
              </div>
            </div>
            
            <button @click="cancelRequest" class="w-full mt-2 font-bold bg-blue-900 text-white text-sm py-2 rounded-md disabled:bg-gray-200"
              :disabled="pendingExists?.status == 'Processing'">
              Cancel Request
            </button>

            <p class="text-[12px] text-gray-400 mt-2">You can't cancel request while the status turn into processing</p>
          </div>

          <p v-if="error" class="text-red-500 text-[12px] mb-2 mt-2">Invalid!: {{ error }}</p>

          <button v-if="showWithdrawDetail" @click="submitWithdraw" class="w-full font-bold bg-blue-900 text-white text-sm py-3 rounded-md disabled:opacity-50"
            :class="error ? '' : 'mt-5'">
              <span v-if="loading">Loading...</span>
              <span v-else>Withdraw</span>
          </button>
      </div>
  </div>
</template>

