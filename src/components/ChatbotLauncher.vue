<script setup>
import { ref } from 'vue'
import { CHAT_SAMPLE } from '../data/placeholder'

// 【플레이스홀더】 챗봇이 들어갈 자리.
// 데스크톱: 우하단 플로팅 패널 / 모바일: 전체화면 전환 (요구사항의 챗봇 UI 규격)
// 실제 연동 시 이 컴포넌트 안에서 대화 히스토리를 들고, 입력창을 활성화하면 된다.
const isOpen = ref(false)
</script>

<template>
  <div class="chatbot">
    <button
      v-if="!isOpen"
      class="fab"
      aria-label="챗봇 열기"
      @click="isOpen = true"
    >
      <span aria-hidden="true">💬</span>
    </button>

    <div v-else class="panel" role="dialog" aria-label="챗봇">
      <header class="panel__head">
        <div>
          <p class="panel__title">여기 챗봇</p>
          <p class="panel__sub">플레이스홀더 · 연동 예정</p>
        </div>
        <button class="panel__close" aria-label="닫기" @click="isOpen = false">✕</button>
      </header>

      <div class="log">
        <div v-for="(msg, i) in CHAT_SAMPLE" :key="i" class="msg" :class="`msg--${msg.role}`">
          {{ msg.text }}
        </div>
      </div>

      <form class="compose" @submit.prevent>
        <input
          class="compose__input"
          placeholder="챗봇 연동 예정 — 아직 입력할 수 없습니다"
          disabled
        />
        <button class="compose__send" type="submit" disabled aria-label="보내기">↑</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.fab {
  position: fixed;
  right: 16px;
  /* 하단 도크(플레이어+내비) 위로 띄운다 */
  bottom: calc(158px + env(safe-area-inset-bottom));
  z-index: 30;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--mood);
  color: #0d1014;
  font-size: 1.25rem;
  box-shadow: 0 6px 20px color-mix(in srgb, var(--mood) 35%, transparent);
  transition: transform 0.15s;
}

.fab:hover {
  transform: scale(1.06);
}

.panel {
  position: fixed;
  z-index: 40;
  display: flex;
  flex-direction: column;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  color: var(--panel-text);
  --text: var(--panel-text);
  --text-dim: var(--panel-text-dim);
  --text-faint: var(--panel-text-faint);
  --surface-2: var(--panel-surface-2);
  --mood-accent: var(--panel-mood-accent);
  --border: #0d1014;
  border: 1px solid var(--border);

  /* 모바일: 전체화면 */
  inset: 0;
  border-radius: 0;
}

.panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  padding-top: calc(16px + env(safe-area-inset-top));
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--mood) 10%, transparent);
}

.panel__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.panel__sub {
  margin: 2px 0 0;
  font-size: 0.7rem;
  color: var(--text-faint);
}

.panel__close {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: var(--text-dim);
}

.panel__close:hover {
  background: var(--surface-2);
  color: var(--text);
}

.log {
  flex: 1;
  overflow-y: auto;
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 16px;
}

.msg {
  max-width: 82%;
  padding: 10px 13px;
  border-radius: 14px;
  font-size: 0.85rem;
  line-height: 1.55;
}

.msg--bot {
  justify-self: start;
  border-bottom-left-radius: 4px;
  background: var(--surface-2);
  color: var(--text-dim);
}

.msg--user {
  justify-self: end;
  border-bottom-right-radius: 4px;
  background: color-mix(in srgb, var(--mood) 26%, transparent);
  color: var(--text);
}

.compose {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--border);
}

.compose__input {
  flex: 1;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  font: inherit;
  font-size: 0.85rem;
}

.compose__input::placeholder {
  color: var(--text-faint);
}

.compose__send {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--mood);
  color: #0d1014;
  font-weight: 700;
}

/* 데스크톱: 우하단 플로팅 패널 (하단 도크 위에 얹는다) */
@media (min-width: 720px) {
  .panel {
    inset: auto 20px calc(158px + env(safe-area-inset-bottom)) auto;
    width: 380px;
    height: min(520px, calc(100vh - 200px));
    border-radius: var(--radius);
    box-shadow: 0 20px 60px rgb(0 0 0 / 45%);
    overflow: hidden;
  }

  .panel__head {
    padding-top: 16px;
  }

  .compose {
    padding-bottom: 12px;
  }

  .fab {
    right: 20px;
  }
}
</style>