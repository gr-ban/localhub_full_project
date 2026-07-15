<script setup>
import { ref, computed, onMounted } from 'vue'

const today = new Date()
const viewYear = ref(today.getFullYear())
const viewMonth = ref(today.getMonth()) // 0-indexed

// 해당 월에 등록된 게시글이 있는 날짜(점 표시용) - localhub_posts 기준
const postDatesInMonth = ref(new Set())

const loadPostDates = () => {
  const stored = localStorage.getItem('localhub_posts')
  const posts = stored ? JSON.parse(stored) : []
  const set = new Set()
  posts.forEach((p) => {
    if (!p.createdAt) return
    const d = new Date(p.createdAt)
    if (d.getFullYear() === viewYear.value && d.getMonth() === viewMonth.value) {
      set.add(d.getDate())
    }
  })
  postDatesInMonth.value = set
}

onMounted(loadPostDates)

const monthLabel = computed(() => `${viewYear.value}.${String(viewMonth.value + 1).padStart(2, '0')}`)

const weeks = computed(() => {
  const firstDay = new Date(viewYear.value, viewMonth.value, 1)
  const lastDate = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()
  const startOffset = firstDay.getDay() // 0=일요일

  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= lastDate; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const rows = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
  return rows
})

const isToday = (day) =>
  day === today.getDate() &&
  viewMonth.value === today.getMonth() &&
  viewYear.value === today.getFullYear()

const changeMonth = (delta) => {
  let m = viewMonth.value + delta
  let y = viewYear.value
  if (m < 0) { m = 11; y -= 1 }
  if (m > 11) { m = 0; y += 1 }
  viewMonth.value = m
  viewYear.value = y
  loadPostDates()
}

const weekdays = ['일', '월', '화', '수', '목', '금', '토']
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <button
        @click="changeMonth(-1)"
        class="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-[#21618C] transition"
      >
        <i class="fa-solid fa-chevron-left text-xs"></i>
      </button>
      <h3 class="font-black text-[#21618C] text-base tracking-tight">{{ monthLabel }}</h3>
      <button
        @click="changeMonth(1)"
        class="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-[#21618C] transition"
      >
        <i class="fa-solid fa-chevron-right text-xs"></i>
      </button>
    </div>

    <div class="grid grid-cols-7 text-center text-xs font-bold text-gray-400 mb-2">
      <span
        v-for="(w, i) in weekdays"
        :key="w"
        :class="i === 0 ? 'text-[#E74C3C]' : i === 6 ? 'text-[#21618C]' : ''"
      >{{ w }}</span>
    </div>

    <div class="grid grid-cols-7 gap-y-1 text-center text-sm flex-1">
      <template v-for="(row, ri) in weeks" :key="ri">
        <div v-for="(day, ci) in row" :key="ci" class="h-8 flex items-center justify-center relative">
          <span
            v-if="day"
            :class="[
              'w-7 h-7 flex items-center justify-center rounded-full transition',
              isToday(day)
                ? 'bg-[#F4D03F] text-[#7E5109] font-bold'
                : ci === 0 ? 'text-[#E74C3C]' : ci === 6 ? 'text-[#21618C]' : 'text-gray-600'
            ]"
          >
            {{ day }}
          </span>
          <span
            v-if="day && postDatesInMonth.has(day) && !isToday(day)"
            class="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#21618C]"
          ></span>
        </div>
      </template>
    </div>
  </div>
</template>
