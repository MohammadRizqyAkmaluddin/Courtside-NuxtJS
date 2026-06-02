<template>
  <div class="flex">
    
    <!-- Sidebar -->
    <aside class="h-full w-64 bg-gray-900 text-white flex flex-col justify-between p-5">
      
      <!-- Top -->
      <div>
        <h1 class="text-xl font-bold mb-10">Courtside</h1>

        <nav class="flex flex-col gap-4">
          <a href="#" class="hover:bg-gray-700 p-2 rounded">Dashboard</a>
          <a href="#" class="hover:bg-gray-700 p-2 rounded">Venues</a>
          <a href="#" class="hover:bg-gray-700 p-2 rounded">Bookings</a>
          <a href="#" class="hover:bg-gray-700 p-2 rounded">Settings</a>
        </nav>
      </div>

      <!-- Bottom -->
      <div>
        <button class="w-full bg-red-500 hover:bg-red-600 p-2 rounded">
          Logout
        </button>
      </div>
    </aside>

  </div>
</template>

<script setup>
// ga perlu logic dulu, ini pure layout
</script>