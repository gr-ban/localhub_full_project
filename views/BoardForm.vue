<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const category = computed(() => route.params.category)
const id = computed(() => route.params.id)

const isEditMode = computed(() => !!id.value)
const posts = ref([])

const createEmptyForm = () => ({
  id: '', category: category.value, title: '', content: '', writer: '', password: ''
})

const form = ref(createEmptyForm())

const loadFormData = () => {
  const stored = localStorage.getItem('localhub_posts')
  posts.value = stored ? JSON.parse(stored) : []

  if (isEditMode.value) {
    const target = posts.value.find(p => p.id === id.value)
    form.value = target ? { ...target } : createEmptyForm()
  } else {
    form.value = createEmptyForm()
  }
}

onMounted(loadFormData)
watch(() => route.fullPath, loadFormData)

const handleSubmit = () => {
  if (isEditMode.value) {
    const idx = posts.value.findIndex(p => p.id === id.value)
    if (idx !== -1) posts.value[idx] = { ...posts.value[idx], ...form.value }
  } else {
    const newPost = {
      ...form.value,
      id: 'post_' + Date.now(),
      viewCount: 0,
      likes: 0,
      createdAt: new Date().toISOString()
    }
    posts.value.push(newPost)
  }

  localStorage.setItem('localhub_posts', JSON.stringify(posts.value))
 
  router.push(`/board/${category.value}`)
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-6 space-y-6">
    <h2 class="text-2xl font-black text-[#34495E] border-b pb-3">
      {{ isEditMode ? '게시글 수정' : '새 정보 등록' }}
    </h2>

    <form @submit.prevent="handleSubmit" class="bg-white p-6 rounded-2xl border space-y-4 shadow-sm">
      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">닉네임</label>
        <input type="text" v-model="form.writer" required :disabled="isEditMode" class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none disabled:bg-gray-100">
      </div>
      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">수정/삭제 비밀번호</label>
        <input type="password" v-model="form.password" required class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none">
      </div>
      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">글 제목</label>
        <input type="text" v-model="form.title" required class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#21618C]">
      </div>
      <div>
        <label class="block text-sm font-bold text-gray-700 mb-1">내용 정보</label>
        <textarea v-model="form.content" required rows="6" class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#21618C]"></textarea>
      </div>
      <div class="flex justify-end gap-2 text-sm font-bold pt-2">
        <button type="button" @click="router.back()" class="bg-gray-100 px-4 py-2 rounded-xl text-gray-600">취소</button>
        <button type="submit" class="bg-[#21618C] text-white px-5 py-2 rounded-xl">등록하기</button>
      </div>
    </form>
  </div>
</template>