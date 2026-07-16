// 챗봇 엔진 — 순수 로직(DOM/Vue 없음). 브라우저에서 OpenAI chat/completions 직접 호출.
// feat/audio_player의 moodEngine.js 패턴을 따른다: 백엔드 없음 · 키는 VITE_OPENAI_API_KEY.
//
// 의뢰서 필수 항목(챗봇 나): "제공 JSON 데이터 기반 자연어 지역 정보 질의응답"을 만족시키기 위해,
// 8천여 건 전체를 프롬프트에 넣는 대신 질문과 관련된 POI·게시글만 골라 컨텍스트로 주입한다(RAG-lite).

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

const SYSTEM_PROMPT =
  '너는 서울 지역 정보 공유 커뮤니티 앱 "LocalHub"의 대화형 도우미다. ' +
  '사용자 질문에 앞서 [참고 데이터]로 전달되는 서울 관광지·문화시설·축제·여행코스·레포츠·쇼핑 정보와 사용자 등록 게시글만 사실로 활용해 답해라. ' +
  '[참고 데이터]에 없는 내용(예: 정확한 축제 날짜·영업시간처럼 원본에 없는 정보)은 지어내지 말고 없다고 말해라. ' +
  '장소·기분에 어울리는 음악 추천도 함께 도와줄 수 있다. 한국어로 친근하고 간결하게, 보통 2~4문장으로 답해라.'

// 조사·어미를 대충 떼어내는 아주 단순한 정규화 — 형태소 분석기 없이 "~에서", "~좀 알려줘" 같은
// 흔한 꼬리를 잘라 키워드만 남긴다. 완벽하지 않아도 부분 매칭엔 충분하다.
const TRAILING_PARTICLES = /(이|가|은|는|을|를|의|에서|에|으로|로|과|와|도|만|이나|나)$/
const STOPWORDS = new Set([
  '알려줘', '알려줄래', '추천', '추천해줘', '추천해', '해줘', '해줄래', '있어', '있나요', '있을까',
  '뭐', '뭐가', '어디', '근처', '주변', '좀', '가', '가고', '싶어', '싶은', '곳', '데', '요즘', '요',
])

function tokenize(text) {
  return (text || '')
    .split(/[^\p{L}\p{N}]+/u)
    .map((t) => t.replace(TRAILING_PARTICLES, ''))
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t))
}

const CATEGORY_KEYWORDS = [
  { typeId: 12, words: ['관광지', '관광', '명소', '볼거리'] },
  { typeId: 14, words: ['문화', '전시', '박물관', '미술관', '공연장'] },
  { typeId: 15, words: ['축제', '행사', '페스티벌', '공연'] },
  { typeId: 25, words: ['코스', '여행코스', '힐링', '산책'] },
  { typeId: 28, words: ['레포츠', '액티비티', '스포츠'] },
  { typeId: 38, words: ['쇼핑', '시장', '상가'] },
]
// 참고: 제공 데이터(public/data/*.json)엔 음식점(TourAPI 39)·숙박(32) 카테고리가 포함돼 있지 않다.
// "맛집" 질의를 쇼핑 데이터로 얼버무리지 않도록 카테고리 폴백에서 의도적으로 제외했다 —
// 매칭이 없으면 SYSTEM_PROMPT 지시대로 "제공 데이터에 없다"고 답하게 된다.

function matchedCategoryTypeIds(query) {
  return CATEGORY_KEYWORDS.filter((c) => c.words.some((w) => query.includes(w))).map((c) => c.typeId)
}

// pois 중 질문과 관련 있어 보이는 항목을 골라 반환 (제목·주소 키워드 매칭 → 없으면 카테고리 키워드 폴백)
function relevantPois(query, pois, limit = 8) {
  if (!pois?.length) return []
  const tokens = tokenize(query)

  const scored = pois
    .map((p) => {
      const hay = `${p.title} ${p.addr}`
      const score = tokens.filter((t) => hay.includes(t)).length
      return { p, score }
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)

  if (scored.length) return scored.slice(0, limit).map((s) => s.p)

  const typeIds = matchedCategoryTypeIds(query)
  if (typeIds.length) return pois.filter((p) => typeIds.includes(p.typeId)).slice(0, limit)

  return []
}

// curations(커뮤니티 게시글) 중 질문과 관련 있어 보이는 항목 (게시글 검색 질의 대응)
function relevantCurations(query, curations, limit = 5) {
  if (!curations?.length) return []
  const tokens = tokenize(query)
  if (!tokens.length) return []

  return curations
    .map((c) => {
      const hay = `${c.place} ${c.track} ${c.artist} ${c.comment}`
      const score = tokens.filter((t) => hay.includes(t)).length
      return { c, score }
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.c)
}

// 최신 사용자 질문 기준으로 제공 데이터 컨텍스트 문자열 생성. 매칭 없으면 빈 문자열.
export function buildDataContext(query, { pois = [], curations = [] } = {}) {
  const places = relevantPois(query, pois)
  const posts = relevantCurations(query, curations)
  if (!places.length && !posts.length) return ''

  const lines = ['[참고 데이터] 아래 항목만 사실로 활용해 답하라.']

  if (places.length) {
    lines.push('서울 제공 데이터(관광지·문화시설·축제·여행코스·레포츠·쇼핑):')
    places.forEach((p) => lines.push(`- ${p.title} (${p.type.label}) — ${p.addr}`))
  }

  if (posts.length) {
    lines.push('사용자 등록 게시글(장소별 곡 큐레이션):')
    posts.forEach((c) => lines.push(`- ${c.place}: "${c.track}"(${c.artist || '아티스트 미상'}) — ${c.comment}`))
  }

  return lines.join('\n')
}

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

// history: [{ role: 'bot'|'user', text }]. data: { pois, curations } — 제공 JSON·커뮤니티 게시글.
// 성공 시 assistant 응답 문자열 반환, 실패 시 throw.
export async function chatComplete(history, { key = getApiKey(), signal, pois = [], curations = [] } = {}) {
  if (!key) throw new Error('no key')

  const lastUserText = [...history].reverse().find((m) => m.role === 'user')?.text || ''
  const context = buildDataContext(lastUserText, { pois, curations })

  const messages = [{ role: 'system', content: SYSTEM_PROMPT }]
  if (context) messages.push({ role: 'system', content: context })
  messages.push(...toApiMessages(history))

  const body = {
    model: 'gpt-5-mini',
    messages,
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
