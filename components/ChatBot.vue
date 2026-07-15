<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import localData from '../assets/data/local-data.json'
import tourismData from '../assets/data/서울_관광지.json'
import leisureData from '../assets/data/서울_레포츠.json'
import cultureData from '../assets/data/서울_문화시설.json'
import shoppingData from '../assets/data/서울_쇼핑.json'
import lodgingData from '../assets/data/서울_숙박.json'
import courseData from '../assets/data/서울_여행코스.json'
import festivalData from '../assets/data/서울_축제공연행사.json'

const isChatOpen = ref(true)
const isChatLoading = ref(false)
const chatInput = ref('')
const chatMessages = ref([])
const chatContainer = ref(null)

const categories = [
  { label: '관광지', value: '관광지' },
  { label: '레포츠', value: '레포츠' },
  { label: '문화시설', value: '문화시설' },
  { label: '쇼핑', value: '쇼핑' },
  { label: '숙박', value: '숙박' },
  { label: '여행코스', value: '여행코스' },
  { label: '축제 공연행사', value: '축제 공연행사' }
]

const extractDistrict = (address = '') => {
  if (!address) return '기타'
  const match = address.match(/서울특별시\s([^\s]+구)/)
  return match?.[1] || '기타'
}

const normalizeItems = (source, category) => {
  if (!source) return []
  const items = Array.isArray(source) ? source : source.items || []
  
  return items.map((item) => ({
    region: item.region || '서울',
    category,
    name: item.title || item.name || '이름 없음',
    address: item.addr1 || item.address || '',
    fee: item.fee || item.charge || item.adult || item.price || '정보 없음',
    parking: item.parking || '정보 없음',
    desc: item.overview || item.desc || item.summary || '상세 설명이 없습니다.',
    keywords: item.keywords || [],
    gu: extractDistrict(item.addr1 || item.address || '')
  }))
}

const categorySourceMap = {
  '관광지': tourismData,
  '레포츠': leisureData,
  '문화시설': cultureData,
  '쇼핑': shoppingData,
  '숙박': lodgingData,
  '여행코스': courseData,
  '축제 공연행사': festivalData
}

const seoulPublicData = computed(() => {
  const importedData = Object.entries(categorySourceMap).flatMap(([category, source]) => 
    normalizeItems(source, category)
  )
  
  const fallbackData = Array.isArray(localData)
    ? localData.filter((item) => item.region === '서울').map((item) => ({
        ...item,
        gu: extractDistrict(item.address || '')
      }))
    : []

  return [...importedData, ...fallbackData].filter(
    (item) => item.region === '서울' || item.address?.includes('서울')
  )
})

const stage = ref(1)
const selectedCategory = ref('')
const selectedDistrict = ref('')
const viewedLocations = ref([])

const scrollToBottom = () => {
  nextTick(() => {
    window.requestAnimationFrame(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
      }
    })
  })
}

watch([chatMessages, isChatLoading], () => {
  scrollToBottom()
}, { deep: true, flush: 'post' })

onMounted(() => {
  scrollToBottom()
})

const districtOptions = computed(() => {
  if (!selectedCategory.value) return []
  const guValues = [...new Set(
    seoulPublicData.value
      .filter((item) => item.category === selectedCategory.value)
      .map((item) => item.gu)
  )]
  return guValues.map((gu) => ({ label: gu, value: gu }))
})

const filteredItems = computed(() => {
  if (!selectedCategory.value || !selectedDistrict.value) return []
  return seoulPublicData.value.filter(
    (item) =>
      item.category === selectedCategory.value &&
      (item.gu === selectedDistrict.value || item.address.includes(selectedDistrict.value)) &&
      !viewedLocations.value.includes(item.name)
  )
})

const formatLocationList = (list) => {
  if (!list.length) return '해당 구에 등록된 정보가 없습니다.'
  return list
    .slice(0, 5)
    .map((item, index) => `${index + 1}. ${item.name}`)
    .join('\n')
}

const findPlaceByText = (text) => {
  const lower = text.toLowerCase()
  return seoulPublicData.value.find((item) => {
    const searchableText = [item.name, item.category, item.address, item.desc, ...(item.keywords || [])]
      .join(' ')
      .toLowerCase()
    return searchableText.includes(lower)
  })
}

const handleCategorySelect = (category) => {
  if (isChatLoading.value) return
  selectedCategory.value = category
  selectedDistrict.value = ''
  stage.value = 2
  chatMessages.value.push({ role: 'user', content: category })
  chatMessages.value.push({
    role: 'assistant',
    content: `📌 [${category}] 카테고리를 선택하셨습니다. 이제 서울시의 구를 선택해 주세요.`
  })
  scrollToBottom()
}

