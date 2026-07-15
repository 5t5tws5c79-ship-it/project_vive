// 챗봇 엔진 — 순수 로직(DOM/Vue 없음). 브라우저에서 OpenAI chat/completions 직접 호출.
// feat/audio_player의 moodEngine.js 패턴을 따른다: 백엔드 없음 · 키는 VITE_OPENAI_API_KEY.

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

const SYSTEM_PROMPT =
  '너는 위치 기반 음악 큐레이션 앱의 대화형 도우미다. ' +
  '사용자가 지금 있는 장소·기분·상황에 어울리는 음악이나 분위기를 추천하고, 앱 사용을 돕는다. ' +
  '한국어로 친근하고 간결하게, 보통 2~3문장으로 답해라. 모르면 모른다고 말해라.'

export function getApiKey() {
  return import.meta.env.VITE_OPENAI_API_KEY || ''
}

// 화면용 역할(bot/user) → OpenAI 역할(assistant/user) 매핑
function toApiMessages(history) {
  return history.map((m) => ({
    role: m.role === 'bot' ? 'assistant' : 'user',
    content: m.text,
  }))
}

// history: [{ role: 'bot'|'user', text }]. 성공 시 assistant 응답 문자열 반환, 실패 시 throw.
export async function chatComplete(history, { key = getApiKey(), signal } = {}) {
  if (!key) throw new Error('no key')

  const body = {
    model: 'gpt-5-mini',
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...toApiMessages(history)],
    reasoning_effort: 'minimal',
    max_completion_tokens: 500,
  }

  const r = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })
  if (!r.ok) throw new Error('http ' + r.status)

  const j = await r.json()
  const c = j.choices && j.choices[0] && j.choices[0].message.content
  if (!c) throw new Error('empty output')
  return c.trim()
}
