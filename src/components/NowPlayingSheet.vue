<script setup>
import { computed } from 'vue'

const props = defineProps({
  player: { type: Object, required: true },
  mood: { type: Object, required: true },
})

const emit = defineEmits(['close'])

const p = props.player

const SOURCES = [
  { id: 'ambient', label: '생성 앰비언트' },
  { id: 'youtube', label: '유튜브' },
]

const trackTitle = computed(() => p.currentTrack.value?.title ?? '재생 대기 중')

const trackIndex = computed(() => {
  const list = p.playlist.value
  const i = list.findIndex((t) => t.id === p.currentTrack.value?.id)
  return i < 0 ? null : { at: i + 1, of: list.length }
})
</script>

<template>
  <div class="layer">
    <div class="scrim" @click="emit('close')" />

    <section class="sheet" role="dialog" aria-label="재생 중">
    <button class="grip" aria-label="닫기" @click="emit('close')" />

    <!-- 재생 중인 곡 -->
    <div class="now">
      <div class="art" aria-hidden="true">
        <span class="art__note">♪</span>
        <span v-if="p.isPlaying.value" class="art__ring" />
      </div>

      <p class="now__mood">{{ mood.label }}</p>
      <h2 class="now__title">{{ trackTitle }}</h2>
      <p class="now__sub">
        <template v-if="trackIndex">{{ trackIndex.at }} / {{ trackIndex.of }} · </template>
        <template v-if="p.isCrossfading.value">크로스페이드 중…</template>
        <template v-else-if="!p.isUnlocked.value">재생 버튼을 눌러 시작</template>
        <template v-else-if="!p.isPlaying.value">일시정지</template>
        <template v-else>다음 곡까지 {{ p.remainingSec.value }}초</template>
      </p>
    </div>

    <!-- 다음 전환까지 -->
    <div class="bar">
      <div
        class="bar__fill"
        :style="{ transform: `scaleX(${p.isUnlocked.value ? p.progress.value : 0})` }"
      />
    </div>

    <div class="controls">
      <button class="ctrl" :disabled="!p.isUnlocked.value" aria-label="이전 곡" @click="p.prev()">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <line x1="6" y1="5" x2="6" y2="19" />
          <polygon points="18,5 8,12 18,19" fill="currentColor" stroke="none" />
        </svg>
      </button>

      <button
        class="play"
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

    <!-- 재생 설정 -->
    <div class="settings">
      <label class="row">
        <span class="row__label">볼륨</span>
        <input v-model.number="p.volume.value" type="range" min="0" max="1" step="0.01" />
      </label>

      <div class="row">
        <span class="row__label">음원</span>
        <div class="sources" role="radiogroup" aria-label="오디오 소스">
          <button
            v-for="opt in SOURCES"
            :key="opt.id"
            role="radio"
            :aria-checked="p.source.value === opt.id"
            class="source"
            :class="{ 'source--on': p.source.value === opt.id }"
            @click="p.source.value = opt.id"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <p class="hint">
        유튜브 모드는 무드별 영상 ID가 채워지면 동작합니다. 지금은 생성 앰비언트만 소리가 납니다.
      </p>
      <p v-if="p.error.value" class="notice">{{ p.error.value }}</p>
    </div>
    </section>
  </div>
</template>

<style scoped>
.scrim {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgb(0 0 0 / 55%);
  backdrop-filter: blur(2px);
}

.sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 41;
  max-width: 720px;
  margin: 0 auto;
  padding: 8px 20px calc(24px + env(safe-area-inset-bottom));
  border-radius: 20px 20px 0 0;
  border: 1px solid var(--panel-border);
  border-bottom: none;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--mood) 18%, transparent), transparent 45%),
    var(--panel-bg);
  color: var(--panel-text);
  --text: var(--panel-text);
  --text-dim: var(--panel-text-dim);
  --text-faint: var(--panel-text-faint);
  --surface-2: var(--panel-surface-2);
  --mood-accent: var(--panel-mood-accent);
  --border: #0d1014;
  /* 등장·퇴장은 App.vue의 <Transition name="sheet">가 담당 (아래 트랜지션 클래스) */
  will-change: transform;
}

