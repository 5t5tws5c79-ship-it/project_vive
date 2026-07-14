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
</script>

<template>
  <section class="player">
    <!-- 다음 전환까지 남은 시간 -->
    <div
      class="progress"
      :style="{ transform: `scaleX(${p.isUnlocked.value ? p.progress.value : 0})` }"
    />

    <div class="main">
      <!-- 곡 정보를 누르면 재생 정보 + 설정 시트가 열린다 -->
      <button class="now" aria-label="재생 정보 열기" @click="emit('expand')">
        <p class="track">{{ trackTitle }}</p>
        <p class="status">
          <span class="mood-tag">{{ moodLabel }}</span>
          <span>{{ statusText }}</span>
        </p>
      </button>

      <!-- 재생/일시정지 · 다음 곡 -->
      <button
        class="play"
        :class="{ 'play--pulse': p.isCrossfading.value }"
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

    <p v-if="p.error.value" class="err">{{ p.error.value }}</p>
  </section>
</template>

<style scoped>
.player {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--surface) 94%, transparent);
  backdrop-filter: blur(10px);
  padding: 10px 12px;
}

.progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 2px;
  width: 100%;
  background: var(--mood);
  transform-origin: left;
  transform: scaleX(0);
}

.main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.play {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--mood);
  color: #0d1014;
  font-size: 0.85rem;
  font-weight: 700;
}

/* ▶ 글리프는 시각적 무게중심이 왼쪽에 쏠려 원 안에서 왼쪽으로 치우쳐 보인다 */
.play__icon {
  margin-left: 2px;
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

.now {
  flex: 1;
  min-width: 0;
  min-height: 44px;
  text-align: left;
  border-radius: 8px;
  padding: 0 4px;
  transition: background 0.15s;
}

.now:hover {
  background: var(--surface-2);
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

.ctrl {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--border);
  color: var(--text-dim);
  font-size: 0.85rem;
}

.ctrl:hover:not(:disabled) {
  border-color: var(--mood);
  color: var(--text);
}

.err {
  margin: 8px 0 0;
  font-size: 0.72rem;
  line-height: 1.5;
  color: #e6c78a;
}
</style>
