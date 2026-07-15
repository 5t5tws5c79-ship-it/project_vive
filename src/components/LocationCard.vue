<script setup>
import { LOCATION_SOURCE_LABEL } from '../composables/useGeolocation'

defineProps({
  location: { type: Object, default: null },
  status: { type: String, required: true },
  error: { type: String, default: '' },
})

const emit = defineEmits(['relocate'])
</script>

<template>
  <section class="card location">
    <h2 class="card__title">현재 위치</h2>

    <!--
      【플레이스홀더】 카카오맵 연동 자리.
      SDK를 붙일 때 이 .map 요소를 그대로 지도 컨테이너로 쓰면 된다.
        const map = new kakao.maps.Map(mapEl, { center: new kakao.maps.LatLng(lat, lng), level: 4 })
      안쪽 .map__stub 만 지우고, 근처 장소는 마커로 얹으면 된다.
    -->
    <div class="map" role="img" aria-label="지도 자리 (카카오맵 연동 예정)">
      <div class="map__grid" aria-hidden="true" />

      <div v-if="status === 'locating'" class="map__stub">
        <div class="skeleton" style="height: 100%; width: 100%; border-radius: 0" />
      </div>

      <div v-else class="map__stub">
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
/* 섹션: 검은 테두리 + 흰 배경 + 어두운 글씨 */
.location {
  border: 1px solid #0d1014;
  background: #ffffff;
  color: #14171b;
}

.location .card__title {
  color: rgba(13, 16, 20, 0.62);
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