const handleDistrictSelect = (district) => {
  if (isChatLoading.value) return
  selectedDistrict.value = district
  stage.value = 3
  chatMessages.value.push({ role: 'user', content: district })

  const matches = filteredItems.value
  let reply = ''
  if (matches.length > 0) {
    reply = `✅ [${selectedCategory.value} / ${district}] 선택 결과입니다.\n${formatLocationList(matches)}\n원하시는 장소를 입력하거나 아래 버튼을 눌러 장소 정보를 확인해 보세요.`
  } else {
    reply = `⚠️ [${selectedCategory.value} / ${district}]에 해당하는 정보가 없습니다. 다른 구를 선택해 주세요.`
  }

  chatMessages.value.push({ role: 'assistant', content: reply })
  scrollToBottom()
}

const handleLocationSelect = (location) => {
  if (isChatLoading.value) return
  chatMessages.value.push({ role: 'user', content: location.name })

  const reply = `📍 ${location.name}\n분류: ${location.category}\n주소: ${location.address}\n이용 요금: ${location.fee}\n주차 여부: ${location.parking}\n특징: ${location.desc}`
  chatMessages.value.push({ role: 'assistant', content: reply })

  if (!viewedLocations.value.includes(location.name)) {
    viewedLocations.value.push(location.name)
  }

  scrollToBottom()
}

const resetSelection = () => {
  stage.value = 1
  selectedDistrict.value = ''
  chatMessages.value.push({ role: 'assistant', content: '🔄 카테고리 선택으로 돌아갑니다.' })
  scrollToBottom()
}

const clearConversation = () => {
  stage.value = 1
  selectedCategory.value = ''
  selectedDistrict.value = ''
  viewedLocations.value = []
  chatInput.value = ''
  chatMessages.value = []
  chatMessages.value.push({ role: 'assistant', content: '🧹 대화가 초기화되었습니다. 카테고리를 선택해 시작하세요.' })
  scrollToBottom()
}

const reselectDistrict = () => {
  stage.value = 2
  chatMessages.value.push({ role: 'assistant', content: '🔄 구 선택으로 돌아갑니다.' })
  scrollToBottom()
}

const sendMessage = () => {
  if (!chatInput.value.trim() || isChatLoading.value) return

  const userText = chatInput.value
  chatMessages.value.push({ role: 'user', content: userText })
  chatInput.value = ''
  isChatLoading.value = true

  setTimeout(() => {
    const lower = userText.toLowerCase()
    let reply = '죄송합니다. 이해하지 못했습니다. 아래 버튼을 선택하거나, 카테고리/구 이름 또는 장소 이름을 입력해 주세요.'

    const matchedPlace = findPlaceByText(userText)
    if (matchedPlace) {
      selectedCategory.value = matchedPlace.category
      selectedDistrict.value = matchedPlace.gu || matchedPlace.address.match(/서울특별시\s([^\s]+구)/)?.[1] || ''
      stage.value = 3
      reply = `🔍 [직접 검색]
장소: ${matchedPlace.name}
분류: ${matchedPlace.category}
주소: ${matchedPlace.address}
이용 요금: ${matchedPlace.fee}
주차 여부: ${matchedPlace.parking}
특징: ${matchedPlace.desc}`
      if (!viewedLocations.value.includes(matchedPlace.name)) {
        viewedLocations.value.push(matchedPlace.name)
      }
    } else {
      const matchedCategory = categories.find((option) => lower.includes(option.value.toLowerCase()))
      if (matchedCategory) {
        selectedCategory.value = matchedCategory.value
        selectedDistrict.value = ''
        stage.value = 2
        reply = `📌 [${matchedCategory.label}] 카테고리를 선택하셨습니다. 이제 서울시의 구를 선택해 주세요.`
      } else if (selectedCategory.value) {
        const matchedDistrict = districtOptions.value.find((option) => lower.includes(option.value.toLowerCase()))
        if (matchedDistrict) {
          selectedDistrict.value = matchedDistrict.value
          stage.value = 3
          const matches = filteredItems.value
          if (matches.length > 0) {
            reply = `✅ [${selectedCategory.value} / ${matchedDistrict.value}] 선택 결과입니다.\n${formatLocationList(matches)}\n원하시는 장소를 입력하거나 다른 구를 선택해 보세요.`
          } else {
            reply = `⚠️ [${selectedCategory.value} / ${matchedDistrict.value}]에 해당하는 정보가 없습니다. 다른 구를 선택해 주세요.`
          }
        }
      } else if (lower.includes('처음') || lower.includes('카테고리') || lower.includes('메뉴')) {
        reply = '📌 카테고리를 선택해 주세요.'
        stage.value = 1
        selectedCategory.value = ''
        selectedDistrict.value = ''
      }
    }

    chatMessages.value.push({ role: 'assistant', content: reply })
    isChatLoading.value = false

    scrollToBottom()
  }, 500)
}
</script>

