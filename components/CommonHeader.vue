<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isBoardPage = computed(() => route.path.startsWith('/board'))

const goHome = () => router.push('/')

// 표시 라벨과 실제 라우트에 사용하는 슬러그를 분리
const boards = [
  { label: '관광지', slug: 'tourist' },
  { label: '레포츠', slug: 'leisure' },
  { label: '문화시설', slug: 'culture' },
  { label: '쇼핑', slug: 'shopping' },
  { label: '숙박', slug: 'accommodation' },
  { label: '여행코스', slug: 'course' },
  { label: '축제/공연', slug: 'festival' }
]

const goBoard = (slug) => {
  if (slug === 'info') {
    router.push('/info')
  } else {
    router.push(`/board/${encodeURIComponent(slug)}`)
  }
}
</script>

<template>
  <header v-if="isBoardPage" class="bg-[#21618C] text-white shadow-md sticky top-0 z-40">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button class="flex items-center gap-2 cursor-pointer" @click="goHome">
          <div class="bg-[#F4D03F] text-[#7E5109] p-2 rounded-lg font-black shadow-inner">
            <i class="fa-solid fa-map-location-dot"></i>
          </div>
          <span class="text-sm font-bold">홈으로</span>
        </button>

        <!-- explicit Info button -->
        <button class="ml-3 text-sm font-semibold px-3 py-1 rounded bg-white/10 hover:bg-white/20" @click="() => router.push('/info')">
          정보
        </button>

        <!-- 바로 이동 배너 (데스크탑) -->
        <nav class="hidden sm:flex items-center gap-2 ml-4">
          <template v-for="b in boards" :key="b.slug">
            <button
              @click="goBoard(b.slug)"
              class="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              {{ b.label }}
            </button>
          </template>
        </nav>
      </div>

      <!-- 모바일 토글 -->
      <div class="sm:hidden">
        <details class="text-right">
          <summary class="text-sm cursor-pointer">목록</summary>
          <div class="mt-2 flex flex-col gap-2">
            <button v-for="b in boards" :key="b.slug" @click="goBoard(b.slug)" class="text-sm text-left px-2 py-1 rounded hover:bg-white/10">
              {{ b.label }}
            </button>
          </div>
        </details>
      </div>
    </div>
  </header>
</template>