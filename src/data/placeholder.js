// 【플레이스홀더】 화면을 채우기 위한 더미 데이터.
// 실제로는 커뮤니티 글 = localStorage, 추천 곡 = 추천 로직/API 결과로 대체된다.

// 커뮤니티 — 다른 유저가 장소별로 고른 곡
//
// coords : 실제 좌표 (카카오맵을 붙이면 이 값으로 마커를 찍는다)
// pin    : 플레이스홀더 지도 안에서의 상대 위치 (%) — 진짜 지도가 붙으면 필요 없어진다
export const CURATIONS = [
  {
    id: 'c1',
    place: '경복궁',
    placeType: '관광지',
    track: '유희열 - 여름날',
    artist: '유희열',
    nickname: '익명의 산책자',
    comment: '돌담 따라 걷다 보면 이 곡이 저절로 떠올라요. 해질 무렵에 들으면 더 좋습니다.',
    moodId: 'serene',
    likes: 42,
    replies: 7,
    createdAt: '2026-07-12',
    coords: { lat: 37.5796, lng: 126.977 },
    pin: { x: 46, y: 24 },
  },
  {
    id: 'c2',
    place: '홍대 걷고싶은거리',
    placeType: '쇼핑',
    track: 'HYUKOH - 위잉위잉',
    artist: 'HYUKOH',
    nickname: '밤산책',
    comment: '사람 많은 밤거리랑 진짜 잘 맞음. 이어폰 끼고 걸으면 뮤비 주인공 된 기분.',
    moodId: 'citywalk',
    likes: 128,
    replies: 23,
    createdAt: '2026-07-11',
    coords: { lat: 37.5563, lng: 126.9236 },
    pin: { x: 19, y: 52 },
  },
  {
    id: 'c3',
    place: '서울시립미술관',
    placeType: '문화시설',
    track: 'Nujabes - Aruarian Dance',
    artist: 'Nujabes',
    nickname: '조용한관람객',
    comment: '전시 보면서 듣기 좋아요. 발소리랑 섞이는 느낌이 있음.',
    moodId: 'contemplative',
    likes: 89,
    replies: 12,
    createdAt: '2026-07-10',
    coords: { lat: 37.564, lng: 126.9738 },
    pin: { x: 44, y: 58 },
  },
  {
    id: 'c4',
    place: '한강 여의도공원',
    placeType: '레포츠',
    track: '잔나비 - 뜨거운 여름밤은 가고 남은 건 볼품없지만',
    artist: '잔나비',
    nickname: '러닝하는사람',
    comment: '해 지는 시간에 러닝하면서 들으면 진짜 미쳤습니다.',
    moodId: 'vital',
    likes: 201,
    replies: 34,
    createdAt: '2026-07-09',
    coords: { lat: 37.5265, lng: 126.9243 },
    pin: { x: 22, y: 80 },
  },
  {
    id: 'c5',
    place: '광장시장',
    placeType: '음식점',
    track: '장기하와 얼굴들 - 그 상태로 있어줘',
    artist: '장기하와 얼굴들',
    nickname: '먹보',
    comment: '시끌시끌한 시장 분위기랑 묘하게 어울려요.',
    moodId: 'gourmet',
    likes: 56,
    replies: 9,
    createdAt: '2026-07-08',
    coords: { lat: 37.5701, lng: 126.9997 },
    pin: { x: 72, y: 42 },
  },
  {
    id: 'c6',
    place: '롯데월드타워',
    placeType: '관광지',
    track: '검정치마 - Antifreeze',
    artist: '검정치마',
    nickname: '야경러',
    comment: '전망대에서 야경 보면서 들으면 시간이 멈춥니다.',
    moodId: 'serene',
    likes: 174,
    replies: 19,
    createdAt: '2026-07-07',
    coords: { lat: 37.5126, lng: 127.1025 },
    pin: { x: 88, y: 74 },
  },
]

export function curationById(id) {
  return CURATIONS.find((c) => c.id === id) ?? null
}

// 무드별 곡 리스트 — 유저들이 그 무드로 추천한 곡들.
// 무드 카드에서 "이 무드의 다른 곡" 을 눌렀을 때 뜬다.
export const MOOD_TRACKS = {
  serene: [
    { id: 'm1', title: '여름날', artist: '유희열', place: '경복궁', likes: 42 },
    { id: 'm2', title: 'Antifreeze', artist: '검정치마', place: '롯데월드타워', likes: 174 },
    { id: 'm3', title: '이 노래', artist: '김광석', place: '남산 산책로', likes: 63 },
  ],
  contemplative: [
    { id: 'm4', title: 'Aruarian Dance', artist: 'Nujabes', place: '서울시립미술관', likes: 89 },
    { id: 'm5', title: 'Gymnopédie No.1', artist: 'Erik Satie', place: '국립현대미술관', likes: 51 },
  ],
  vital: [
    {
      id: 'm6',
      title: '뜨거운 여름밤은 가고 남은 건 볼품없지만',
      artist: '잔나비',
      place: '한강 여의도공원',
      likes: 201,
    },
    { id: 'm7', title: 'Beautiful', artist: 'Crush', place: '올림픽공원', likes: 77 },
  ],
  festive: [
    { id: 'm8', title: '한 페이지가 될 수 있게', artist: 'DAY6', place: '서울광장', likes: 143 },
  ],
  gourmet: [
    { id: 'm9', title: '그 상태로 있어줘', artist: '장기하와 얼굴들', place: '광장시장', likes: 56 },
  ],
  citywalk: [
    { id: 'm10', title: '위잉위잉', artist: 'HYUKOH', place: '홍대 걷고싶은거리', likes: 128 },
    { id: 'm11', title: '밤편지', artist: '아이유', place: '명동거리', likes: 95 },
  ],
}

export function moodTracks(moodId) {
  return MOOD_TRACKS[moodId] ?? []
}

// 챗봇 — 대화 UI 모양만 보여주는 더미
export const CHAT_SAMPLE = [
  { role: 'bot', text: '안녕하세요! 지금 계신 곳 근처의 장소나 어울리는 곡을 물어보세요.' },
  { role: 'user', text: '근처에 조용한 데 있어?' },
  { role: 'bot', text: '(챗봇 응답이 여기 표시됩니다 — 아직 연동 전입니다)' },
]
