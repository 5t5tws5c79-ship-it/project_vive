<script setup>
import { computed } from 'vue'
import MoodGradient from './MoodGradient.vue'

const props = defineProps({
  player: { type: Object, required: true },
  mood: { type: Object, required: true },
  moodInfo: { type: Object, default: null },
  places: { type: Array, default: () => [] },
  analyzing: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const p = props.player

// 무드별 배경 그라디언트 — moods.js 의 gradientId 매핑을 따르고, 없으면 serene 으로.
const gradientId = computed(() => props.mood.gradientId ?? 'serene')

const trackTitle = computed(() => p.currentTrack.value?.title ?? '재생 대기 중')

const trackIndex = computed(() => {
  const list = p.playlist.value
  const i = list.findIndex((t) => t.id === p.currentTrack.value?.id)
  return i < 0 ? null : { at: i + 1, of: list.length }
})

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
  <div class="layer">
    <div class="scrim" @click="emit('close')" />

    <section class="sheet" role="dialog" aria-label="재생 중">
    <!-- 히어로: 진행 바·컨트롤보다 위 섹션 전체를 무드 그라디언트로 채운다 -->
    <div class="hero">
      <MoodGradient :mood-id="gradientId" />
      <div class="hero__scrim" aria-hidden="true" />

      <button class="grip" aria-label="닫기" @click="emit('close')" />

      <!-- 재생 중인 곡 -->
      <div class="now">
      <div class="art" aria-hidden="true">
        <span class="art__note">♪</span>
        <span v-if="p.isPlaying.value" class="art__ring" />
      </div>

      <p class="now__mood">
        {{ mood.label }}
        <span v-if="moodInfo" class="now__badge">{{ decidedByLabel }} {{ confidencePct }}%</span>
      </p>
      <h2 class="now__title">{{ trackTitle }}</h2>
      <p class="now__sub">
        <template v-if="trackIndex">{{ trackIndex.at }} / {{ trackIndex.of }} · </template>
        <template v-if="p.isCrossfading.value">크로스페이드 중…</template>
        <template v-else-if="!p.isUnlocked.value">재생 버튼을 눌러 시작</template>
        <template v-else-if="!p.isPlaying.value">일시정지</template>
        <template v-else>다음 곡까지 {{ p.remainingSec.value }}초</template>
      </p>

      <p v-if="nearbySummary" class="now__near">근처: {{ nearbySummary }}</p>
      <p v-if="analyzing || moodInfo?.reason" class="now__reason">
        {{ analyzing ? '무드 분석 중…(LLM)' : moodInfo.reason }}
      </p>
      </div>
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
  /* 상단 무드 틴트는 .hero 의 MoodGradient 가 대신한다 */
  background: var(--panel-bg);
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

/* ---------- 히어로: 무드 그라디언트 배경 ----------
   시트 패딩(상 8px · 좌우 20px)을 음수 마진으로 상쇄해 시트 가장자리 끝까지 채우고,
   시트의 둥근 상단 모서리를 그대로 따른다. MoodGradient 는 absolute inset:0 이므로
   position:relative + overflow:hidden 만 잡아주면 된다. */
.hero {
  position: relative;
  margin: -8px -20px 0;
  padding: 8px 20px 22px;
  border-radius: 19px 19px 0 0; /* .sheet 20px - border 1px */
  overflow: hidden;
  /* 그라디언트 위 가독성: 이 섹션 안에서는 텍스트 팔레트를 흰색 계열로 전환 */
  color: #fff;
  --text: #fff;
  --text-dim: rgb(255 255 255 / 85%);
  --text-faint: rgb(255 255 255 / 68%);
  --mood-accent: #fff;
  --surface-2: rgb(0 0 0 / 24%);
  --border: rgb(255 255 255 / 32%);
}

/* 밝은 그라디언트(serene·gourmet 등)에서도 흰 글자가 읽히도록 아래로 갈수록 짙어지는 스크림 */
.hero__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgb(10 12 16 / 10%), rgb(10 12 16 / 38%));
}

/* 그라디언트·스크림 위로 콘텐츠를 올린다 */
.hero .grip,
.hero .now {
  position: relative;
}

.grip {
  display: block;
  width: 40px;
  height: 4px;
  margin: 4px auto 14px;
  border-radius: 999px;
  background: rgb(255 255 255 / 65%);
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
  background: rgb(255 255 255 / 16%);
  backdrop-filter: blur(6px);
}

.art__note {
  font-size: 2rem;
  color: var(--mood-accent);
}

.art__ring {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  border: 2px solid rgb(255 255 255 / 75%);
  animation: breathe 3.5s ease-in-out infinite;
}

@keyframes breathe {
  50% {
    transform: scale(1.08);
    opacity: 0.3;
  }
}

.now__mood {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--mood-accent);
}

.now__badge {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: normal;
  color: var(--text-dim);
}

.now__near {
  margin: 10px 0 0;
  font-size: 0.78rem;
  color: var(--text-dim);
}

.now__reason {
  margin: 4px 0 0;
  font-size: 0.74rem;
  font-style: italic;
  line-height: 1.5;
  color: var(--text-faint);
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
</style>