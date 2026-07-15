import { ref } from 'vue'
import { FALLBACK_LOCATION, GEOLOCATION_OPTIONS, VIRTUAL_WALK } from '../config/settings'

// F1. 현재 위치 획득 — 권한 거부/타임아웃/비보안 컨텍스트는 폴백 위치로.
// source를 함께 노출해 "왜 이 무드가 나왔는지"를 화면에서 설명할 수 있게 한다.
export function useGeolocation() {
  const location = ref(null) // { lat, lng, source: 'gps'|'fallback'|'manual'|'demo', label }
  const status = ref('idle') // 'idle' | 'locating' | 'ready' | 'error'
  const error = ref('')
  const mode = ref('gps') // 'gps' | 'demo' — 발표용 가상 산책 모드

  // 가상 산책 — 화면에 부드럽게 보이는 위치(walkPosition)와 무드 추론에 실제로
  // 쓰이는 위치(location)를 분리한다. location이 매 프레임 바뀌면 근처 장소 조합이
  // 계속 달라져 체크포인트마다 gpt-5-mini 호출이 쏟아지므로, location은 20초
  // 체크포인트에서만 스냅해서 갱신한다.
  const walkPosition = ref(null) // { lat, lng } — 걷는 사람 아이콘 표시 전용
  const walkElapsedMs = ref(0)
  const isWalking = ref(false)
  let walkRafId = null

  function stopVirtualWalk() {
    isWalking.value = false
    if (walkRafId) cancelAnimationFrame(walkRafId)
    walkRafId = null
  }

  function startVirtualWalk() {
    stopVirtualWalk() // 이미 진행 중이면 정리하고 처음부터 다시
    mode.value = 'demo'
    isWalking.value = true
    error.value = ''
    status.value = 'ready'

    const { start, end, durationMs, checkpointMs } = VIRTUAL_WALK
    const startedAt = performance.now()
    let lastCheckpoint = -1

    function tick(now) {
      const elapsed = Math.min(now - startedAt, durationMs)
      const t = elapsed / durationMs
      walkPosition.value = {
        lat: start.lat + (end.lat - start.lat) * t,
        lng: start.lng + (end.lng - start.lng) * t,
      }
      walkElapsedMs.value = elapsed

      const checkpoint = Math.floor(elapsed / checkpointMs)
      if (checkpoint !== lastCheckpoint) {
        lastCheckpoint = checkpoint
        const ct = (checkpoint * checkpointMs) / durationMs
        location.value = {
          lat: start.lat + (end.lat - start.lat) * ct,
          lng: start.lng + (end.lng - start.lng) * ct,
          source: 'demo',
          label: `${start.name} → ${end.name}`,
        }
      }

      if (elapsed < durationMs) {
        walkRafId = requestAnimationFrame(tick)
      } else {
        isWalking.value = false
        walkRafId = null
      }
    }

    walkRafId = requestAnimationFrame(tick)
  }

  function useFallback(reason) {
    error.value = reason
    location.value = { ...FALLBACK_LOCATION, source: 'fallback' }
    status.value = 'ready'
  }

  function locate() {
    stopVirtualWalk() // 진행 중이던 가상 산책과 GPS 갱신이 충돌하지 않게 정리
    mode.value = 'gps' // 실제 GPS로 돌아오면 데모 모드는 해제
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

  return {
    location,
    status,
    error,
    locate,
    setManual,
    mode,
    walkPosition,
    walkElapsedMs,
    isWalking,
    startVirtualWalk,
    stopVirtualWalk,
  }
}

export const LOCATION_SOURCE_LABEL = {
  gps: 'GPS',
  fallback: '기본 위치',
  manual: '직접 지정',
  demo: '가상 산책',
}
