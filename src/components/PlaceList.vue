<script setup>
import { formatDistance } from '../lib/geo'

defineProps({
  places: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  radiusM: { type: Number, default: 0 },
  loadError: { type: String, default: '' },
})
</script>

<template>
  <section class="card">
    <header class="head">
      <h2 class="card__title">근처 장소</h2>
      <span v-if="places.length" class="badge">
        반경 {{ radiusM === Infinity ? '제한 없음' : formatDistance(radiusM) }}
      </span>
    </header>

    <p v-if="loadError" class="notice">관광 데이터를 불러오지 못했습니다. ({{ loadError }})</p>

    <div v-else-if="loading" class="list">
      <div v-for="i in 3" :key="i" class="skeleton" style="height: 52px" />
    </div>

    <p v-else-if="!places.length" class="empty">
      주변에서 장소를 찾지 못했습니다. 위치를 다시 잡거나 데이터 범위를 확인해주세요.
    </p>

    <ul v-else class="list">
      <li v-for="place in places" :key="place.id" class="place">
        <span class="icon" aria-hidden="true">{{ place.type.icon }}</span>
        <div class="body">
          <p class="title">{{ place.title }}</p>
          <p class="addr">{{ place.addr }}</p>
        </div>
        <div class="meta">
          <span class="badge">{{ place.type.label }}</span>
          <span class="dist">{{ formatDistance(place.distanceM) }}</span>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.place {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  border: 1px solid transparent;
  transition: border-color 0.2s;
}

.place:hover {
  border-color: color-mix(in srgb, var(--mood) 40%, transparent);
}

.icon {
  font-size: 1.15rem;
  flex-shrink: 0;
}

.body {
  min-width: 0;
  flex: 1;
}

.title {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.addr {
  margin: 2px 0 0;
  font-size: 0.75rem;
  color: var(--text-faint);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.dist {
  font-size: 0.78rem;
  color: var(--text-dim);
  font-variant-numeric: tabular-nums;
  min-width: 44px;
  text-align: right;
}

.empty {
  margin: 0;
  padding: 18px 0;
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--text-faint);
  text-align: center;
}

@media (max-width: 520px) {
  .addr {
    display: none;
  }
}
</style>
