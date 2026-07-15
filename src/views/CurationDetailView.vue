<script setup>
import { computed, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { curationById } from '../data/placeholder'
import { moodById } from '../config/moods'

const route = useRoute()
const curation = computed(() => curationById(route.params.id))
const mood = computed(() => (curation.value ? moodById(curation.value.moodId) : null))

// 좋아요 상태 (플레이스홀더 — 백엔드 연동 전, 화면 내 토글만)
const liked = ref(false)
const likeCount = computed(() => (curation.value?.likes ?? 0) + (liked.value ? 1 : 0))

function toggleLike() {
  liked.value = !liked.value
}
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
        <button
          class="action like"
          :class="{ 'like--on': liked }"
          :aria-pressed="liked"
          @click="toggleLike"
        >
          <span class="like__heart" aria-hidden="true">♥</span>
          <span class="like__label">좋아요</span>
          <span class="like__count">{{ likeCount }}</span>
        </button>
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
  background: var(--item, var(--surface));
  color: #0d1014;
  border-left: 0; /* 기존 강조선 제거(선호시 유지) */
  border-radius: var(--radius);
  padding: 20px;
}
/* 내부 블록(트랙 등)은 흰 배경, 검정 텍스트 */
.detail .track,
.detail .owner__pw,
.detail .owner__btn,
.detail .reply__input,
.detail .reply__send {
  background: #ffffff;
  color: #0d1014;
  border: 1px solid var(--border);
}
.detail .track__art {
  background: var(--item);
  color: #ffffff;
}
.detail .track__play {
  background: #ffffff;
  color: var(--text-dim);
  border: 1px solid var(--border);
}
/* 액션 버튼 기본 스타일 (흰 배경 유지) */
.detail .action {
  background: #ffffff;
  color: #0d1014;
  border: 1px solid var(--border);
}
/* 삭제 버튼: 빨간 배경 + 흰 텍스트 */
.detail .owner__btn--danger {
  background: var(--destructive, #d4183d) !important;
  color: #ffffff !important;
  border-color: var(--destructive, #d4183d) !important;
}

/* 메타 · 힌트 등은 검정 계열로 유지 */
.detail .meta,
.detail .hint,
.detail .comment,
.detail .item__foot {
  color: #0d1014;
}

/* 호버 시 카드 반전 동작 유지(원하면 조정) */
.detail:hover,
.detail:focus-within {
  /* 예: 유지하거나 더 진하게 할 수 있음 */
  box-shadow: 0 4px 18px rgba(0,0,0,0.12);
}

/* 모바일에서 터치 반전이 필요하면 추가 조정 */
@media (hover: none) {
  .detail:active { transform: none; }
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
/* place / placeType 배지(무드칩 제외)는 흰 배경 + 어두운 텍스트로 고정 */
.chips .badge:not(.badge--mood-chip),
.item__head .badge:not(.badge--mood-chip) {
  background: #ffffff !important;
  color: #0d1014 !important;
  border: 1px solid var(--border) !important;
  box-shadow: none !important;
}
/* 버튼형 배지(클릭 가능한 경우) 시 hover 스타일 */
.chips .badge:not(.badge--mood-chip):hover,
.item__head .badge:not(.badge--mood-chip):hover {
  background: color-mix(in srgb, #ffffff 90%, var(--item, #ffffff)) !important;
  color: #0d1014 !important;
}
/* 안전: mood chip는 기존 동작 유지 */
.chips .badge.badge--mood-chip,
.item__head .badge.badge--mood-chip {
  background: color-mix(in srgb, var(--item) 15%, transparent) !important;
  border-color: color-mix(in srgb, var(--item) 45%, transparent) !important;
  color: inherit !important;
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

/* ---------- 좋아요 버튼 ---------- */
/* NOTE: --destructive가 :root에 미정의라 기존 hover 색이 안 먹던 문제 → 지역 변수로 해결 */
.detail .like {
  --like-red: var(--destructive, #ff4d6d);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;

  /* 기본: 하얀 배경 + 검은 테두리 + 빨간 텍스트·하트 */
  background: #ffffff;
  border: 1px solid #000000;
  color: var(--like-red);

  transition:
    color 0.25s ease,
    border-color 0.25s ease,
    background 0.25s ease;
}

.detail .like__heart {
  display: inline-block;
  transition: color 0.25s ease, transform 0.25s ease;
  will-change: transform;
}

/* 호버/포커스/좋아요 켜짐: 빨간 배경 + 빨간 테두리 + 검은 텍스트·하트 */
.detail .like:hover,
.detail .like:focus-visible,
.detail .like--on {
  background: var(--like-red);
  border-color: var(--like-red);
  color: #000000;
}

.detail .like:hover .like__heart,
.detail .like:focus-visible .like__heart {
  transform: scale(1.18);
}

/* 클릭(좋아요 켜짐): 하트 팝 애니메이션 */
.detail .like--on .like__heart {
  animation: heart-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes heart-pop {
  0% { transform: scale(1); }
  30% { transform: scale(0.75); }
  60% { transform: scale(1.4); }
  100% { transform: scale(1); }
}

/* 모션 최소화 환경에서는 색 전환만 */
@media (prefers-reduced-motion: reduce) {
  .detail .like__heart {
    transition: color 0.25s ease;
  }
  .detail .like:hover .like__heart,
  .detail .like:focus-visible .like__heart {
    transform: none;
  }
  .detail .like--on .like__heart {
    animation: none;
  }
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