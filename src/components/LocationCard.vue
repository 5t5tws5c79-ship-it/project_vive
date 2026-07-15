<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue'
import { LOCATION_SOURCE_LABEL } from '../composables/useGeolocation'
import { loadKakaoSdk } from '../lib/kakao'
import { formatDistance } from '../lib/geo'

const props = defineProps({
  location: { type: Object, default: null },
  status: { type: String, required: true },
  error: { type: String, default: '' },
  mode: { type: String, default: 'gps' },
  demoRoute: { type: Array, default: () => [] },
  demoIndex: { type: Number, default: 0 },
  // 무드 추론에 영향을 준 근처 장소 — 카테고리별 모양이 다른 핀으로 지도에 같이 찍는다
  places: { type: Array, default: () => [] },
})

const emit = defineEmits(['relocate', 'goto-demo', 'next-step'])
const mapEl = ref(null)
const mapReady = ref(false)
const selected = ref(null)
let map = null
let marker = null
let kakaoRef = null
let overlays = []

// 지금 places에 실제로 등장하는 카테고리만 모아 범례로 보여준다
const legend = computed(() => {
  const seen = new Map()
  for (const p of props.places) {
    if (!seen.has(p.type.shape)) seen.set(p.type.shape, p.type)
  }
  return [...seen.values()]
})

function clearOverlays() {
  overlays.forEach((o) => o.setMap(null))
  overlays = []
}

// CustomOverlay의 content는 Vue 렌더 트리 밖(지도 SDK 내부 DOM)에 붙기 때문에
// scoped 스타일이 안 먹는다 — 핀 모양은 아래 비-scoped 스타일 블록에 있다.
function makePinEl(place) {
  const el = document.createElement('div')
  el.className = `svmap-pin svmap-pin--${place.type.shape}`
  el.innerHTML = `<span class="svmap-pin__icon">${place.type.icon}</span>`
  el.addEventListener('click', () => {
    selected.value = place
  })
  return el
}

function renderPlacePins(center) {
  if (!map || !kakaoRef) return
  clearOverlays()

  if (!props.places.length) return

  const bounds = new kakaoRef.maps.LatLngBounds()
  bounds.extend(center)

  props.places.forEach((place) => {
    if (!place.coords) return
    const [lat, lng] = place.coords
    const pos = new kakaoRef.maps.LatLng(lat, lng)
    bounds.extend(pos)

    const overlay = new kakaoRef.maps.CustomOverlay({
      position: pos,
      content: makePinEl(place),
      yAnchor: 1,
    })
    overlay.setMap(map)
    overlays.push(overlay)
  })

  map.setBounds(bounds)
}

async function initMap(loc) {
  try {
    const kakao = await loadKakaoSdk()
    kakaoRef = kakao
    await nextTick()
    if (!mapEl.value) return
    const center = new kakao.maps.LatLng(loc.lat, loc.lng)
    if (!map) {
      map = new kakao.maps.Map(mapEl.value, { center, level: 4 })
      setTimeout(() => {
        map.relayout()
        map.setCenter(center)
        renderPlacePins(center)
      }, 250)
    } else {
      map.setCenter(center)
      renderPlacePins(center)
    }
    if (!marker) marker = new kakao.maps.Marker({ position: center, map })
    else marker.setPosition(center)
    mapReady.value = true
  } catch (err) {
    console.error('Kakao init failed', err)
    mapReady.value = false
  }
}

onMounted(() => { if (props.location) initMap(props.location) })
watch(() => props.location, (loc) => { if (loc) initMap(loc) })
watch(() => props.places, () => {
  if (map && kakaoRef && props.location) {
    renderPlacePins(new kakaoRef.maps.LatLng(props.location.lat, props.location.lng))
  }
})

onBeforeUnmount(() => {
  clearOverlays()
})
</script>

