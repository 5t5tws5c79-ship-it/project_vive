import { ref } from 'vue'
import { FALLBACK_LOCATION, GEOLOCATION_OPTIONS } from '../config/settings'

// F1. 현재 위치 획득 — 권한 거부/타임아웃/비보안 컨텍스트는 폴백 위치로.
// source를 함께 노출해 "왜 이 무드가 나왔는지"를 화면에서 설명할 수 있게 한다.
export function useGeolocation() {
  const location = ref(null) // { lat, lng, source: 'gps'|'fallback'|'manual', label }
  const status = ref('idle') // 'idle' | 'locating' | 'ready' | 'error'
  const error = ref('')

  function useFallback(reason) {
    error.value = reason
    location.value = { ...FALLBACK_LOCATION, source: 'fallback' }
    status.value = 'ready'
  }

  function locate() {
    status.value = 'locating'
    error.value = ''

    if (!navigator.geolocation) {
      useFallback('이 브라우저는 위치 기능을 지원하지 않습니다.')
      return
    }
    if (!window.isSecureContext) {
      useFallback('비보안 컨텍스트(HTTP)에서는 위치를 가져올 수 없습니다.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        location.value = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          source: 'gps',
          label: '현재 위치',
        }
        status.value = 'ready'
      },
      (err) => {
        const reasons = {
          1: '위치 권한이 거부되었습니다.',
          2: '위치 정보를 가져올 수 없습니다.',
          3: '위치 조회가 시간 초과되었습니다.',
        }
        useFallback(reasons[err.code] ?? '위치 조회에 실패했습니다.')
      },
      GEOLOCATION_OPTIONS,
    )
  }

  function setManual(lat, lng, label = '직접 지정한 위치') {
    location.value = { lat, lng, source: 'manual', label }
    error.value = ''
    status.value = 'ready'
  }

  return { location, status, error, locate, setManual }
}

export const LOCATION_SOURCE_LABEL = {
  gps: 'GPS',
  fallback: '기본 위치',
  manual: '직접 지정',
}
