<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  places: { type: Array, required: true },
  moodLabel: { type: String, required: true },
})

// 지금 위치에서 가장 가까운 장소를 등록 대상으로 제안한다
const nearest = computed(() => props.places[0] ?? null)
</script>

<template>
  <section class="card">
    <header class="head">
      <h2 class="card__title">이 곳에 어울리는 곡</h2>
      <span class="badge">플레이스홀더</span>
    </header>

    <p class="pitch">
      지금 계신 곳에 어울리는 곡을 알고 있나요?
      <strong>직접 추천해서 지도에 꽂아주세요.</strong>
      다른 사람들이 이 장소에 왔을 때 그 곡을 듣게 됩니다.
    </p>

    <div v-if="nearest" class="target">
      <span class="target__icon" aria-hidden="true">{{ nearest.type.icon }}</span>
      <div class="target__body">
        <p class="target__label">가장 가까운 장소</p>
        <p class="target__place">{{ nearest.title }}</p>
      </div>
      <span class="badge badge--mood">{{ moodLabel }}</span>
    </div>

    <RouterLink to="/community/new" class="cta">＋ 곡 추천하기</RouterLink>
  </section>
</template>

<style scoped>
.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.pitch {
  margin: 0 0 14px;
  font-size: 0.85rem;
  line-height: 1.65;
  color: var(--text-dim);
}

.pitch strong {
  color: var(--text);
  font-weight: 600;
}

.target {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 11px 12px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
}

.target__icon {
  flex-shrink: 0;
  font-size: 1.15rem;
}

.target__body {
  flex: 1;
  min-width: 0;
}

.target__label {
  margin: 0;
  font-size: 0.68rem;
  color: var(--text-faint);
}

.target__place {
  margin: 2px 0 0;
  font-size: 0.9rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cta {
  display: grid;
  place-items: center;
  width: 100%;
  min-height: 50px;
  border-radius: var(--radius-sm);
  background: var(--mood);
  color: #0d1014;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 600;
  transition: filter 0.2s, transform 0.12s;
}

.cta:hover {
  filter: brightness(1.08);
}

.cta:active {
  transform: scale(0.985);
}
</style>
