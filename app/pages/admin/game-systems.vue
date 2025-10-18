<script setup>
  definePageMeta({
    layout: 'admin'
  })
</script>

<template>
  <div class="mb-6">
    <h2 class="text-2xl font-bold text-white mb-2">Game Systems Management</h2>
    <p class="text-gray-400 text-sm">Manage game systems, match types, and configurations</p>
  </div>

  <AdminGameSystemsManager />
</template>
