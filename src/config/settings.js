// 조정 지점 — 기획서 "설정 & 데이터" 항목
export const SETTINGS = {
  nearbyCount: 5, // N: 무드 추론에 쓰는 근접 장소 수
  searchRadiusM: 3000, // 이 반경 안에 장소가 없으면 단계적으로 확대
  radiusExpandSteps: [3000, 8000, 20000, 50000],
  crossfadeIntervalMs: 90_000, // 트랙 전환 주기
  fadeDurationSec: 3, // 크로스페이드 길이 — mood_player(player-audio.js/crossfadePlayer.js/demo.html)는 전부 3초 고정
  trackStartOffsetSec: 20, // 트랙 시작 지점 — 느린 인트로를 건너뛰고 20초 지점부터 재생
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

// 발표용 가상 산책 — 이촌한강공원 → 북악산 팔각정 직선을 100초 동안 걷는 것처럼 재생
export const VIRTUAL_WALK = {
  start: { name: '이촌한강공원', lat: 37.518, lng: 126.973 },
  end: { name: '북악 팔각정', lat: 37.6027, lng: 126.9689 },
  durationMs: 100_000,
  checkpointMs: 20_000, // 이 주기로만 location(=무드 추론 입력)이 갱신됨
}
