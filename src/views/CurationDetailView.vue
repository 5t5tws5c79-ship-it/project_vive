<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { curationById } from '../data/placeholder'
import { moodById } from '../config/moods'

const route = useRoute()
const curation = computed(() => curationById(route.params.id))
const mood = computed(() => (curation.value ? moodById(curation.value.moodId) : null))
</script>

<template>
  <RouterLink to="/community" class="back">← 큐레이션 목록</RouterLink>

  <p v-if="!curation" class="card empty">존재하지 않는 글입니다.</p>

  <template v-else>
    <article class="card detail" :style="{ '--item': mood.color }">
      <div class="chips">
        <span class="badge">📍 {{ curation.place }}</span>
        <span class="badge">{{ curation.placeType }}</span>
        <span class="badge badge--mood-chip">{{ mood.label }}</span>
      </div>

      <div class="track">
        <span class="track__art" aria-hidden="true">♪</span>
        <div>
          <p class="track__title">{{ curation.track }}</p>
          <p class="track__artist">{{ curation.artist }}</p>
        </div>
        <button class="track__play" aria-label="재생">▶</button>
      </div>

      <p class="comment">{{ curation.comment }}</p>

      <div class="meta">
        <span>{{ curation.nickname }}</span>
        <span aria-hidden="true">·</span>
        <span>{{ curation.createdAt }}</span>
      </div>

      <div class="actions">
        <button class="action">♥ 좋아요 {{ curation.likes }}</button>
      </div>

      <!-- 익명 커뮤니티: 비밀번호로만 권한 확인 -->
      <div class="owner">
        <input class="owner__pw" type="password" placeholder="작성 시 입력한 비밀번호" disabled />
        <button class="owner__btn" disabled>수정</button>
        <button class="owner__btn owner__btn--danger" disabled>삭제</button>
      </div>
      <p class="hint">플레이스홀더 — 비밀번호 확인과 수정·삭제는 아직 동작하지 않습니다.</p>
    </article>

    <section class="card">
      <h2 class="card__title">댓글 {{ curation.replies }}</h2>
      <p class="empty-inline">댓글 목록이 여기 표시됩니다.</p>
      <form class="reply" @submit.prevent>
        <input class="reply__input" placeholder="댓글 입력 — 연동 예정" disabled />
        <button class="reply__send" type="submit" disabled>등록</button>
      </form>
    </section>
  </template>
</template>

<style scoped>
.back {
  display: inline-block;
  font-size: 0.8rem;
  color: var(--text-faint);
  text-decoration: none;
}

.back:hover {
  color: var(--text);
}

.empty {
  padding: 28px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-faint);
}

.detail {
  border-left: 3px solid var(--item);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.badge--mood-chip {
  border-color: color-mix(in srgb, var(--item) 45%, transparent);
  background: color-mix(in srgb, var(--item) 15%, transparent);
  color: var(--text);
}

.track {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
}

.track__art {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--item) 25%, transparent);
  color: #fff;
}

.track__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.track__artist {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: var(--text-dim);
}

.track__play {
  margin-left: auto;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--border);
  color: var(--text-dim);
  font-size: 0.8rem;
}

.comment {
  margin: 16px 0 0;
  font-size: 0.92rem;
  line-height: 1.75;
  color: var(--text);
}

.meta {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  font-size: 0.75rem;
  color: var(--text-faint);
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.action {
  flex: 1;
  min-height: 44px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  font-size: 0.83rem;
  color: var(--text-dim);
}

.action:hover {
  border-color: var(--item);
  color: var(--text);
}

.owner {
  display: flex;
  gap: 8px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.owner__pw {
  flex: 1;
  min-width: 0;
  min-height: 44px;
  padding: 0 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  font: inherit;
  font-size: 0.82rem;
}

.owner__btn {
  flex-shrink: 0;
  min-height: 44px;
  padding: 0 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  font-size: 0.82rem;
  color: var(--text-dim);
}

.owner__btn--danger {
  color: #d98a8a;
}

.hint {
  margin: 10px 0 0;
  font-size: 0.72rem;
  color: var(--text-faint);
}

.empty-inline {
  margin: 0 0 12px;
  padding: 20px 0;
  text-align: center;
  font-size: 0.82rem;
  color: var(--text-faint);
}

.reply {
  display: flex;
  gap: 8px;
}

.reply__input {
  flex: 1;
  min-width: 0;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  font: inherit;
  font-size: 0.85rem;
}

.reply__send {
  flex-shrink: 0;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 999px;
  background: var(--mood);
  color: #0d1014;
  font-size: 0.83rem;
  font-weight: 600;
}
</style>