/* ---------- 열림/닫힘 트랜지션 ----------
   열림: 스크림은 먼저 옅게 깔리고, 패널은 감속 곡선(easeOutQuint 근사)으로 미끄러져 올라온다.
   닫힘: 패널이 가속 곡선으로 내려가고 스크림이 뒤따라 사라진다. */
.sheet-enter-active .scrim {
  transition: opacity 0.3s ease;
}
.sheet-enter-active .sheet {
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.sheet-leave-active .scrim {
  transition: opacity 0.28s ease 0.05s;
}
.sheet-leave-active .sheet {
  transition: transform 0.32s cubic-bezier(0.4, 0, 1, 1);
}
.sheet-enter-from .scrim,
.sheet-leave-to .scrim {
  opacity: 0;
}
.sheet-enter-from .sheet,
.sheet-leave-to .sheet {
  transform: translateY(100%);
}

.grip {
  display: block;
  width: 40px;
  height: 4px;
  margin: 4px auto 14px;
  border-radius: 999px;
  background: var(--border);
}

.now {
  display: grid;
  justify-items: center;
  text-align: center;
}

.art {
  position: relative;
  display: grid;
  place-items: center;
  width: 96px;
  height: 96px;
  margin-bottom: 16px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--mood) 28%, transparent);
}

.art__note {
  font-size: 2rem;
  color: var(--mood-accent);
}

.art__ring {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  border: 2px solid var(--mood);
  animation: breathe 3.5s ease-in-out infinite;
}

@keyframes breathe {
  50% {
    transform: scale(1.08);
    opacity: 0.3;
  }
}

.now__mood {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--mood-accent);
}

.now__title {
  margin: 6px 0 0;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.now__sub {
  margin: 6px 0 0;
  font-size: 0.76rem;
  color: var(--text-faint);
  font-variant-numeric: tabular-nums;
}

.bar {
  height: 3px;
  margin: 20px 0 18px;
  border-radius: 999px;
  background: var(--surface-2);
  overflow: hidden;
}

.bar__fill {
  height: 100%;
  background: var(--mood);
  transform-origin: left;
  transform: scaleX(0);
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  margin-bottom: 22px;
}

.ctrl,
.play {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: var(--text);
  background: transparent;
}

.ctrl svg,
.play svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.ctrl {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid #0d1014;
  background: #ffffff;
}

.ctrl svg {
  width: 24px;
  height: 24px;
}

.ctrl:hover:not(:disabled) {
  background: var(--surface-2);
}

.ctrl:disabled {
  color: var(--text-faint);
}

/* 가운데 재생 버튼: 라인 원형 테두리 */
.play {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 1.5px solid #0d1014;
  transition: transform 0.15s;
}

.play svg {
  width: 28px;
  height: 28px;
}

.play:hover {
  background: var(--surface-2);
  transform: scale(1.05);
}

.settings {
  padding-top: 18px;
  border-top: 1px solid var(--border);
}

.row {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 44px;
}

.row__label {
  flex-shrink: 0;
  width: 40px;
  font-size: 0.8rem;
  color: var(--text-faint);
}

.row input[type='range'] {
  flex: 1;
  accent-color: var(--mood);
}

.sources {
  display: flex;
  gap: 6px;
}

.source {
  min-height: 36px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid #0d1014;
  background: #ffffff;
  font-size: 0.78rem;
  color: var(--text-dim);
  transition: all 0.2s;
}

/* 활성 음원: 검은 테두리 + 검은 글씨 + 무드색 배경 (액션 버튼 문법) */
.source--on {
  border-color: #0d1014;
  background: var(--mood);
  color: #0d1014;
  font-weight: 600;
}

.hint {
  margin: 12px 0 0;
  font-size: 0.72rem;
  line-height: 1.6;
  color: var(--text-faint);
}
</style>