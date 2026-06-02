<script setup lang="ts">
import VueApexCharts from "vue3-apexcharts"
import type { ApexOptions } from "apexcharts"
import { ref, onMounted, computed } from "vue"
import { api } from "~/services/api"
import type { ApiResponse } from "~/types"
import { formatNumber } from "#imports"


type CourtIncome = {
  court_id: number
  court_name: string
  total_bookings: number
  total_income: number
}

type CourtIncomeResponse = {
  total_income: number
  courts: CourtIncome[]
}

const series = ref<number[]>([])
const totalIncome = ref(0)
const loadingChart = ref(false)

const chartOptions = ref<ApexOptions>({
  chart: {
    type: 'donut',
    height: 250,
    fontFamily: 'Inter, sans-serif'
  },
  labels: [],
  colors: ['#324A50', '#305E3F', '#1C325F', '#295770', '#0C1F41'],
  legend: { show: false },
  dataLabels: { enabled: false },

  tooltip: {
    style: {
        fontSize: '13px',
        fontFamily: 'Inter, sans-serif'
    },
    y: {
        formatter: (val: number) => 'Rp ' + formatNumber(val)
    }
  },

  plotOptions: {
    pie: {
      donut: {
        size: '80%',
        labels: {
          show: true,

          name: {
            show: true,
            offsetY: -5,
            fontSize: '10px',
            fontWeight: 500,
            color: '#000000'
          },

          value: {
            fontSize: '20px',
            offsetY: 5,
            fontWeight: 800,
            formatter: (val: number | string) => {
              return 'Rp ' + formatNumber(Number(val))
            }
          },

          total: {
            show: true,
            fontSize: '14px',
            color: '#000000',
            label: 'Total Income',
            formatter: () => 'Rp ' + formatNumber(totalIncome.value)
          }
        }
      }
    }
  }
})

async function fetchData() {
  loadingChart.value = true
  try {
    const res = await api<ApiResponse<CourtIncomeResponse>>('/income/breakdown')
    const data = res.data

    totalIncome.value = data.total_income

    chartOptions.value = {
      ...chartOptions.value,
      labels: data.courts.map(c => c.court_name)
    }

    series.value = data.courts.map(c => Number(c.total_income))
    loadingChart.value = false
  } catch (err) {
    console.error(err)
  }
}

onMounted(async () => {
  await fetchData()
  if (window) window.dispatchEvent(new Event('resize'))
})

const labels = computed(() => chartOptions.value.labels ?? [])
</script>

<template>
  <div v-if="loadingChart" class="flex flex-col lg:flex-row gap-6 animate-pulse h-full p-3">
    <div class="w-[230px] h-[230px] rounded-full bg-gray-200 relative flex items-center justify-center">
      <div class="w-[190px] h-[190px] bg-white rounded-full flex flex-col items-center justify-center gap-2">
        <div class="h-4 bg-gray-300 rounded w-24"></div>
        <div class="h-5 bg-gray-300 rounded w-28"></div>
      </div>
    </div>
    <div class="flex flex-col justify-center gap-4 flex-1">
      <div v-for="i in 3" :key="i" class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 bg-gray-300 rounded-full"></div>
          <div class="h-4 bg-gray-300 rounded w-28"></div>
        </div>
        <div class="h-4 bg-gray-300 rounded w-24"></div>
      </div>
    </div>
  </div>

  <div v-else class="flex flex-col items-center gap- lg:flex-row">
    <VueApexCharts
      type="donut"
      height="250"
      :options="chartOptions"
      :series="series"
    />
    <div class="w-full flex flex-col gap-4">
        <div v-for="(value, index) in series" :key="index" class="flex items-center justify-between border-b-2 border-dotted">
            <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: chartOptions.colors?.[index] }"></span>
                <span class="text-gray-600 text-[12px] font-semibold">{{ labels[index] }}</span>
            </div>
            <span class="text-[12px] font-semibold text-gray-900">Rp {{ formatNumber(value) }}</span>
        </div>
    </div>
  </div>

</template>