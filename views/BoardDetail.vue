<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { category, id } = route.params

const post = ref(null)
const posts = ref([])

// 익명 패스워드 검증 모달 상태 제어 (초기값 반드시 false)
const showAuthModal = ref(false)
const authActionType = ref('') // 'edit' 또는 'delete'
const inputPassword = ref('')
const authError = ref('')

onMounted(() => {
  const stored = localStorage.getItem('localhub_posts')
  if (stored) {
    posts.value = JSON.parse(stored)
    post.value = posts.value.find(p => p.id === id)
  }
})

const handleLike = () => {
  if (!post.value) return
  post.value.likes++
  localStorage.setItem('localhub_posts', JSON.stringify(posts.value))
}

const openAuthModal = (action) => {
  authActionType.value = action
  inputPassword.value = ''
  authError.value = ''
  showAuthModal.value = true
}

const confirmAuth = () => {
  if (post.value.password !== inputPassword.value) {
    authError.value = '비밀번호가 일치하지 않습니다.'
    return
  }

  showAuthModal.value = false
  if (authActionType.value === 'delete') {
    const updated = posts.value.filter(p => p.id !== id)
    localStorage.setItem('localhub_posts', JSON.stringify(updated))
    // [수정] alert() 제거 — 블로킹 팝업 직후 SPA 페이지 전환 시 입력/클릭 먹통 현상의 원인이라 삭제
    router.push(`/board/${category}`)
  } else if (authActionType.value === 'edit') {
    router.push(`/board/${category}/${id}/edit`)
  }
}
</script>

<template>
  <div v-if="post" class="max-w-3xl mx-auto px-4 py-6 space-y-6">
    <button @click="router.push(`/board/${category}`)" class="text-sm font-bold text-[#21618C] hover:underline">
      ← 목록으로 돌아가기
    </button>

    <div class="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div class="bg-gray-50 p-6 border-b">
        <h2 class="text-2xl font-black text-gray-800 mb-3">{{ post.title }}</h2>
        <div class="flex justify-between text-xs text-gray-400 font-medium">
          <div>작성자: <span class="text-gray-700 font-bold">{{ post.writer }}</span></div>
          <div class="space-x-3">
            <span>조회수 {{ post.viewCount }}</span>
            <span>좋아요 {{ post.likes }}</span>
          </div>
        </div>
      </div>

      <div class="p-6 text-gray-700 leading-relaxed min-h-[200px] whitespace-pre-wrap">{{ post.content }}</div>

      <div class="flex justify-center pb-8">
        <button @click="handleLike" class="bg-[#E74C3C]/10 text-[#E74C3C] px-6 py-2.5 rounded-xl font-bold hover:bg-[#E74C3C]/20 transition flex items-center gap-2">
          <i class="fa-solid fa-heart"></i> 유익해요 {{ post.likes }}
        </button>
      </div>

      <div class="bg-gray-50 px-6 py-4 flex justify-end gap-2 border-t">
        <button @click="openAuthModal('edit')" class="bg-white border px-4 py-2 rounded-lg text-xs font-bold text-[#34495E] hover:bg-gray-100">수정</button>
        <button @click="openAuthModal('delete')" class="bg-[#E74C3C]/10 text-[#E74C3C] px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#E74C3C] hover:text-white">삭제</button>
      </div>
    </div>

    <div v-if="showAuthModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white max-w-sm w-full rounded-2xl p-5 space-y-4 shadow-xl">
        <h3 class="text-base font-bold text-gray-800"><i class="fa-solid fa-shield-halved text-[#9B59B6] mr-1"></i> 익명 권한 확인</h3>
        <p class="text-xs text-gray-500">작성 시 설정한 글 비밀번호를 입력해 주세요.</p>
        <input type="password" v-model="inputPassword" placeholder="비밀번호 입력" class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#21618C]" @keyup.enter="confirmAuth">
        <p v-if="authError" class="text-xs text-[#E74C3C] font-semibold">{{ authError }}</p>
        <div class="flex justify-end gap-2 text-xs font-bold">
          <button @click="showAuthModal = false" class="bg-gray-100 px-3 py-2 rounded-lg text-gray-600">취소</button>
          <button @click="confirmAuth" class="bg-[#21618C] text-white px-4 py-2 rounded-lg">확인</button>
        </div>
      </div>
    </div>
  </div>
</template>