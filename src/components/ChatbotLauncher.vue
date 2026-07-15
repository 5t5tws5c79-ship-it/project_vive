<script setup>
import { ref, nextTick } from 'vue'
import { chatComplete, getApiKey } from '../lib/chat'

// 데스크톱: 우하단 플로팅 패널 / 모바일: 전체화면 전환 (요구사항의 챗봇 UI 규격)
// 브라우저에서 OpenAI를 직접 호출한다(백엔드 없음). feat/audio_player의 엔진 패턴 참조.
const isOpen = ref(false)
const logEl = ref(null)

// 화면용 대화 히스토리 — role: 'bot'|'user' (CSS .msg--bot/.msg--user 와 매칭)
const messages = ref([
  { role: 'bot', text: '안녕하세요! 지금 계신 곳 근처의 장소나 어울리는 곡을 물어보세요.' },
])
const draft = ref('')
const sending = ref(false)
const hasKey = getApiKey() !== ''

async function scrollToEnd() {
  await nextTick()
  if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight
}

async function send() {
  const text = draft.value.trim()
  if (!text || sending.value) return

  messages.value.push({ role: 'user', text })
  draft.value = ''
  sending.value = true
  scrollToEnd()

  if (!hasKey) {
    messages.value.push({
      role: 'bot',
      text: 'OpenAI 키가 설정되지 않았습니다. .env에 VITE_OPENAI_API_KEY를 추가해 주세요.',
    })
    sending.value = false
    scrollToEnd()
    return
  }

  try {
    // 방금 넣은 사용자 메시지까지 포함한 히스토리를 그대로 전달
    const reply = await chatComplete(messages.value)
    messages.value.push({ role: 'bot', text: reply })
  } catch (err) {
    messages.value.push({
      role: 'bot',
      text: `응답을 가져오지 못했어요 (${err.message}). 잠시 후 다시 시도해 주세요.`,
    })
  } finally {
    sending.value = false
    scrollToEnd()
  }
}
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
          <p class="panel__sub">{{ hasKey ? '무엇이든 물어보세요' : 'API 키 미설정' }}</p>
        </div>
        <button class="panel__close" aria-label="닫기" @click="isOpen = false">✕</button>
      </header>

      <div ref="logEl" class="log">
        <div v-for="(msg, i) in messages" :key="i" class="msg" :class="`msg--${msg.role}`">
          {{ msg.text }}
        </div>
        <div v-if="sending" class="msg msg--bot msg--typing" aria-label="응답 작성 중">
          <span class="dot" /><span class="dot" /><span class="dot" />
        </div>
      </div>

      <form class="compose" @submit.prevent="send">
        <input
          v-model="draft"
          class="compose__input"
          placeholder="메시지를 입력하세요"
          :disabled="sending"
          aria-label="메시지 입력"
        />
        <button
          class="compose__send"
          type="submit"
          :disabled="sending || !draft.trim()"
          aria-label="보내기"
        >↑</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.fab {
  position: fixed;
  right: 16px;
  /* 하단 도크(플레이어+내비) 위로 띄운다. --dock-h는 App.vue가 실측(도크 자체
     safe-area 패딩 포함)해서 채우므로 여기서 env()를 다시 더하지 않는다 */
  bottom: calc(var(--dock-h, 150px) + 12px);
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

/* 응답 대기 중 점 3개 */
.msg--typing {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.msg--typing .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-faint);
  animation: blink 1.2s ease-in-out infinite;
}

.msg--typing .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.msg--typing .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0%, 60%, 100% {
    opacity: 0.25;
  }
  30% {
    opacity: 1;
  }
}

.compose__send:disabled {
  opacity: 0.45;
  cursor: not-allowed;
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
    inset: auto 20px calc(var(--dock-h, 150px) + 12px) auto;
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