<script setup>
import { ref } from 'vue'

const totalPostCount = ref(0)

// 로컬스토리지에 등록된 실제 글 수 로드
const updateCount = () => {
  const stored = localStorage.getItem('localhub_posts')
  if (stored) {
    totalPostCount.value = JSON.parse(stored).length
  }
}
updateCount()
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
    <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p class="text-xs text-slate-400 font-semibold">오늘의 지역 날씨</p>
        <h3 class="text-xl font-bold text-[#34495E] mt-1">맑음, 24°C</h3>
        <p class="text-xs text-emerald-600 mt-1"><i class="fa-solid fa-umbrella"></i> 강수확률 10%</p>
      </div>
      <i class="fa-solid fa-cloud-sun text-4xl text-[#F4D03F]"></i>
    </div>
    <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p class="text-xs text-slate-400 font-semibold">현재 추천 테마</p>
        <h3 class="text-xl font-bold text-[#21618C] mt-1">여름 축제 & 레포츠</h3>
        <p class="text-xs text-slate-500 mt-1">전국 42개 행사 진행 중</p>
      </div>
      <i class="fa-solid fa-calendar-check text-4xl text-[#9B59B6]"></i>
    </div>
    <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p class="text-xs text-slate-400 font-semibold">누적 공유 정보</p>
        <h3 class="text-xl font-bold text-[#7E5109] mt-1">로컬 스토리</h3>
        <p class="text-xs text-[#E74C3C] mt-1"><i class="fa-solid fa-fire"></i> 실시간 업데이트 중</p>
      </div>
      <i class="fa-solid fa-database text-4xl text-slate-300"></i>
    </div>
  </div>
</template>