<script setup>
import infoData from '../assets/data/local-data.json'
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">정보</h1>
      <button @click="$router.push('/')" class="bg-[#21618C] text-white px-3 py-1 rounded-md text-sm">홈으로</button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-for="(item, idx) in infoData" :key="idx" class="p-4 border rounded-lg bg-white">
        <h2 class="font-bold text-lg">{{ item.name }}</h2>
        <div class="text-sm text-gray-600">분류: {{ item.category }} · 지역: {{ item.region }}</div>
        <p class="mt-2 text-gray-700">{{ item.desc }}</p>
        <div class="mt-2 text-xs text-gray-500">주소: {{ item.address }}</div>
        <div class="mt-2 text-xs text-gray-500">요금: {{ item.fee }} · 주차: {{ item.parking }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* small styles if needed */
</style>
