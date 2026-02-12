<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'

export type IconName =  number

const props = defineProps<{
  name: IconName
  size?: number | string
  color?: string
  textColor?: string
}>()

const icons: Record<string | number, string> = {
  1: 'material-symbols-light:sports-soccer',
  2: 'material-symbols-light:sports-soccer',
  3: 'material-symbols-light:sports-soccer',
  5: 'hugeicons:tennis-racket',
  4: 'hugeicons:badminton-shuttle',
  6: 'emojione-monotone:tennis',
  7: 'cil:basketball',
  8: 'ph:volleyball-light',
  9: 'material-symbols-light:sports-golf-outline-rounded',
  10: 'streamline-ultimate:baseball-bat-ball',
  11: 'streamline-ultimate:baseball-bat-ball',
  12: 'material-symbols-light:water',
  13: 'guidance:pilates',
  14: 'healthicons:exercise-yoga-outline',
  15: 'streamline-ultimate:shooting-rifle-person-aim'
}

const labels: Record<IconName, string> = {
  1: 'Football',
  2: 'Mini Soccer',
  3: 'Futsal',
  4: 'Badminton',
  5: 'Padel',
  6: 'Tennis',
  7: 'Basketball',
  8: 'Volley',
  9: 'Golf',
  10: 'Baseball',
  11: 'Softball',
  12: 'Swimming Pool',
  13: 'Pilates',
  14: 'Yoga',
  15: 'Shooting Range'
}

const iconName = computed(() => icons[props.name] ?? 'mdi:help-circle')
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