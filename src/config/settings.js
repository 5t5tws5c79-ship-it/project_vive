// 조정 지점 — 기획서 "설정 & 데이터" 항목
export const SETTINGS = {
  nearbyCount: 5, // N: 무드 추론에 쓰는 근접 장소 수
  searchRadiusM: 3000, // 이 반경 안에 장소가 없으면 단계적으로 확대
  radiusExpandSteps: [3000, 8000, 20000, 50000],
  crossfadeIntervalMs: 90_000, // 트랙 전환 주기
  fadeDurationSec: 3, // 크로스페이드 길이 — mood_player(player-audio.js/crossfadePlayer.js/demo.html)는 전부 3초 고정
}

// 위치 권한 거부·타임아웃·비보안 컨텍스트 폴백 (서울시청)
export const FALLBACK_LOCATION = {
  lat: 37.5663,
  lng: 126.9779,
  label: '서울시청',
}

export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 8000,
  maximumAge: 60_000,
}

// 발표용 가상 산책 경로 (mood_player/vue/moodConfig.js 이식) — 서울 5개 지점을 순서대로 밟는다
export const DEMO_ROUTE = [
  { name: '은평·진관사길', lat: 37.6384, lng: 126.9463 },
  { name: '성수·서울숲', lat: 37.5445, lng: 127.0557 },
  { name: '인사동·대학로', lat: 37.5805, lng: 127.0024 },
  { name: '압구정·강남', lat: 37.527, lng: 127.0276 },
  { name: '남산·한강길', lat: 37.5538, lng: 127.0166 },
]
