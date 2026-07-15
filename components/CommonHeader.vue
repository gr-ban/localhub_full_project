<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isBoardPage = computed(() => {
  return route.path.startsWith('/board')
})

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <header v-if="isBoardPage" class="bg-[#21618C] text-white shadow-md sticky top-0 z-40">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <button class="flex items-center gap-2 cursor-pointer" @click="goHome">
        <div class="bg-[#F4D03F] text-[#7E5109] p-2 rounded-lg font-black shadow-inner">
          <i class="fa-solid fa-map-location-dot"></i>
        </div>
        <span class="text-sm font-bold">홈으로</span>
      </button>
    </div>
  </header>
</template>