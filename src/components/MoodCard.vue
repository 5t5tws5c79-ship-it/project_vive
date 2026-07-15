<script setup>
import { computed, ref } from 'vue'
import { moodTracks } from '../data/placeholder'

const props = defineProps({
  mood: { type: Object, required: true },
  moods: { type: Array, required: true },
  moodInfo: { type: Object, default: null },
  places: { type: Array, default: () => [] },
  analyzing: { type: Boolean, default: false },
})

const emit = defineEmits(['select'])

const isOpen = ref(false)

// 【플레이스홀더】 실제로는 이 무드로 등록된 커뮤니티 글에서 곡을 모아온다.
// mood가 바뀌면 리스트도 자동으로 새 무드 것으로 바뀐다.
const tracks = computed(() => moodTracks(props.mood.id))

// mood_player/player.html의 .mp-tag/.mp-near/.mp-reason과 동일한 정보를 보여준다.
const decidedByLabel = computed(() => {
  const by = props.moodInfo?.decidedBy
  return by === 'llm' ? 'LLM' : by === 'rule' ? '규칙' : '수동'
})
const confidencePct = computed(() => Math.round((props.moodInfo?.confidence || 0) * 100))
const nearbySummary = computed(() => {
  if (!props.places.length) return ''
  const rest = props.places.length - 1
  return props.places[0].title + (rest > 0 ? ` 외 ${rest}곳` : '')
})
</script>

<template>
  <section class="card mood">
    <header class="head">
      <h2 class="card__title">지금의 무드</h2>
      <span v-if="moodInfo" class="badge">{{ decidedByLabel }} {{ confidencePct }}%</span>
    </header>

    <h3 class="label">{{ mood.label }}</h3>
    <p class="desc">{{ mood.description }}</p>

    <p v-if="nearbySummary" class="near">근처: {{ nearbySummary }}</p>
    <p v-if="analyzing || moodInfo?.reason" class="reason">
      {{ analyzing ? '무드 분석 중…(LLM)' : moodInfo.reason }}
    </p>

    <!-- 자동 추론된 무드. 직접 눌러서 다른 무드로 바꿀 수도 있다 -->
    <div class="picker" role="radiogroup" aria-label="무드 선택">
      <button
        v-for="m in moods"
        :key="m.id"
        role="radio"
        :aria-checked="m.id === mood.id"
        class="chip"
        :class="{ 'chip--on': m.id === mood.id }"
        :style="{ '--chip': m.color }"
        @click="emit('select', m.id)"
      >
        {{ m.label }}
      </button>
    </div>

    <!-- 이 무드로 유저들이 추천한 곡 -->
    <button class="toggle" :aria-expanded="isOpen" @click="isOpen = !isOpen">
      <span>'{{ mood.label }}' 무드의 다른 곡 {{ tracks.length }}개</span>
      <svg
        class="toggle__arrow"
        :class="{ 'toggle__arrow--up': isOpen }"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M6 9 L12 15 L18 9" />
      </svg>
    </button>

    <template v-if="isOpen">
      <ul v-if="tracks.length" class="list">
        <li v-for="track in tracks" :key="track.id" class="track">
          <span class="track__art" aria-hidden="true">♪</span>
          <div class="track__body">
            <p class="track__title">{{ track.title }}</p>
            <p class="track__meta">{{ track.artist }} · 📍 {{ track.place }}</p>
          </div>
          <span class="track__likes">♥ {{ track.likes }}</span>
          <button class="track__play" aria-label="재생">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <!-- 뷰박스 중심(12) 기준 +1 우측 광학 보정된 삼각형 -->
              <polygon points="8.5,6.5 17.5,12 8.5,17.5" fill="currentColor" stroke="none" />
            </svg>
          </button>
        </li>
      </ul>

      <p v-else class="empty">아직 이 무드로 추천된 곡이 없습니다. 첫 곡을 추천해보세요.</p>
    </template>
  </section>
</template>

<style scoped>
/* 섹션 자체를 무드색으로: 배경·테두리 = 무드색, 내부 텍스트 = 검정 계열, 버튼 = 흰색 */
.mood {
  background: var(--mood);
  /* 배경과 같은 색이면 테두리가 안 보이므로, 무드색을 살짝 어둡게 만든 톤 */
  border-color: color-mix(in srgb, var(--mood) 62%, #0d1014);
  color: #14171b;
}

.mood .card__title {
  color: rgba(13, 16, 20, 0.62);
}

.mood .badge {
  background: rgba(255, 255, 255, 0.88);
  border-color: transparent;
  color: #33383f;
}

.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.label {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #0d1014;
}

.desc {
  margin: 8px 0 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(13, 16, 20, 0.72);
}

.near {
  margin: 10px 0 0;
  font-size: 0.8rem;
  color: rgba(13, 16, 20, 0.7);
}

.reason {
  margin: 4px 0 0;
  font-size: 0.78rem;
  font-style: italic;
  line-height: 1.5;
  color: rgba(13, 16, 20, 0.55);
}

.picker {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid rgba(13, 16, 20, 0.18);
}

/* 무드 버튼: 기본은 흰색 */
.chip {
  min-height: 40px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid #0d1014;
  background: #ffffff;
  font-size: 0.82rem;
  color: #4a505a;
  transition: border-color 0.2s, background 0.2s, color 0.2s, transform 0.12s;
}

.chip:hover {
  color: #0d1014;
  border-color: rgba(13, 16, 20, 0.25);
}

/* 활성 무드 버튼: 무드색보다 채도를 끌어올린 쨍한 톤 */
.chip--on {
  background: var(--chip); /* 상대 색상 문법 미지원 브라우저용 폴백 */
  background: oklch(from var(--chip) calc(l * 0.92) calc(c * 2.1) h);
  border-color: #0d1014;
  color: #0d1014;
  font-weight: 600;
}

.toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  min-height: 46px;
  margin-top: 14px;
  padding: 0 13px;
  border-radius: var(--radius-sm);
  border: 1px solid #0d1014;
  background: #ffffff;
  font-size: 0.83rem;
  color: #33383f;
  transition: border-color 0.2s;
}

.toggle:hover {
  border-color: #0d1014;
  color: #0d1014;
}

.toggle__arrow {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toggle__arrow--up {
  transform: rotate(-180deg);
}

.list {
  display: grid;
  gap: 7px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
}

.track {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 11px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.92);
}

.track__art {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--mood) 26%, #ffffff);
  color: color-mix(in srgb, var(--mood) 62%, #14171b);
  font-size: 0.85rem;
}

.track__body {
  flex: 1;
  min-width: 0;
}

.track__title {
  margin: 0;
  font-size: 0.87rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track__meta {
  margin: 2px 0 0;
  font-size: 0.7rem;
  color: rgba(13, 16, 20, 0.55);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track__likes {
  flex-shrink: 0;
  font-size: 0.72rem;
  color: rgba(13, 16, 20, 0.55);
  font-variant-numeric: tabular-nums;
}

.track__play {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #0d1014;
  background: #ffffff;
  color: #33383f;
}

.track__play svg {
  width: 16px;
  height: 16px;
}

.track__play:hover {
  border-color: #0d1014;
  color: #0d1014;
}

.empty {
  margin: 10px 0 0;
  padding: 18px 0;
  text-align: center;
  font-size: 0.8rem;
  line-height: 1.6;
  color: rgba(13, 16, 20, 0.6);
}
</style>