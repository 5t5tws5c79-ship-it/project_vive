<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { LOCATION_SOURCE_LABEL } from '../composables/useGeolocation'
import { loadKakaoSdk } from '../lib/kakao'

const props = defineProps({
  location: { type: Object, default: null },
  status: { type: String, required: true },
  error: { type: String, default: '' },
})

const emit = defineEmits(['relocate'])
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
  <section class="card">
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

      <button class="relocate" @click="emit('relocate')">위치 다시 잡기</button>
    </template>
  </section>
</template>

<style scoped>
.map {
  position: relative;
  aspect-ratio: 16 / 9;
  margin-bottom: 16px;
  border-radius: var(--radius-sm);
  border: 1px dashed color-mix(in srgb, var(--mood) 40%, var(--border));
  background: var(--surface-2);
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
  color: var(--text-faint);
}

.map__coords {
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 3px 8px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--bg) 78%, transparent);
  font-size: 0.7rem;
  color: var(--text-dim);
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

.relocate {
  margin-top: 16px;
  min-height: 44px;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-2);
  font-size: 0.82rem;
  color: var(--text-dim);
  transition: border-color 0.2s, color 0.2s;
}

.relocate:hover {
  border-color: var(--mood);
  color: var(--text);
}
</style>