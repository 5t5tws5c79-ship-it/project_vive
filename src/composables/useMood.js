import { computed, ref, watch } from 'vue'
import { DEFAULT_MOOD_ID, MOODS, moodById } from '../config/moods'
import { inferMood, kstHour } from '../lib/moodEngine'

// 무드 추론 — 근처 장소가 바뀌면 무드를 자동으로 다시 판단한다(LLM 주 + 규칙 폴백).
// mood_player 의 moodEngine.inferMood 를 그대로 사용. 키가 없으면 규칙 폴백으로 동작.
// 사용자가 MoodCard 에서 직접 고르면 setMood 로 즉시 덮어쓸 수 있다.
export function useMood(places) {
  const moodId = ref(DEFAULT_MOOD_ID)
  const mood = computed(() => moodById(moodId.value))
  const moodInfo = ref(null) // { moodId, confidence, reason, decidedBy, note? }

  // src place → 엔진 입력 { title, typeId, dist, type(라벨) }
  function adapt(list) {
    return list.map((p) => ({
      title: p.title,
      typeId: p.typeId, // 로컬 POI 만 보유(카카오는 undefined → 규칙은 기본 폴백, LLM 은 라벨 사용)
      dist: p.distanceM,
      type: typeof p.type === 'string' ? p.type : p.type?.label,
    }))
  }

  let requestId = 0

  watch(
    places,
    async (list) => {
      if (!list || list.length === 0) return
      const id = ++requestId
      const result = await inferMood(adapt(list), kstHour(), import.meta.env.VITE_OPENAI_API_KEY)
      if (id !== requestId) return // 더 최신 요청이 있으면 이 결과는 버린다
      moodId.value = result.moodId
      moodInfo.value = result
    },
    { immediate: true },
  )

  // 수동 오버라이드 (MoodCard 무드 칩 선택)
  function setMood(id) {
    requestId++ // 진행 중인 자동추론 결과가 사용자의 선택을 덮지 않게
    moodId.value = id
    moodInfo.value = { moodId: id, reason: '직접 선택한 무드', decidedBy: 'manual', confidence: 1 }
  }

  return { moodId, mood, setMood, moods: MOODS, moodInfo }
}
