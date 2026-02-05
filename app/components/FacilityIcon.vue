<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed } from 'vue';

export type IconName = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14

const props = defineProps<{
    name: IconName
    size?: number | string
    color?: string
    textColor?: string
}>()

const icons: Record<string | number, string> = {
    1: 'hugeicons:mosque-05',
    2: 'material-symbols-light:food-bank-outline',
    3: 'ph:car-profile-light',
    4: 'hugeicons:motorbike-02',
    5: 'tabler:wifi',
    6: 'fluent-emoji-high-contrast:toilet',
    7: 'material-symbols-light:store-outline-rounded',
    8: 'material-symbols-light:checkroom-rounded',
    9: 'mingcute:shower-line',
    10: 'mingcute:shower-line',
    11: 'roentgen:sauna',
    12: 'cil:drink',
    13: 'fluent:food-28-regular',
    14: 'ph:chair-light'
}

const iconName = computed(() => icons[props.name] ?? 'mdi:help-circle')

const labels: Record<IconName, string> = {
    1: 'Mosque',
    2: 'F&B',
    3: 'Car Parking',
    4: 'Motorbike Parking',
    5: 'Wifi',
    6: 'Toilet',
    7: 'Sport Store',
    8: 'Changing Room',
    9: 'Shower',
    10: 'Hot Shower',
    11: 'Sauna',
    12: 'Drink',
    13: 'Food',
    14: 'Tribune'
}

const iconValue = computed(() => icons[props.name])
const displayName = computed(() => labels[props.name])

</script>

<template>
    <p class="flex gap-2">
     <Icon :icon="iconName" :width="size ?? 20" :height="size ?? 20" :color="color"/>
      <span class="me-2 text-[12px]" :style="{ color: textColor ?? color }">
        {{ displayName }}
      </span>
    </p>
</template>