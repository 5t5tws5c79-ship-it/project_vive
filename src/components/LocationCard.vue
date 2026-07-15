<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { LOCATION_SOURCE_LABEL } from '../composables/useGeolocation'
import { loadKakaoSdk } from '../lib/kakao'

const props = defineProps({
  location: { type: Object, default: null },
  status: { type: String, required: true },
  error: { type: String, default: '' },
  mode: { type: String, default: 'gps' },
  demoRoute: { type: Array, default: () => [] },
  demoIndex: { type: Number, default: 0 },
})

const emit = defineEmits(['relocate', 'goto-demo', 'next-step'])
const mapEl = ref(null)
const mapReady = ref(false)
let map = null
let marker = null

async function initMap(loc) {
  try {
    const kakao = await loadKakaoSdk()
    await nextTick()
    if (!mapEl.value) return
    const center = new kakao.maps.LatLng(loc.lat, loc.lng)
    if (!map) {
      map = new kakao.maps.Map(mapEl.value, { center, level: 4 })
      setTimeout(() => { map.relayout(); map.setCenter(center) }, 250)
    } else {
      map.setCenter(center)
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