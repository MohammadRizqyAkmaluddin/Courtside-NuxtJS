<script setup lang="ts">

useHead({
  script: [
    {
      src: 'https://app.sandbox.midtrans.com/snap/snap.js',
      'data-client-key': 'Mid-client-LMahtvxbs_fwJuKR',
      defer: true
    }
  ]
})

</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>