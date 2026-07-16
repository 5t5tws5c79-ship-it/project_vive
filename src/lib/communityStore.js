import { ref } from 'vue'
import { CURATIONS } from '../data/placeholder'

// 백엔드가 없어서 localStorage를 임시 저장소로 쓴다.
// 한 브라우저(세션)에서는 등록·좋아요·댓글이 실제로 남는 것처럼 동작한다.
const STORAGE_KEY = 'vive:community:v1'

function seed() {
  return CURATIONS.map((c) => ({ ...c, comments: [], likedByMe: false }))
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (err) {
    console.error('community store load failed', err)
  }
  return seed()
}

export const curations = ref(load())

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(curations.value))
  } catch (err) {
    console.error('community store save failed', err)
  }
}

function nextId() {
  return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function curationById(id) {
  return curations.value.find((c) => c.id === id) ?? null
}

export function addCuration({
  place,
  placeType = '',
  track,
  artist = '',
  comment = '',
  moodId,
  nickname = '익명의 산책자',
  password = '',
  coords = null,
}) {
  const entry = {
    id: nextId(),
    place,
    placeType,
    track,
    artist,
    nickname,
    comment,
    moodId,
    likes: 0,
    replies: 0,
    createdAt: new Date().toISOString().slice(0, 10),
    coords,
    pin: { x: 50, y: 50 },
    password: password || null,
    comments: [],
    likedByMe: false,
  }
  curations.value.unshift(entry)
  persist()
  return entry
}

export function toggleLike(id) {
  const c = curationById(id)
  if (!c) return
  c.likedByMe = !c.likedByMe
  c.likes += c.likedByMe ? 1 : -1
  persist()
}

export function addComment(id, text) {
  const c = curationById(id)
  if (!c || !text.trim()) return null
  const entry = { id: nextId(), text: text.trim(), createdAt: new Date().toISOString().slice(0, 10) }
  c.comments.push(entry)
  c.replies = c.comments.length
  persist()
  return entry
}

// 비밀번호 확인: 글에 비밀번호가 있으면 입력값과 일치해야 true 반환
export function verifyPassword(id, password) {
  const c = curationById(id)
  if (!c) return false
  if (c.password === null) return false // 비밀번호 없는 글은 항상 false
  return String(c.password) === String(password)
}

// 수정: verifyPassword 통과 시 허용된 필드만 패치하고 persist
export function updateCuration(id, password, patch = {}) {
  const c = curationById(id)
  if (!c) return false
  if (!verifyPassword(id, password)) return false
  const allowed = ['track', 'artist', 'comment', 'place', 'placeType', 'moodId']
  Object.keys(patch).forEach((k) => {
    if (allowed.includes(k)) c[k] = patch[k]
  })
  persist()
  return true
}

// 삭제: verifyPassword 통과 시 배열에서 제거하고 persist
export function deleteCuration(id, password) {
  const c = curationById(id)
  if (!c) return false
  if (!verifyPassword(id, password)) return false
  const idx = curations.value.findIndex((x) => x.id === id)
  if (idx === -1) return false
  curations.value.splice(idx, 1)
  persist()
  return true
}