<template>
  <section class="card location">
    <h2 class="card__title">현재 위치</h2>

    <div class="map" role="img" aria-label="현재 위치 지도">
      <div ref="mapEl" style="width:100%;height:100%"></div>

      <div v-if="status === 'locating'" class="map__stub">
        <div class="skeleton" style="height: 100%; width: 100%; border-radius: 0" />
      </div>

      <div v-else-if="!mapReady" class="map__stub">
        <div class="map__grid" aria-hidden="true" />
        <span class="map__pin" aria-hidden="true">
          <span class="map__pulse" />
          📍
        </span>
        <span class="map__note">카카오맵 연동 예정</span>
      </div>

      <span v-if="location" class="map__coords">
        {{ location.lat.toFixed(4) }}, {{ location.lng.toFixed(4) }}
      </span>
    </div>

    <div v-if="legend.length" class="legend">
      <span v-for="item in legend" :key="item.shape" class="chip">
        <span class="chip__pin" :class="`chip__pin--${item.shape}`">{{ item.icon }}</span>
        {{ item.label }}
      </span>
    </div>

    <div v-if="selected" class="bubble">
      <span class="bubble__icon" aria-hidden="true">{{ selected.type.icon }}</span>
      <div class="bubble__body">
        <p class="bubble__place">{{ selected.title }}</p>
        <p class="bubble__meta">
          {{ selected.type.label }} · {{ formatDistance(selected.distanceM) }}
        </p>
      </div>
    </div>

    <div v-if="status === 'locating'" class="loading">
      <div class="skeleton" style="height: 22px; width: 55%" />
    </div>

    <template v-else-if="location">
      <div class="row">
        <span class="label">{{ location.label }}</span>
        <span class="badge">{{ LOCATION_SOURCE_LABEL[location.source] }}</span>
      </div>

      <p v-if="error" class="notice">{{ error }} 기본 위치로 무드를 추천합니다.</p>

      <div class="mode-row" role="radiogroup" aria-label="위치 모드">
        <button
          type="button"
          role="radio"
          :aria-checked="mode === 'gps'"
          class="mode-btn"
          :class="{ 'mode-btn--on': mode === 'gps' }"
          @click="emit('relocate')"
        >
          실시간 위치
        </button>
        <button
          type="button"
          role="radio"
          :aria-checked="mode === 'demo'"
          class="mode-btn"
          :class="{ 'mode-btn--on': mode === 'demo' }"
          @click="emit('goto-demo', 0)"
        >
          🎬 가상 산책
        </button>
      </div>

      <div v-if="mode === 'demo'" class="demo-row">
        <span class="demo-step">
          {{ demoIndex + 1 }}/{{ demoRoute.length }} · {{ demoRoute[demoIndex]?.name }}
        </span>
        <button class="relocate" @click="emit('next-step')">다음 장소 →</button>
      </div>
      <button v-else class="relocate" @click="emit('relocate')">위치 다시 잡기</button>
    </template>
  </section>
</template>

<style scoped>
/* 섹션: 검은 테두리 + 흰 배경 + 어두운 글씨 */
.location {
  border: 1px solid #0d1014;
  background: #ffffff;
  color: #14171b;
}

.location .card__title {
  color: #0d1014;
}

/* 기본위치 등 위치 소스 표시: 검은 테두리 + 검은 글씨 + 무드색 배경 */
.location .badge {
  border: 1px solid #0d1014;
  background: var(--mood);
  color: #0d1014;
}

.map {
  position: relative;
  aspect-ratio: 16 / 9;
  margin-bottom: 16px;
  border-radius: var(--radius-sm);
  border: 1px dashed color-mix(in srgb, var(--mood) 55%, #0d1014);
  background: #f4f5f7;
  overflow: hidden;
}

/* 지도가 들어올 자리임을 알리는 격자 */
.map__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(color-mix(in srgb, var(--mood) 12%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--mood) 12%, transparent) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: radial-gradient(70% 70% at 50% 50%, #000, transparent);
}

.map__stub {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 8px;
}

.map__pin {
  position: relative;
  display: grid;
  place-items: center;
  font-size: 1.5rem;
  line-height: 1;
}

.map__pulse {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--mood);
  opacity: 0.5;
  animation: ping 2.4s ease-out infinite;
}

@keyframes ping {
  from {
    transform: scale(1);
    opacity: 0.5;
  }
  to {
    transform: scale(4.5);
    opacity: 0;
  }
}

.map__note {
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  color: rgba(13, 16, 20, 0.55);
}

.map__coords {
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(13, 16, 20, 0.2);
  font-size: 0.7rem;
  color: #14171b;
  font-variant-numeric: tabular-nums;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 6px;
  border-radius: 999px;
  border: 1px solid rgba(13, 16, 20, 0.15);
  background: var(--surface-2);
  font-size: 0.72rem;
  color: rgba(13, 16, 20, 0.65);
}

.chip__pin {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  font-size: 10px;
  background: var(--mood-accent);
  border: 1px solid #0d1014;
}

.chip__pin--circle {
  border-radius: 50%;
}
.chip__pin--square {
  border-radius: 4px;
}
.chip__pin--diamond {
  border: none;
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}
.chip__pin--triangle {
  border: none;
  clip-path: polygon(50% 4%, 96% 96%, 4% 96%);
}
.chip__pin--pentagon {
  border: none;
  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
}
.chip__pin--hexagon {
  border: none;
  clip-path: polygon(25% 4%, 75% 4%, 100% 50%, 75% 96%, 25% 96%, 0% 50%);
}
.chip__pin--octagon {
  border: none;
  clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
}
.chip__pin--star {
  border: none;
  clip-path: polygon(
    50% 0%,
    61% 35%,
    98% 35%,
    68% 57%,
    79% 91%,
    50% 70%,
    21% 91%,
    32% 57%,
    2% 35%,
    39% 35%
  );
}
.chip__pin--teardrop {
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
}

