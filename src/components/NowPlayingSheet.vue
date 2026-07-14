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
      <button
        class="play"
        :aria-label="p.isPlaying.value ? '일시정지' : '재생'"
        @click="p.toggle()"
      >
        <span v-if="p.isPlaying.value" aria-hidden="true">❚❚</span>
        <span v-else class="play__icon" aria-hidden="true">▶</span>
      </button>
      <button class="ctrl" :disabled="!p.isUnlocked.value" aria-label="다음 곡" @click="p.next()">
        ⏭
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
  border: 1px solid var(--border);
  border-bottom: none;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--mood) 18%, transparent), transparent 45%),
    var(--surface);
  animation: rise 0.24s ease-out;
}

@keyframes rise {
  from {
    transform: translateY(100%);
  }
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
  gap: 20px;
  margin-bottom: 22px;
}

.play {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--mood);
  color: #0d1014;
  font-size: 1rem;
  font-weight: 700;
  transition: transform 0.15s;
}

.play:hover {
  transform: scale(1.05);
}

/* ▶ 글리프의 시각 무게중심 보정 */
.play__icon {
  margin-left: 3px;
}

.ctrl {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid var(--border);
  color: var(--text-dim);
}

.ctrl:hover:not(:disabled) {
  border-color: var(--mood);
  color: var(--text);
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
  border: 1px solid var(--border);
  font-size: 0.78rem;
  color: var(--text-faint);
  transition: all 0.2s;
}

.source--on {
  border-color: color-mix(in srgb, var(--mood) 55%, transparent);
  background: color-mix(in srgb, var(--mood) 18%, transparent);
  color: var(--mood-accent);
}

.hint {
  margin: 12px 0 0;
  font-size: 0.72rem;
  line-height: 1.6;
  color: var(--text-faint);
}
</style>
