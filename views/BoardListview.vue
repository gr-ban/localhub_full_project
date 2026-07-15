<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const category = computed(() => route.params.category)

const boardSearchQuery = ref('')
const sortBy = ref('latest') // latest, views, likes
const posts = ref([])

const categoryNames = {
  tourist: '관광지', leisure: '레포츠', culture: '문화시설',
  shopping: '쇼핑', accommodation: '숙박', course: '여행코스', festival: '축제공연행사'
}

const loadPosts = () => {
  const stored = localStorage.getItem('localhub_posts')
  posts.value = stored ? JSON.parse(stored) : []
}

onMounted(loadPosts)
watch(category, () => {
  boardSearchQuery.value = ''
  sortBy.value = 'latest'
  loadPosts()
}, { immediate: true })

// 정렬 및 내림차순 검색 로직 (Sort / Search)
const filteredAndSortedPosts = computed(() => {
  let result = posts.value.filter(p => p.category === category.value)

  if (boardSearchQuery.value.trim()) {
    const q = boardSearchQuery.value.toLowerCase()
    result = result.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q))
  }

  const sorted = [...result]
  if (sortBy.value === 'latest') return sorted.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
  if (sortBy.value === 'views') return sorted.sort((a,b) => b.viewCount - a.viewCount)
  if (sortBy.value === 'likes') return sorted.sort((a,b) => b.likes - a.likes)
  return sorted
})

const viewDetail = (id) => {
  // 조회수 1 증가 처리 후 이동
  const allPosts = [...posts.value]
  const target = allPosts.find(p => p.id === id)
  if (target) target.viewCount++
  localStorage.setItem('localhub_posts', JSON.stringify(allPosts))
  
  router.push(`/board/${category.value}/${id}`)
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-6 space-y-6">
    <div class="flex items-center justify-between border-b pb-4">
      <h2 class="text-2xl font-black text-[#34495E]">{{ categoryNames[category] }} 게시판</h2>
      <button 
        @click="router.push(`/board/${category}/write`)"
        class="bg-[#21618C] hover:bg-[#34495E] text-white font-bold px-4 py-2 rounded-xl text-sm transition"
      >
        <i class="fa-solid fa-pen mr-1"></i> 익명 글쓰기
      </button>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 justify-between items-center bg-gray-50 p-4 rounded-xl">
      <div class="relative w-full sm:w-72">
        <input 
          type="text" v-model="boardSearchQuery" placeholder="게시판 내 검색..."
          class="w-full px-3 py-2 pl-9 text-sm rounded-lg border focus:outline-none focus:border-[#21618C]"
        >
        <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-gray-400 text-xs"></i>
      </div>
      <select v-model="sortBy" class="bg-white border text-sm rounded-lg p-2 font-semibold text-gray-700 focus:outline-none">
        <option value="latest">최신 등록순</option>
        <option value="views">조회수 높은순</option>
        <option value="likes">좋아요 많은순</option>
      </select>
    </div>

    <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 text-gray-500 font-bold text-xs uppercase border-b text-center">
            <th class="py-3 px-4 w-16">번호</th>
            <th class="py-3 px-4 text-left">제목</th>
            <th class="py-3 px-4 w-24">작성자</th>
            <th class="py-3 px-4 w-24">조회수</th>
            <th class="py-3 px-4 w-24">좋아요</th>
          </tr>
        </thead>
        <tbody class="divide-y text-sm text-center font-medium">
          <tr v-for="(post, idx) in filteredAndSortedPosts" :key="post.id" @click="viewDetail(post.id)" class="hover:bg-gray-50 cursor-pointer">
            <td class="py-4 px-4 text-gray-400">{{ idx + 1 }}</td>
            <td class="py-4 px-4 text-left font-bold text-gray-800 truncate max-w-xs">{{ post.title }}</td>
            <td class="py-4 px-4 text-gray-500">{{ post.writer }}</td>
            <td class="py-4 px-4"><span class="bg-blue-50 text-[#21618C] px-2 py-0.5 rounded-full text-xs font-bold">{{ post.viewCount }}</span></td>
            <td class="py-4 px-4"><span class="bg-red-50 text-[#E74C3C] px-2 py-0.5 rounded-full text-xs font-bold">{{ post.likes }}</span></td>
          </tr>
          <tr v-if="filteredAndSortedPosts.length === 0">
            <td colspan="5" class="py-12 text-gray-400 font-bold">등록된 게시글이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>