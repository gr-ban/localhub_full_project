<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HomeCalendarWidget from '../components/HomeCalendarWidget.vue'
import PostRankPanel from '../components/PostRankPanel.vue'

const router = useRouter()
const globalSearchQuery = ref('')

// 지정 색상 기반 카테고리 8개 정의
const categories = ref([
  { id: 'tourist', name: '관광지', icon: 'fa-camera-retro', bg: 'bg-[#E74C3C]/10', text: 'text-[#E74C3C]' },
  { id: 'leisure', name: '레포츠', icon: 'fa-person-snowboarding', bg: 'bg-[#7E5109]/10', text: 'text-[#7E5109]' },
  { id: 'culture', name: '문화시설', icon: 'fa-gopuram', bg: 'bg-[#21618C]/10', text: 'text-[#21618C]' },
  { id: 'shopping', name: '쇼핑', icon: 'fa-bag-shopping', bg: 'bg-[#9B59B6]/10', text: 'text-[#9B59B6]' },
  { id: 'accommodation', name: '숙박', icon: 'fa-bed', bg: 'bg-[#34495E]/10', text: 'text-[#34495E]' },
  { id: 'course', name: '여행코스', icon: 'fa-map-signs', bg: 'bg-[#E74C3C]/10', text: 'text-[#E74C3C]' },
  { id: 'festival', name: '축제공연행사', icon: 'fa-masks-theater', bg: 'bg-[#7E5109]/10', text: 'text-[#7E5109]' },
  { id: 'weather', name: '캘린더&날씨', icon: 'fa-cloud-sun-rain', bg: 'bg-[#21618C]/10', text: 'text-[#21618C]' }
])

// 로컬스토리지 게시글(localhub_posts)을 기반으로 인기글/도움된글 패널 구성
const allPosts = ref([])

onMounted(() => {
  const stored = localStorage.getItem('localhub_posts')
  allPosts.value = stored ? JSON.parse(stored) : []
})

const withIsNew = (post) => {
  const created = new Date(post.createdAt)
  const diffDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)
  return { ...post, isNew: diffDays <= 3 }
}

// 조회수 기준 TOP 5
const topViewed = computed(() =>
  [...allPosts.value]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5)
    .map(withIsNew)
)

// 좋아요 기준 TOP 5 ("도움이 된 글" 개념으로 매핑)
const topLiked = computed(() =>
  [...allPosts.value]
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 5)
    .map(withIsNew)
)

const handleSearch = () => {
  if (!globalSearchQuery.value.trim()) return
  router.push({ path: '/search', query: { q: globalSearchQuery.value } })
}

const goToBoard = (id) => {
  if (id === 'weather') {
    alert('날씨/캘린더 서비스는 준비 중입니다.')
    return
  }
  router.push(`/board/${id}`)
}
</script>

<template>
  <div class="space-y-10 max-w-6xl mx-auto px-4 py-6">
    <!-- 1. 헤더: 로고 + 태그라인 -->
    <div class="text-center py-6">
      <h1 class="text-4xl font-black text-[#21618C] tracking-tight flex items-center justify-center gap-3">
        <span class="bg-[#F4D03F] text-[#7E5109] p-2 rounded-2xl shadow-md"><i class="fa-solid fa-map-location-dot"></i></span>
        LocalHub
      </h1>
      <p class="text-sm text-[#34495E] mt-2 font-medium">공공데이터 기반 서울 지역 정보 공유 익명 커뮤니티</p>
    </div>

    <!-- 2. 통합 검색바 -->
    <div class="max-w-2xl mx-auto relative">
      <input
        type="text"
        v-model="globalSearchQuery"
        @keyup.enter="handleSearch"
        placeholder="게시판 내 통합 검색..."
        class="w-full px-6 py-4 pl-14 rounded-full border-2 border-[#21618C] focus:outline-none focus:ring-4 focus:ring-[#F4D03F]/40 text-base shadow-sm"
      >
      <i class="fa-solid fa-magnifying-glass absolute left-6 top-5 text-gray-400 text-lg"></i>
      <button
        @click="handleSearch"
        class="absolute right-3 top-2.5 bg-[#21618C] hover:bg-[#34495E] text-white font-bold px-6 py-2 rounded-full transition text-sm"
      >
        검색
      </button>
    </div>

    <!-- 3. 카테고리 그리드 (4열 x 2행) -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <button
        v-for="cat in categories"
        :key="cat.id"
        @click="goToBoard(cat.id)"
        class="bg-white hover:bg-gray-50 border border-gray-100 p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-3 group"
      >
        <div :class="`w-14 h-14 rounded-xl ${cat.bg} ${cat.text} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`">
          <i :class="`fa-solid ${cat.icon}`"></i>
        </div>
        <span class="font-bold text-gray-700 text-sm group-hover:text-[#21618C] transition-colors">{{ cat.name }}</span>
      </button>
    </div>

    <!-- 4. 하단 정보 3분할 영역: 캘린더 / 인기글 / 도움된 글 -->
    <div class="bg-[#F4F7FA] -mx-4 px-4 py-8 rounded-3xl">
      <div class="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr] gap-5">
        <HomeCalendarWidget />
        <PostRankPanel
          title="가장 많이 본 글"
          icon="fa-fire"
          :items="topViewed"
          empty-message="아직 조회된 게시글이 없습니다."
        />
        <PostRankPanel
          title="좋아요 많은 글"
          icon="fa-thumbs-up"
          :items="topLiked"
          empty-message="아직 좋아요를 받은 게시글이 없습니다."
        />
      </div>
    </div>
  </div>
</template>
