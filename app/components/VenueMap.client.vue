<template>
    <div ref="mapEl" class="h-full w-full relative z-10 rounded-tr-lg rounded-tl-lg"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = defineProps<{
  lat: number
  lng: number
  name?: string
}>()

const mapEl = ref<HTMLElement | null>(null)

onMounted(async () => {
  const L = await import('leaflet')

  // FIX ICON (WAJIB)
  delete (L.Icon.Default.prototype as any)._getIconUrl

  L.Icon.Default.mergeOptions({
    iconUrl: new URL(
      'leaflet/dist/images/marker-icon.png',
      import.meta.url
    ).href,
    shadowUrl: new URL(
      'leaflet/dist/images/marker-shadow.png',
      import.meta.url
    ).href
  })

  if (!mapEl.value) return

  const map = L.map(mapEl.value).setView([props.lat, props.lng], 15)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map)

  L.marker([props.lat, props.lng])
    .addTo(map)
    .bindPopup(props.name || 'Venue')
    .openPopup()
})
</script>
