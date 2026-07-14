<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { moodById } from '../config/moods'

const props = defineProps({
  curations: { type: Array, required: true },
})

// 【플레이스홀더】 유저들이 장소에 곡을 꽂아둔 지도.
//
// 카카오맵을 붙일 때:
//   1) 이 컴포넌트의 .map 요소를 지도 컨테이너로 쓴다
//   2) curations[].coords(lat/lng)로 kakao.maps.Marker 를 찍고
//   3) 마커 클릭 시 아래 selected 와 똑같이 말풍선을 띄운다
//   4) curations[].pin(%) 은 그때 버리면 된다 — 가짜 지도용 좌표라서
const selected = ref(null)

function toggle(curation) {
  selected.value = selected.value?.id === curation.id ? null : curation
}
</script>

<template>
  <section class="card">
    <header class="head">
      <div>
        <h2 class="title">음악 지도</h2>
        <p class="sub">사람들이 장소에 꽂아둔 곡 {{ curations.length }}개</p>
      </div>
      <span class="badge">플레이스홀더</span>
    </header>

    <div class="map" role="img" aria-label="음악 지도 자리 (카카오맵 연동 예정)">
      <div class="map__grid" aria-hidden="true" />

      <!-- 곡이 꽂힌 핀들 -->
      <button
        v-for="c in curations"
        :key="c.id"
        class="pin"
        :class="{ 'pin--on': selected?.id === c.id }"
        :style="{
          left: `${c.pin.x}%`,
          top: `${c.pin.y}%`,
          '--pin': moodById(c.moodId).color,
        }"
        :aria-label="`${c.place} — ${c.track}`"
        @click="toggle(c)"
      >
        <span class="pin__halo" aria-hidden="true" />
        <span class="pin__note" aria-hidden="true">♪</span>
      </button>

      <span class="map__note">카카오맵 연동 예정 — 핀을 눌러보세요</span>
    </div>

    <!-- 핀 클릭 시 뜨는 말풍선 (지도가 붙으면 마커 인포윈도우가 된다) -->
    <RouterLink
      v-if="selected"
      :to="`/community/${selected.id}`"
      class="bubble"
      :style="{ '--pin': moodById(selected.moodId).color }"
    >
      <span class="bubble__art" aria-hidden="true">♪</span>
      <div class="bubble__body">
        <p class="bubble__place">📍 {{ selected.place }}</p>
        <p class="bubble__track">{{ selected.track }}</p>
        <p class="bubble__meta">{{ selected.nickname }} · ♥ {{ selected.likes }}</p>
      </div>
      <span class="bubble__go" aria-hidden="true">›</span>
    </RouterLink>

    <p v-else class="hint">핀을 누르면 그 장소에 꽂힌 곡이 나옵니다.</p>
  </section>
</template>

<style scoped>
.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}

.title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.sub {
  margin: 4px 0 0;
  font-size: 0.78rem;
  color: var(--text-faint);
}

.map {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-sm);
  border: 1px dashed color-mix(in srgb, var(--mood) 40%, var(--border));
  background: var(--surface-2);
  overflow: hidden;
}

.map__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(color-mix(in srgb, var(--mood) 10%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--mood) 10%, transparent) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: radial-gradient(75% 75% at 50% 50%, #000, transparent);
}

.map__note {
  position: absolute;
  left: 50%;
  bottom: 8px;
  transform: translateX(-50%);
  padding: 3px 9px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--bg) 78%, transparent);
  font-size: 0.68rem;
  white-space: nowrap;
  color: var(--text-faint);
}

.pin {
  position: absolute;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
  /* 터치 타깃 확보 */
  width: 44px;
  height: 44px;
}

.pin__note {
  position: relative;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--pin);
  color: #0d1014;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 3px 10px color-mix(in srgb, var(--pin) 45%, transparent);
  transition: transform 0.18s;
}

.pin:hover .pin__note {
  transform: scale(1.18);
}

.pin--on .pin__note {
  transform: scale(1.25);
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.pin__halo {
  position: absolute;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--pin);
  opacity: 0.45;
}

.pin--on .pin__halo {
  animation: ping 1.8s ease-out infinite;
}

@keyframes ping {
  from {
    transform: scale(1);
    opacity: 0.45;
  }
  to {
    transform: scale(3);
    opacity: 0;
  }
}

.bubble {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 11px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid color-mix(in srgb, var(--pin) 45%, transparent);
  background: color-mix(in srgb, var(--pin) 12%, var(--surface-2));
  text-decoration: none;
  color: inherit;
}

.bubble__art {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--pin) 30%, transparent);
  color: #fff;
}

.bubble__body {
  flex: 1;
  min-width: 0;
}

.bubble__place {
  margin: 0;
  font-size: 0.72rem;
  color: var(--text-faint);
}

.bubble__track {
  margin: 2px 0 0;
  font-size: 0.9rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bubble__meta {
  margin: 2px 0 0;
  font-size: 0.72rem;
  color: var(--text-faint);
}

.bubble__go {
  flex-shrink: 0;
  font-size: 1.2rem;
  color: var(--text-faint);
}

.hint {
  margin: 12px 0 0;
  font-size: 0.75rem;
  text-align: center;
  color: var(--text-faint);
}
</style>
