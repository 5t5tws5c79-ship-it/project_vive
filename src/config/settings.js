// 조정 지점 — 기획서 "설정 & 데이터" 항목
export const SETTINGS = {
  nearbyCount: 5, // N: 무드 추론에 쓰는 근접 장소 수
  searchRadiusM: 3000, // 이 반경 안에 장소가 없으면 단계적으로 확대
  radiusExpandSteps: [3000, 8000, 20000, 50000],
  crossfadeIntervalMs: 90_000, // 트랙 전환 주기
  fadeDurationSec: 6, // 크로스페이드 길이
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
