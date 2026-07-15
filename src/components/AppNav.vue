<script setup>
const TABS = [
  { to: '/', label: '지금, 여기', icon: '📍' },
  { to: '/community', label: '큐레이션', icon: '💬' },
]
</script>

<template>
  <nav class="nav" aria-label="주요 화면">
    <!-- '/'는 모든 경로의 접두사라 router-link-active가 항상 붙는다 → exact로 구분 -->
    <RouterLink
      v-for="tab in TABS"
      :key="tab.to"
      :to="tab.to"
      class="tab"
      :class="{ 'tab--exact': tab.to === '/' }"
    >
      <span class="tab__icon" aria-hidden="true">{{ tab.icon }}</span>
      <span class="tab__label">{{ tab.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
/* 섹션들과 같은 체계: 검은 테두리 + 흰 배경 + 검은 글씨 */
.nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin: 8px 0 10px;
  padding: 5px;
  border-radius: var(--radius);
  border: 1px solid var(--panel-border);
  background: var(--panel-bg);
}

.tab {
  display: grid;
  place-items: center;
  gap: 3px;
  /* 터치 타깃 44px 이상 */
  min-height: 48px;
  padding: 6px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  text-decoration: none;
  color: var(--panel-text-faint);
  transition: color 0.2s, background 0.2s, border-color 0.2s;
}

.tab:hover {
  color: var(--panel-text);
}

/* 활성 탭: 검은 테두리 + 검은 글씨 + 무드색 배경 (액션 버튼 문법과 동일) */
.tab.router-link-active:not(.tab--exact),
.tab--exact.router-link-exact-active {
  color: #0d1014;
  background: var(--mood);
  border-color: #0d1014;
}

.tab__icon {
  font-size: 1.05rem;
  line-height: 1;
}

.tab__label {
  font-size: 0.7rem;
  font-weight: 500;
}
</style>