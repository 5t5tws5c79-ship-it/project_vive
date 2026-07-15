<script setup>
import { computed } from 'vue'

const props = defineProps({
  player: { type: Object, required: true },
  moodLabel: { type: String, required: true },
})

const emit = defineEmits(['expand'])

const p = props.player

const trackTitle = computed(() => p.currentTrack.value?.title ?? '재생 대기 중')

const statusText = computed(() => {
  if (!p.isUnlocked.value) return '재생 버튼을 눌러 시작'
  if (p.isCrossfading.value) return '크로스페이드 중…'
  if (!p.isPlaying.value) return '일시정지'
  return `다음 곡까지 ${p.remainingSec.value}초`
})

// 진행 라인 위 점(핸들)의 위치 (0~100%)
const progressPct = computed(() =>
  p.isUnlocked.value ? Math.min(100, p.progress.value * 100) : 0,
)
</script>

<template>
  <section class="player">
    <!-- 곡 정보: 누르면 재생 정보 + 설정 시트 -->
    <button class="now" aria-label="재생 정보 열기" @click="emit('expand')">
      <p class="track">{{ trackTitle }}</p>
      <p class="status">
        <span class="mood-tag">{{ moodLabel }}</span>
        <span>{{ statusText }}</span>
      </p>
    </button>

    <!-- 진행 라인 + 점 핸들 -->
    <div
      class="seek"
      role="progressbar"
      aria-label="다음 전환까지 진행"
      :aria-valuenow="Math.round(progressPct)"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div class="seek__line" />
      <div class="seek__fill" :style="{ width: `${progressPct}%` }" />
      <div class="seek__dot" :style="{ left: `${progressPct}%` }" />
    </div>

    <!-- 컨트롤: 이전 · 재생/일시정지 · 다음 · 반복 -->
    <div class="controls">
      <button class="ctrl" :disabled="!p.isUnlocked.value" aria-label="이전 곡" @click="p.prev()">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <line x1="6" y1="5" x2="6" y2="19" />
          <polygon points="18,5 8,12 18,19" fill="currentColor" stroke="none" />
        </svg>
      </button>

      <button
        class="play"
        :class="{ 'play--pulse': p.isCrossfading.value }"
        :aria-label="p.isPlaying.value ? '일시정지' : '재생'"
        @click="p.toggle()"
      >
        <svg v-if="p.isPlaying.value" viewBox="0 0 24 24" aria-hidden="true">
          <line x1="9.5" y1="7" x2="9.5" y2="17" />
          <line x1="14.5" y1="7" x2="14.5" y2="17" />
        </svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <!-- 삼각형 자체를 뷰박스 중심(12) 기준 +1 우측 보정된 좌표로 그려 광학 중앙 정렬 -->
          <polygon points="8.5,6.5 17.5,12 8.5,17.5" fill="currentColor" stroke="none" />
        </svg>
      </button>

      <button class="ctrl" :disabled="!p.isUnlocked.value" aria-label="다음 곡" @click="p.next()">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <polygon points="6,5 16,12 6,19" fill="currentColor" stroke="none" />
          <line x1="18" y1="5" x2="18" y2="19" />
        </svg>
      </button>
    </div>

    <p v-if="p.error.value" class="err">{{ p.error.value }}</p>
  </section>
</template>

<style scoped>
.player {
  position: relative;
  border: 1px solid var(--panel-border);
  border-radius: var(--radius);
  /* 무드 섹션과 동일: 배경 = 현재 무드색 */
  background: var(--mood);
  padding: 10px 16px 14px;
  color: var(--panel-text);
  --text: var(--panel-text);
  --text-dim: var(--panel-text-dim);
  --text-faint: var(--panel-text-faint);
  --surface-2: var(--panel-surface-2);
  --mood-accent: var(--panel-mood-accent);
  --border: #0d1014;
}

.now {
  display: block;
  width: 100%;
  min-height: 44px;
  text-align: left;
  border-radius: 8px;
  padding: 0 4px;
  transition: background 0.15s;
}

.now:hover {
  background: rgba(255, 255, 255, 0.4);
}

.track {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 2px 0 0;
  font-size: 0.72rem;
  color: var(--text-faint);
  font-variant-numeric: tabular-nums;
}

.mood-tag {
  color: var(--mood-accent);
  font-weight: 500;
}

/* ---------- 진행 라인 + 점 ---------- */
.seek {
  position: relative;
  height: 14px;
  margin: 8px 7px 4px; /* 좌우 여백 = 점 반지름, 점이 잘리지 않게 */
  display: flex;
  align-items: center;
}

.seek__line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  border-radius: 1px;
  background: var(--border);
}

.seek__fill {
  position: absolute;
  left: 0;
  height: 2px;
  border-radius: 1px;
  background: var(--text);
  transition: width 0.2s linear;
}

.seek__dot {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--text);
  transform: translateX(-50%);
  transition: left 0.2s linear;
}

/* ---------- 컨트롤 ---------- */
.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  margin-top: 6px;
}

.ctrl,
.play {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: var(--text);
  background: transparent;
}

.ctrl {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid #0d1014;
  background: #ffffff;
}

.ctrl svg,
.play svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.ctrl:hover:not(:disabled) {
  background: var(--surface-2);
}

.ctrl:disabled {
  color: var(--text-faint);
}

/* 가운데 재생 버튼: 라인 원형 테두리 */
.play {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 1.5px solid #0d1014;
  background: #ffffff;
}

.play svg {
  width: 24px;
  height: 24px;
}

.play:hover {
  background: var(--surface-2);
}

.play--pulse {
  box-shadow: 0 0 0 0 color-mix(in srgb, var(--mood) 60%, transparent);
  animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
  to {
    box-shadow: 0 0 0 16px transparent;
  }
}

.err {
  margin: 8px 0 0;
  font-size: 0.72rem;
  line-height: 1.5;
  color: #e6c78a;
}
</style>