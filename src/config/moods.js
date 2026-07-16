// 무드 정의 · 카테고리 매핑 · 무드별 실제 음원(트랙)
//
// 무드 체계(id/label)는 mood_player 로직과 curation.json·LLM 응답 enum·TYPE_TO_MOOD 를 따른다.
// 색(color)은 mood_player 캐논색, accent·description 은 src 디자인 톤을 유지한다.
//
// ▶ 배포 시 음원 교체 지점: R2_BASE 를 당신의 Cloudflare R2 주소로 바꾸면 된다.
//   트랙 목록·제목·출처의 원본은 최상단 curation.json 이다(이 파일은 그 이식본).

const R2_BASE = 'https://pub-3fc25dd84d8b400c8e7c624382630552.r2.dev'

// TourAPI contentTypeId → 무드 (LLM 실패 시 규칙 폴백용)
export const TYPE_TO_MOOD = {
  12: 'calm',
  25: 'calm',
  14: 'muse',
  15: 'flutter',
  28: 'vivid',
  38: 'vivid',
  39: 'savory',
  32: 'dreamy',
}

// TourAPI contentTypeId → 한국어 라벨 (무드추론 프롬프트용)
export const TYPE_LABEL = {
  12: '관광지',
  14: '문화시설',
  15: '축제공연행사',
  25: '여행코스',
  28: '레포츠',
  32: '숙박',
  38: '쇼핑',
  39: '음식점',
}

// gradientId: MoodGradient.vue 의 6종 배경(serene/contemplative/vital/festive/gourmet/citywalk) 매핑.
// 무드↔그라디언트가 1:1 이 아니어도 되므로(예: dreamy 에 contemplative 를 써도 됨) 여기서 자유롭게 바꾼다.

// 트랙 헬퍼 — curation.json 의 r2Key 를 실제 재생 URL 로.
function track(mood, n, title, r2Key) {
  return { id: `${mood}-${n}`, title, url: `${R2_BASE}/${r2Key}` }
}

export const MOODS = [
  {
    id: 'calm',
    gradientId: 'serene',
    label: '고요',
    color: '#6aa9c9',
    accent: '#bfe3f2',
    description: '넓게 트인 풍경과 느린 호흡. 멀리서 들려오는 소리들.',
    contentTypeIds: [12, 25],
    tracks: [
      track('calm', 1, 'David Kushner - Daylight', 'audio/calm/calm-1.mp3'),
    ],
  },
  {
    id: 'muse',
    gradientId: 'contemplative',
    label: '사색',
    color: '#8f86c9',
    accent: '#d6cffa',
    description: '조용한 실내, 높은 천장. 생각이 천천히 걸어다니는 공간.',
    contentTypeIds: [14],
    tracks: [
      track('muse', 1, 'Frank Sinatra - Fly Me To The Moon ft. Count Basie', 'audio/muse/muse-1.mp3'),
    ],
  },
  {
    id: 'flutter',
    gradientId: 'festive',
    label: '설렘',
    color: '#e6a15c',
    accent: '#ffd9a8',
    description: '불빛과 박자가 겹쳐지는 밤. 마음이 조금 먼저 뛰기 시작한다.',
    contentTypeIds: [15],
    tracks: [
      track('flutter', 1, 'The Walters - I Love You So', 'audio/flutter/flutter-1.mp3'),
      track('flutter', 2, 'Lauv - Steal The Show (From "Elemental")', 'audio/flutter/flutter-2.mp3'),
    ],
  },
  {
    id: 'vivid',
    gradientId: 'vital',
    label: '활기',
    color: '#e0655f',
    accent: '#ffd9a8',
    description: '움직이는 몸, 바람을 가르는 속도. 거리가 환하게 깨어난다.',
    contentTypeIds: [28, 38],
    tracks: [track('vivid', 1, 'Take on Me', 'audio/vivid/vivid-1.mp3'),
      track('vivid', 2, 'RESCENE (리센느) - LOVE ATTACK (러브어택)', 'audio/vivid/vivid-2.mp3'),
      
    ],
  },
  {
    id: 'savory',
    gradientId: 'gourmet',
    label: '미식',
    color: '#cf8f6a',
    accent: '#f7d3b8',
    description: '접시가 부딪히는 소리, 따뜻한 조명. 저녁이 시작되는 골목.',
    contentTypeIds: [39],
    tracks: [
      track('savory', 1, '手嶌葵 (Aoi Teshima) - 森のちいさなレストラン', 'audio/savory/savory-1.mp3'),
    ],
  },
  {
    id: 'dreamy',
    gradientId: 'citywalk',
    label: '몽환',
    color: '#6f7fc9',
    accent: '#c2ead9',
    description: '깊어진 밤과 번지는 불빛. 현실과 꿈의 경계가 흐릿해지는 시간.',
    contentTypeIds: [32],
    tracks: [
      track('dreamy', 1, 'in the pool', 'audio/dreamy/dreamy-1.mp3'),
      track('dreamy', 2, 'Lauv - I Like Me Better', 'audio/dreamy/dreamy-2.mp3'),
    ],
  },
]

export const DEFAULT_MOOD_ID = 'calm'

export const MOOD_BY_ID = Object.fromEntries(MOODS.map((m) => [m.id, m]))

export function moodById(id) {
  return MOOD_BY_ID[id] ?? MOOD_BY_ID[DEFAULT_MOOD_ID]
}