.bubble {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  padding: 11px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(13, 16, 20, 0.15);
  background: var(--surface-2);
}

.bubble__icon {
  flex-shrink: 0;
  font-size: 1.3rem;
}

.bubble__body {
  flex: 1;
  min-width: 0;
}

.bubble__place {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bubble__meta {
  margin: 2px 0 0;
  font-size: 0.72rem;
  color: rgba(13, 16, 20, 0.55);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.loading {
  display: grid;
  gap: 10px;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.label {
  font-size: 1.25rem;
  font-weight: 600;
}

.mode-row {
  display: flex;
  gap: 6px;
  margin-top: 14px;
}

.mode-btn {
  min-height: 36px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid #0d1014;
  background: #ffffff;
  font-size: 0.78rem;
  color: rgba(13, 16, 20, 0.6);
  transition: all 0.2s;
}

/* 활성 위치 모드: 검은 테두리 + 검은 글씨 + 무드색 배경 (액션 버튼 문법) */
.mode-btn--on {
  background: var(--mood);
  color: #0d1014;
  font-weight: 600;
}

.demo-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.demo-step {
  font-size: 0.78rem;
  color: rgba(13, 16, 20, 0.6);
}

.demo-row .relocate {
  margin-top: 0;
}

.relocate {
  margin-top: 16px;
  min-height: 44px;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid #0d1014;
  background: var(--mood);
  font-size: 0.82rem;
  font-weight: 600;
  color: #0d1014;
  transition: filter 0.2s, transform 0.12s;
}

.relocate:hover {
  filter: brightness(1.06);
}

.relocate:active {
  transform: scale(0.985);
}
</style>

<!--
  비-scoped 스타일: Kakao CustomOverlay의 content는 document.createElement로 만들어
  Vue 렌더 트리 밖(지도 SDK 내부 DOM)에 붙기 때문에 위 scoped 블록의 data-v-* 선택자가
  전혀 매치되지 않는다. 그래서 핀 모양은 전역 스타일로 따로 뺀다. 클래스명은 svmap- 접두사로
  다른 컴포넌트와 충돌을 피한다.
-->
<style>
.svmap-pin {
  position: relative;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  background: var(--mood-accent, #bfe3f2);
  cursor: pointer;
  transition: transform 0.15s;
}

.svmap-pin:hover {
  transform: scale(1.15);
  z-index: 10;
}

.svmap-pin__icon {
  font-size: 14px;
  line-height: 1;
}

.svmap-pin--circle,
.svmap-pin--square,
.svmap-pin--teardrop {
  border: 1.5px solid #0d1014;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
}

.svmap-pin--circle {
  border-radius: 50%;
}

.svmap-pin--square {
  border-radius: 7px;
}

.svmap-pin--diamond {
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  filter: drop-shadow(0 3px 3px rgba(0, 0, 0, 0.4));
}

.svmap-pin--triangle {
  clip-path: polygon(50% 4%, 96% 96%, 4% 96%);
  filter: drop-shadow(0 3px 3px rgba(0, 0, 0, 0.4));
}

.svmap-pin--pentagon {
  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
  filter: drop-shadow(0 3px 3px rgba(0, 0, 0, 0.4));
}

.svmap-pin--hexagon {
  clip-path: polygon(25% 4%, 75% 4%, 100% 50%, 75% 96%, 25% 96%, 0% 50%);
  filter: drop-shadow(0 3px 3px rgba(0, 0, 0, 0.4));
}

.svmap-pin--octagon {
  clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
  filter: drop-shadow(0 3px 3px rgba(0, 0, 0, 0.4));
}

.svmap-pin--star {
  clip-path: polygon(
    50% 0%,
    61% 35%,
    98% 35%,
    68% 57%,
    79% 91%,
    50% 70%,
    21% 91%,
    32% 57%,
    2% 35%,
    39% 35%
  );
  filter: drop-shadow(0 3px 3px rgba(0, 0, 0, 0.4));
}

.svmap-pin--teardrop {
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
}

.svmap-pin--teardrop .svmap-pin__icon {
  transform: rotate(45deg);
}

.svmap-pin--teardrop:hover {
  transform: rotate(-45deg) scale(1.15);
}
</style>