<script setup>
defineProps({
  title: { type: String, required: true },
  icon: { type: String, required: true },
  items: { type: Array, default: () => [] },
  emptyMessage: { type: String, default: '아직 등록된 게시글이 없습니다.' }
})

const showMore = () => {
  alert('전체 게시글 모아보기 페이지는 준비 중입니다.')
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col h-full">
    <div class="flex items-center justify-between mb-4">
      <h3 class="flex items-center gap-2 font-bold text-[#34495E] text-sm">
        <i :class="`fa-solid ${icon} text-[#21618C]`"></i>
        {{ title }}
      </h3>
      <button
        @click="showMore"
        class="text-xs font-semibold text-gray-400 hover:text-[#21618C] transition flex items-center gap-1"
      >
        더보기 <i class="fa-solid fa-plus text-[10px]"></i>
      </button>
    </div>

    <div v-if="items.length" class="space-y-3 flex-1">
      <router-link
        v-for="(post, idx) in items"
        :key="post.id"
        :to="`/board/${post.category}/${post.id}`"
        class="flex items-center gap-2 text-sm text-gray-600 hover:text-[#21618C] transition group"
      >
        <span class="text-xs font-bold text-gray-300 w-3 shrink-0">{{ idx + 1 }}</span>
        <span class="truncate flex-1 group-hover:underline">{{ post.title }}</span>
        <span
          v-if="post.isNew"
          class="shrink-0 bg-[#E74C3C] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
        >N</span>
      </router-link>
    </div>

    <div v-else class="flex-1 flex flex-col items-center justify-center text-center py-6 text-gray-300 gap-2">
      <i class="fa-solid fa-inbox text-2xl"></i>
      <p class="text-xs text-gray-400">{{ emptyMessage }}</p>
    </div>
  </div>
</template>
