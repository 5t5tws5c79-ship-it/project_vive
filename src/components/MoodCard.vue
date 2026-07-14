<script setup>
import { computed, ref } from 'vue'
import { moodTracks } from '../data/placeholder'

const props = defineProps({
  mood: { type: Object, required: true },
  moods: { type: Array, required: true },
})

const emit = defineEmits(['select'])

const isOpen = ref(false)

// 【플레이스홀더】 실제로는 이 무드로 등록된 커뮤니티 글에서 곡을 모아온다.
// mood가 바뀌면 리스트도 자동으로 새 무드 것으로 바뀐다.
const tracks = computed(() => moodTracks(props.mood.id))
</script>

<template>
  <section class="card mood">
    <header class="head">
      <h2 class="card__title">지금의 무드</h2>
      <span class="badge">플레이스홀더</span>
    </header>

    <h3 class="label">{{ mood.label }}</h3>
    <p class="desc">{{ mood.description }}</p>

    <!-- 추론 로직이 붙기 전까지는 직접 골라서 화면 전환을 확인한다 -->
    <div class="picker" role="radiogroup" aria-label="무드 선택">
      <button
        v-for="m in moods"
        :key="m.id"
        role="radio"
        :aria-checked="m.id === mood.id"
        class="chip"
        :class="{ 'chip--on': m.id === mood.id }"
        :style="{ '--chip': m.color }"
        @click="emit('select', m.id)"
      >
        {{ m.label }}
      </button>
    </div>

    <!-- 이 무드로 유저들이 추천한 곡 -->
    <button class="toggle" :aria-expanded="isOpen" @click="isOpen = !isOpen">
      <span>'{{ mood.label }}' 무드의 다른 곡 {{ tracks.length }}개</span>
      <span class="toggle__arrow" :class="{ 'toggle__arrow--up': isOpen }" aria-hidden="true">
        ⌄
      </span>
    </button>

    <template v-if="isOpen">
      <ul v-if="tracks.length" class="list">
        <li v-for="track in tracks" :key="track.id" class="track">
          <span class="track__art" aria-hidden="true">♪</span>
          <div class="track__body">
            <p class="track__title">{{ track.title }}</p>
            <p class="track__meta">{{ track.artist }} · 📍 {{ track.place }}</p>
          </div>
          <span class="track__likes">♥ {{ track.likes }}</span>
          <button class="track__play" aria-label="재생">▶</button>
        </li>
      </ul>

      <p v-else class="empty">아직 이 무드로 추천된 곡이 없습니다. 첫 곡을 추천해보세요.</p>
    </template>
  </section>
</template>

<style scoped>
.mood {
  border-color: color-mix(in srgb, var(--mood) 40%, var(--border));
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--mood) 16%, transparent), transparent 65%),
    color-mix(in srgb, var(--surface) 88%, transparent);
}

.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.label {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--mood-accent);
}

.desc {
  margin: 8px 0 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-dim);
}

.picker {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.chip {
  min-height: 40px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  font-size: 0.82rem;
  color: var(--text-faint);
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}

.chip:hover {
  border-color: color-mix(in srgb, var(--chip) 55%, transparent);
  color: var(--text);
}

.chip--on {
  border-color: color-mix(in srgb, var(--chip) 70%, transparent);
  background: color-mix(in srgb, var(--chip) 22%, transparent);
  color: #fff;
}

.toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  min-height: 46px;
  margin-top: 14px;
  padding: 0 13px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-2);
  font-size: 0.83rem;
  color: var(--text-dim);
  transition: border-color 0.2s;
}

.toggle:hover {
  border-color: var(--mood);
  color: var(--text);
}

.toggle__arrow {
  font-size: 1rem;
  transition: transform 0.25s;
}

.toggle__arrow--up {
  transform: rotate(180deg);
}

.list {
  display: grid;
  gap: 7px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
}

.track {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 11px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
}

.track__art {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--mood) 24%, transparent);
  color: var(--mood-accent);
  font-size: 0.85rem;
}

.track__body {
  flex: 1;
  min-width: 0;
}

.track__title {
  margin: 0;
  font-size: 0.87rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track__meta {
  margin: 2px 0 0;
  font-size: 0.7rem;
  color: var(--text-faint);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track__likes {
  flex-shrink: 0;
  font-size: 0.72rem;
  color: var(--text-faint);
  font-variant-numeric: tabular-nums;
}

.track__play {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border);
  color: var(--text-dim);
  font-size: 0.7rem;
}

.track__play:hover {
  border-color: var(--mood);
  color: var(--text);
}

.empty {
  margin: 10px 0 0;
  padding: 18px 0;
  text-align: center;
  font-size: 0.8rem;
  line-height: 1.6;
  color: var(--text-faint);
}
</style>
