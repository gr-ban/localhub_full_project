<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const posts = ref([])
const searchQuery = computed(() => route.query.q || '')

onMounted(() => {
  const stored = localStorage.getItem('localhub_posts')
  if (stored) posts.value = JSON.parse(stored)
})

const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return []
  const q = searchQuery.value.toLowerCase()
  return posts.value.filter(p => 
    p.title.toLowerCase().includes(q) || 
    p.content.toLowerCase().includes(q) || 
    p.writer.toLowerCase().includes(q)
  )
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-6 space-y-6">
    <div class="border-b pb-3">
      <button @click="router.push('/')" class="text-xs text-[#21618C] font-bold hover:underline mb-1 block">← 홈으로 가기</button>
      <h2 class="text-2xl font-black text-[#34495E]">전체 통합 검색 결과</h2>
      <p class="text-xs text-gray-400 mt-1 font-semibold">'{{ searchQuery }}'에 대한 검색 결과 총 {{ searchResults.length }}건</p>
    </div>

    <div v-if="searchResults.length > 0" class="bg-white border rounded-xl divide-y shadow-sm">
      <div 
        v-for="post in searchResults" :key="post.id"
        @click="router.push(`/board/${post.category}/${post.id}`)"
        class="p-4 hover:bg-gray-50 cursor-pointer transition flex justify-between items-center"
      >
        <div>
          <h4 class="font-bold text-gray-800 text-sm mb-1">{{ post.title }}</h4>
          <p class="text-xs text-gray-400">작성자: {{ post.writer }} | 조회수: {{ post.viewCount }}</p>
        </div>
        <span class="text-xs bg-[#21618C]/10 text-[#21618C] font-bold px-2.5 py-1 rounded">바로가기</span>
      </div>
    </div>
    <div v-else class="text-center py-16 text-gray-400 font-bold bg-white border rounded-xl">
      통합 검색 결과와 일치하는 데이터가 존재하지 않습니다.
    </div>
  </div>
</template>