<template>
  <div class="fixed bottom-6 right-6 left-6 sm:left-auto z-50 flex items-end justify-end gap-3">
    <div v-if="isChatOpen" class="w-full max-w-sm sm:w-96 h-[min(520px,75vh)] bg-[#F8FAFC] rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.18)] border border-gray-200 flex flex-col overflow-hidden">
      <div class="bg-[#2F4F4F] text-white p-4 font-bold text-sm flex items-center justify-between">
        <div class="flex items-center gap-2 min-w-0">
          <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">🤖</div>
          <span class="whitespace-nowrap">오랫봇</span>
        </div>
        <div class="flex items-center gap-2">
          <button @click="clearConversation" title="대화 지우기" class="text-sm text-white/90 hover:text-white/100 p-2 rounded-md hover:bg-white/5 flex items-center gap-2">
            <i class="fa-solid fa-trash"></i>
            <span>대화 클리어</span>
          </button>
        </div>
      </div>

      <div class="flex-1 min-h-0 bg-[#F7F9FB]">
        <div ref="chatContainer" class="h-full overflow-y-auto overflow-x-hidden p-4 text-sm scroll-smooth">
          <div class="max-w-[85%] rounded-2xl rounded-bl-md bg-white p-3 border border-gray-200 leading-relaxed text-gray-700 shadow-sm mb-4">
            안녕하세요! 오랫봇입니다. 아래 버튼을 눌러 먼저 카테고리와 구를 순서대로 선택해 주세요.
            또는 원하는 장소 이름을 입력해도 바로 검색할 수 있습니다.
          </div>

          <div class="space-y-3">
            <div v-for="(msg, i) in chatMessages" :key="i"
                 :class="['max-w-[85%] rounded-2xl whitespace-pre-line leading-relaxed p-3 shadow-sm', msg.role === 'user' ? 'bg-[#2F4F4F] text-white ml-auto rounded-br-md' : 'bg-white border border-gray-200 text-gray-700']">
              {{ msg.content }}
            </div>
          </div>

          <div v-if="isChatLoading" class="text-gray-400 animate-pulse text-xs mt-2">● ● ● 답변 분석 중...</div>

          <!-- [수정] 선택지 버튼을 하단 고정 영역이 아니라 스크롤 영역 안으로 이동 -->
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div v-if="stage === 1" class="grid grid-cols-2 gap-2 mb-3">
              <button v-for="option in categories" :key="option.value" @click="handleCategorySelect(option.value)" class="rounded-2xl border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-700 hover:bg-[#F0F9FF] transition">
                {{ option.label }}
              </button>
            </div>

            <div v-if="stage === 2" class="space-y-4 mb-3">
              <div class="rounded-2xl border border-dashed border-gray-300 bg-white p-3 text-xs text-gray-700">
                📌 선택된 카테고리: <strong>{{ selectedCategory }}</strong>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <button v-for="option in districtOptions" :key="option.value" @click="handleDistrictSelect(option.value)" class="rounded-2xl border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-700 hover:bg-[#F0F9FF] transition">
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div v-if="stage === 3" class="space-y-3 mb-3">
              <div class="rounded-2xl border border-dashed border-gray-300 bg-white p-3 text-xs text-gray-700">
                📌 선택된 카테고리: <strong>{{ selectedCategory }}</strong><br />
                📌 선택된 구: <strong>{{ selectedDistrict }}</strong>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <button @click="resetSelection" class="rounded-2xl border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-700 hover:bg-[#F0F9FF] transition">
                  카테고리 다시 선택
                </button>
                <button @click="reselectDistrict" class="rounded-2xl border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-700 hover:bg-[#F0F9FF] transition">
                  구 다시 선택
                </button>
              </div>
              <div v-if="filteredItems.length" class="space-y-2 pt-3">
                <div class="text-xs font-semibold text-gray-500">장소를 눌러 상세 정보를 확인하세요.</div>
                <div class="grid grid-cols-1 gap-2">
                  <button v-for="item in filteredItems.slice(0, 5)" :key="item.name" @click="handleLocationSelect(item)" class="rounded-2xl border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-700 hover:bg-[#F0F9FF] transition text-left">
                    {{ item.name }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-3 border-t bg-white flex gap-2">
        <input type="text" v-model="chatInput" @keyup.enter="sendMessage" placeholder="메시지를 입력하세요" class="flex-1 bg-gray-50 border border-gray-200 rounded-full px-3 py-2 text-sm focus:outline-none focus:bg-white">
        <button @click="sendMessage" class="bg-[#2F4F4F] text-white px-4 py-2 rounded-full text-sm font-bold">전송</button>
      </div>
    </div>

    <button @click="isChatOpen = !isChatOpen" class="bg-[#F4D03F] text-[#7E5109] w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-xl transition transform hover:scale-105 border border-[#E5C04B]">
      <i v-if="!isChatOpen" class="fa-solid fa-comments"></i>
      <i v-else class="fa-solid fa-chevron-left"></i>
    </button>
  </div>
</template>