import { computed, ref } from 'vue'
import { DEFAULT_MOOD_ID, MOODS, moodById } from '../config/moods'

// 【플레이스홀더】 무드 추론 로직은 의도적으로 비어 있다.
//
// 지금은 디자인과 동작 플로우만 보기 위한 단계라, 무드를 자동으로 계산하지 않고
// 사용자가 직접 고른다. 어떤 무드를 골라도 화면 색·플레이리스트·플레이어가
// 실제로 전환되므로, 추론 로직이 정해지면 setMood()를 그 결과로 호출하기만 하면 된다.
//
// 나중에 추론을 붙일 자리:
//   watch(places, async (nearby) => setMood(await decideMood(nearby)))
export function useMoodPlaceholder() {
  const moodId = ref(DEFAULT_MOOD_ID)

  const mood = computed(() => moodById(moodId.value))

  function setMood(id) {
    moodId.value = id
  }

  return { moodId, mood, setMood, moods: MOODS }
}
