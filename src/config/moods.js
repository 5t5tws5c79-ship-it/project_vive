// 【플레이스홀더】 무드 정의 — 색 / 설명 / 매칭 콘텐츠 유형 / 트랙(앰비언트 레시피) / 유튜브 ID
//
// 이 6개 무드는 확정된 게 아니라, 디자인과 전환 플로우를 보기 위한 임시 세트다.
// 무드 이름·색·개수를 바꾸면 화면 톤과 플레이리스트가 통째로 따라 바뀐다.
// contentTypeIds 는 지금 아무 데서도 쓰지 않는다 (추론 로직을 붙일 때 쓸 자리).
//
// tracks[].recipe 필드
//   root      : 근음 (Hz)
//   intervals : 근음 대비 반음 오프셋 (화음 구성)
//   wave      : 오실레이터 파형
//   cutoff    : 로우패스 필터 컷오프 (Hz)
//   noise     : 화이트노이즈 섞는 양 (0~1)
//   lfoRate   : 음량 흔들림 주기 (Hz)
//   lfoDepth  : 음량 흔들림 깊이 (0~1)
//   detune    : 보이스별 디튠 폭 (cent)

export const MOODS = [
  {
    id: 'serene',
    label: '고요',
    color: '#6aa9c9',
    accent: '#bfe3f2',
    description: '넓게 트인 풍경과 느린 호흡. 멀리서 들려오는 소리들.',
    contentTypeIds: [12, 25],
    youtubeIds: [], // 예: ['jfKfPfyJRdk'] — 유튜브 모드용 영상 ID를 채워 넣으세요
    tracks: [
      {
        id: 'serene-1',
        title: 'Wide Horizon',
        recipe: { root: 110, intervals: [0, 7, 12, 19], wave: 'sine', cutoff: 900, noise: 0.05, lfoRate: 0.07, lfoDepth: 0.35, detune: 6 },
      },
      {
        id: 'serene-2',
        title: 'Still Water',
        recipe: { root: 98, intervals: [0, 5, 12], wave: 'sine', cutoff: 700, noise: 0.08, lfoRate: 0.05, lfoDepth: 0.4, detune: 9 },
      },
      {
        id: 'serene-3',
        title: 'Long Shadow',
        recipe: { root: 131, intervals: [0, 7, 16], wave: 'triangle', cutoff: 800, noise: 0.04, lfoRate: 0.09, lfoDepth: 0.3, detune: 4 },
      },
    ],
  },
  {
    id: 'contemplative',
    label: '사색',
    color: '#8a7fbf',
    accent: '#d6cffa',
    description: '조용한 실내, 높은 천장. 생각이 천천히 걸어다니는 공간.',
    contentTypeIds: [14],
    youtubeIds: [],
    tracks: [
      {
        id: 'contemplative-1',
        title: 'Reading Room',
        recipe: { root: 146, intervals: [0, 3, 10], wave: 'sine', cutoff: 1100, noise: 0.03, lfoRate: 0.11, lfoDepth: 0.25, detune: 7 },
      },
      {
        id: 'contemplative-2',
        title: 'Marble Hall',
        recipe: { root: 116, intervals: [0, 3, 7, 14], wave: 'triangle', cutoff: 950, noise: 0.05, lfoRate: 0.08, lfoDepth: 0.3, detune: 11 },
      },
      {
        id: 'contemplative-3',
        title: 'Quiet Exhibit',
        recipe: { root: 155, intervals: [0, 7, 15], wave: 'sine', cutoff: 1000, noise: 0.02, lfoRate: 0.13, lfoDepth: 0.2, detune: 5 },
      },
    ],
  },
  {
    id: 'vital',
    label: '활력',
    color: '#e08a3c',
    accent: '#ffd9a8',
    description: '움직이는 몸, 바람을 가르는 속도. 심장이 조금 빨라진다.',
    contentTypeIds: [28],
    youtubeIds: [],
    tracks: [
      {
        id: 'vital-1',
        title: 'Uphill',
        recipe: { root: 165, intervals: [0, 4, 7, 12], wave: 'sawtooth', cutoff: 1600, noise: 0.09, lfoRate: 0.9, lfoDepth: 0.35, detune: 12 },
      },
      {
        id: 'vital-2',
        title: 'Open Track',
        recipe: { root: 196, intervals: [0, 4, 11], wave: 'square', cutoff: 1400, noise: 0.07, lfoRate: 1.3, lfoDepth: 0.3, detune: 8 },
      },
      {
        id: 'vital-3',
        title: 'Second Wind',
        recipe: { root: 147, intervals: [0, 7, 12, 16], wave: 'sawtooth', cutoff: 1800, noise: 0.12, lfoRate: 0.7, lfoDepth: 0.4, detune: 15 },
      },
    ],
  },
  {
    id: 'festive',
    label: '축제',
    color: '#d94f70',
    accent: '#ffc9d6',
    description: '사람들이 모이는 소리. 불빛과 박자가 겹쳐지는 밤.',
    contentTypeIds: [15],
    youtubeIds: [],
    tracks: [
      {
        id: 'festive-1',
        title: 'Lantern Row',
        recipe: { root: 174, intervals: [0, 4, 7, 11], wave: 'square', cutoff: 2000, noise: 0.1, lfoRate: 1.8, lfoDepth: 0.45, detune: 14 },
      },
      {
        id: 'festive-2',
        title: 'Night Parade',
        recipe: { root: 220, intervals: [0, 5, 9], wave: 'sawtooth', cutoff: 2200, noise: 0.13, lfoRate: 2.4, lfoDepth: 0.4, detune: 18 },
      },
      {
        id: 'festive-3',
        title: 'Crowd Glow',
        recipe: { root: 185, intervals: [0, 4, 9, 14], wave: 'square', cutoff: 1900, noise: 0.11, lfoRate: 1.5, lfoDepth: 0.5, detune: 10 },
      },
    ],
  },
  // 주의: 서울 데이터셋에는 음식점(39) 파일이 없어 이 무드는 발동하지 않는다.
  // 파일을 확보하면 config/dataset.js 의 FILES 에 39번 항목만 추가하면 살아난다.
  {
    id: 'gourmet',
    label: '미식',
    color: '#c9713c',
    accent: '#f7d3b8',
    description: '접시가 부딪히는 소리, 따뜻한 조명. 저녁이 시작되는 골목.',
    contentTypeIds: [39],
    youtubeIds: [],
    tracks: [
      {
        id: 'gourmet-1',
        title: 'Warm Kitchen',
        recipe: { root: 138, intervals: [0, 4, 9], wave: 'triangle', cutoff: 1300, noise: 0.08, lfoRate: 0.5, lfoDepth: 0.3, detune: 9 },
      },
      {
        id: 'gourmet-2',
        title: 'Corner Table',
        recipe: { root: 164, intervals: [0, 3, 7, 10], wave: 'triangle', cutoff: 1150, noise: 0.06, lfoRate: 0.4, lfoDepth: 0.35, detune: 13 },
      },
      {
        id: 'gourmet-3',
        title: 'Simmer',
        recipe: { root: 123, intervals: [0, 5, 12], wave: 'sine', cutoff: 1250, noise: 0.1, lfoRate: 0.6, lfoDepth: 0.28, detune: 7 },
      },
    ],
  },
  {
    id: 'citywalk',
    label: '도심 산책',
    color: '#5b9e86',
    accent: '#c2ead9',
    description: '쇼윈도를 지나 걷는 리듬. 도시가 배경음으로 깔린다.',
    contentTypeIds: [38],
    youtubeIds: [],
    tracks: [
      {
        id: 'citywalk-1',
        title: 'Shop Window',
        recipe: { root: 156, intervals: [0, 4, 7, 12], wave: 'triangle', cutoff: 1500, noise: 0.09, lfoRate: 1.0, lfoDepth: 0.3, detune: 10 },
      },
      {
        id: 'citywalk-2',
        title: 'Crosswalk',
        recipe: { root: 131, intervals: [0, 7, 14], wave: 'sawtooth', cutoff: 1350, noise: 0.11, lfoRate: 0.8, lfoDepth: 0.25, detune: 12 },
      },
      {
        id: 'citywalk-3',
        title: 'Arcade',
        recipe: { root: 175, intervals: [0, 3, 7, 12], wave: 'triangle', cutoff: 1600, noise: 0.07, lfoRate: 1.1, lfoDepth: 0.32, detune: 8 },
      },
    ],
  },
]

export const DEFAULT_MOOD_ID = 'serene'

export const MOOD_BY_ID = Object.fromEntries(MOODS.map((m) => [m.id, m]))

export function moodById(id) {
  return MOOD_BY_ID[id] ?? MOOD_BY_ID[DEFAULT_MOOD_ID]
}
