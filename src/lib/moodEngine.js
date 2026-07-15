// 무드 엔진 — 순수 로직(DOM/Vue 없음). 위치→근접→무드추론(LLM 주 + 규칙 폴백).
// mood_player/vue/moodEngine.js 의 검증된 로직 이식본. import 만 src config 에 맞춤.
import { TYPE_TO_MOOD, TYPE_LABEL, moodById } from '../config/moods'

const CONF = 0.45

export function haversine(aLat, aLng, bLat, bLng) {
  const R = 6371000, r = Math.PI / 180, dLat = (bLat - aLat) * r, dLng = (bLng - aLng) * r
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * r) * Math.cos(bLat * r) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}
export function nearby(poi, loc, n) {
  return (poi || [])
    .map((p) => ({ ...p, dist: haversine(loc.lat, loc.lng, p.lat, p.lng) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, n)
}
export function kstHour() {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', hour: '2-digit', hour12: false }).format(new Date())) % 24
}
export function isNight(h) { return h >= 21 || h < 5 }

export function ruleMood(list) {
  const c = {}
  list.forEach((p) => { const m = TYPE_TO_MOOD[p.typeId] || 'calm'; c[m] = (c[m] || 0) + 1 })
  let best = 'calm', bestN = -1
  for (const m in c) { if (c[m] > bestN) { bestN = c[m]; best = m } }
  const reason = `근처 ${list.length}곳 중 ${bestN}곳이 '${moodById(best).label}' 성향`
  return { moodId: best, confidence: list.length ? bestN / list.length : 0, reason, decidedBy: 'rule' }
}

export function promptText(list, hour) {
  return '주변 장소:\n' + list.map((p, i) =>
    `${i + 1}. ${p.title} (${TYPE_LABEL[p.typeId] || p.type}) - ${Math.round(p.dist)}m`).join('\n')
    + `\n시간대: ${hour}시 (한국시간)`
}

export async function llmMood(list, hour, key) {
  if (!key) throw new Error('no key')
  const sys = '너는 위치 기반 음악 무드 큐레이터다. 아래는 사용자 현재 위치 주변 장소 목록(가까운 순, 거리 포함)이다. 이 동네에 흐르는 전체 분위기를 판단해 6개 무드 중 가장 어울리는 하나를 골라라. '
    + '무드: calm(고요:잔잔·정적, 사찰·공원·산책), muse(사색:미술관·박물관·고궁), flutter(설렘:축제·공연·핫플), vivid(활기:시장·번화가·쇼핑·레포츠), savory(미식:맛집·카페), dreamy(몽환:밤·야경·해안). '
    + '가까운 장소일수록 크게 반영. reason은 한국어 한 문장.'
  const body = {
    model: 'gpt-5-mini',
    messages: [{ role: 'system', content: sys }, { role: 'user', content: promptText(list, hour) }],
    reasoning_effort: 'minimal', max_completion_tokens: 500,
    response_format: {
      type: 'json_schema', json_schema: {
        name: 'mood', strict: true, schema: {
          type: 'object', additionalProperties: false,
          properties: { moodId: { type: 'string', enum: ['calm', 'muse', 'flutter', 'vivid', 'savory', 'dreamy'] }, confidence: { type: 'number' }, reason: { type: 'string' } },
          required: ['moodId', 'confidence', 'reason'],
        },
      },
    },
  }
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST', headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error('http ' + r.status)
  const j = await r.json()
  const c = j.choices && j.choices[0] && j.choices[0].message.content
  if (!c) throw new Error('empty output')
  const o = JSON.parse(c)
  return { moodId: o.moodId, confidence: o.confidence, reason: o.reason, decidedBy: 'llm', raw: c }
}

const cache = {}
export function signature(list, hour) { return list.map((p) => p.title).join('|') + '|' + (isNight(hour) ? 'N' : 'D') }

// LLM 주 + 규칙 폴백 + 캐시(같은 근처 집합이면 재호출 안 함 = 비용 가드). 절대 throw 하지 않음.
export async function inferMood(list, hour, key) {
  if (key) {
    const sig = signature(list, hour)
    if (cache[sig]) return cache[sig]
    try {
      let r = await llmMood(list, hour, key)
      if (r.confidence < CONF) r = ruleMood(list)
      cache[sig] = r
      return r
    } catch (e) {
      const r = ruleMood(list)
      r.note = 'LLM 실패(' + e.message + ')→규칙'
      return r
    }
  }
  return ruleMood(list)
}
