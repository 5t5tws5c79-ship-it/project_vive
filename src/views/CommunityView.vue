<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import CurationMap from '../components/CurationMap.vue'
import { CURATIONS } from '../data/placeholder'
import { moodById } from '../config/moods'

// 【플레이스홀더】 실제로는 localStorage에서 읽어온다.
const SORTS = [
  { id: 'recent', label: '최신순' },
  { id: 'popular', label: '인기순' },
  { id: 'near', label: '가까운 순' },
]

const sort = ref('recent')
const query = ref('')
const view = ref('map') // 'map' | 'list'

const list = computed(() => {
  const q = query.value.trim()
  if (!q) return CURATIONS
  return CURATIONS.filter((c) => c.place.includes(q) || c.track.includes(q))
})
</script>

<template>
  <section class="card">
    <header class="head">
      <div>
        <h2 class="title">장소별 큐레이션</h2>
        <p class="sub">다른 사람들이 그 장소에서 들은 곡</p>
      </div>
      <span class="badge">플레이스홀더</span>
    </header>

    <input v-model="query" class="search" placeholder="장소나 곡 이름으로 검색" />

    <div class="sorts" role="radiogroup" aria-label="정렬">
      <button
        v-for="s in SORTS"
        :key="s.id"
        role="radio"
        :aria-checked="sort === s.id"
        class="sort"
        :class="{ 'sort--on': sort === s.id }"
        @click="sort = s.id"
      >
        {{ s.label }}
      </button>
    </div>

    <div class="views" role="radiogroup" aria-label="보기 방식">
      <button
        v-for="v in [
          { id: 'map', label: '🗺 지도' },
          { id: 'list', label: '☰ 목록' },
        ]"
        :key="v.id"
        role="radio"
        :aria-checked="view === v.id"
        class="viewtab"
        :class="{ 'viewtab--on': view === v.id }"
        @click="view = v.id"
      >
        {{ v.label }}
      </button>
    </div>
  </section>

  <CurationMap v-if="view === 'map'" :curations="list" />

  <p v-if="!list.length" class="card empty">검색 결과가 없습니다.</p>

  <RouterLink
    v-for="c in view === 'list' ? list : []"
    :key="c.id"
    :to="`/community/${c.id}`"
    class="card item"
    :style="{ '--item': moodById(c.moodId).color }"
  >
    <div class="item__head">
      <span class="badge">📍 {{ c.place }}</span>
      <span class="badge badge--mood-chip">{{ moodById(c.moodId).label }}</span>
    </div>

    <p class="item__track">{{ c.track }}</p>
    <p class="item__comment">{{ c.comment }}</p>

    <div class="item__foot">
      <span>{{ c.nickname }}</span>
      <span class="dot" aria-hidden="true">·</span>
      <span>{{ c.createdAt }}</span>
      <span class="spacer" />
      <span>♥ {{ c.likes }}</span>
      <span>💬 {{ c.replies }}</span>
    </div>
  </RouterLink>

  <!-- 글쓰기 진입점 -->
  <RouterLink to="/community/new" class="write">＋ 이 장소의 곡 등록하기</RouterLink>
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

.search {
  width: 100%;
  min-height: 44px;
  padding: 0 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  font: inherit;
  font-size: 0.85rem;
}

.search::placeholder {
  color: var(--text-faint);
}

.sorts {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}

.sort {
  min-height: 36px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  font-size: 0.78rem;
  color: var(--text-faint);
}

.sort--on {
  border-color: color-mix(in srgb, var(--mood) 55%, transparent);
  background: color-mix(in srgb, var(--mood) 18%, transparent);
  color: var(--mood-accent);
}

.views {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin-top: 12px;
  padding: 4px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
}

.viewtab {
  min-height: 40px;
  border-radius: 7px;
  font-size: 0.82rem;
  color: var(--text-faint);
  transition: background 0.2s, color 0.2s;
}

.viewtab--on {
  background: color-mix(in srgb, var(--mood) 22%, transparent);
  color: var(--mood-accent);
  font-weight: 500;
}

.empty {
  padding: 28px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-faint);
}

.item {
  display: block;
  text-decoration: none;
  /* 기본 내부 텍스트를 어둡게 */
  color: #0d1014;
  /* 카드 배경을 무드색(--item)으로 사용 */
  background: var(--item, var(--surface));
  border: 1px solid var(--border);
  border-left: none;
  border-radius: var(--radius);
  padding: 16px;
  transition: background 180ms ease, color 180ms ease, transform 120ms ease, border-color 180ms ease;
}
.item * {
  color: inherit;
}
.item:hover,
.item:focus-within,
.item:active {
  background: #0d1014;
  color: var(--item) !important;
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--item) 45%, var(--border));
}

.item__head {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.badge--mood-chip {
  border-color: color-mix(in srgb, var(--item) 45%, transparent);
  background: color-mix(in srgb, var(--item) 15%, transparent);
  color: var(--text);
}

.item__track {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.item__comment {
  margin: 6px 0 0;
  font-size: 0.83rem;
  line-height: 1.6;
  color: var(--text-dim);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item__foot {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
  font-size: 0.72rem;
  color: var(--text-faint);
}

.spacer {
  flex: 1;
}

.write {
  display: grid;
  place-items: center;
  min-height: 50px;
  border-radius: var(--radius);
  border: 1px dashed color-mix(in srgb, var(--mood) 45%, var(--border));
  background: color-mix(in srgb, var(--mood) 8%, transparent);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--mood-accent);
}

.write:hover {
  background: color-mix(in srgb, var(--mood) 15%, transparent);
}
@media (hover: none) {
  .item:active {
    background: #0d1014;
    color: var(--item) !important;
  }
}
.badge--mood-chip {
  border-color: color-mix(in srgb, var(--item) 45%, transparent);
  background: color-mix(in srgb, var(--item) 15%, transparent);
  color: inherit;
}
</style>
