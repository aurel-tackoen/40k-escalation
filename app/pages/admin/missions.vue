<script setup>
  definePageMeta({
    layout: 'admin'
  })
</script>

<template>
  <div class="mb-6">
    <h2 class="text-2xl font-bold text-white mb-2">Missions Management</h2>
    <p class="text-gray-400 text-sm">Manage missions and scenarios for each game system</p>
  </div>

  <AdminMissionsManager />
</template>
