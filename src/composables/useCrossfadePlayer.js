import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { SETTINGS } from '../config/settings'
import { moodById } from '../config/moods'
import { AmbientEngine } from '../lib/engines'

// F5. 크로스페이드 플레이어 — 두 덱(A/B)을 오버랩시키며 일정 주기로 트랙 전환.
// 브라우저 자동재생 정책 때문에 첫 재생은 사용자 제스처(unlock)로만 시작된다.
export function useCrossfadePlayer(moodId) {
  const isUnlocked = ref(false)
  const isPlaying = ref(false)
  const volume = ref(0.8)
  const intervalMs = ref(SETTINGS.crossfadeIntervalMs)
  const error = ref('')

  const currentTrack = ref(null)
  const isCrossfading = ref(false)
  const elapsedMs = ref(0)
  const isRepeat = ref(false) // 반복 켜짐 시 주기마다 같은 트랙을 다시 재생

  let engine = null
  let activeDeck = 0
  let trackIndex = 0
  let rafId = null
  let lastTick = 0
  let playingMoodId = null // 실제로 재생 중인 트랙의 무드 — moodId(추론/선택된 무드)와 분리 추적
  let crossfadeFlagTimer = null // isCrossfading 코스메틱 플래그 전용 타이머

  const playlist = computed(() => moodById(moodId.value).tracks)

  const progress = computed(() => Math.min(1, elapsedMs.value / intervalMs.value))
  const remainingSec = computed(() =>
    Math.max(0, Math.ceil((intervalMs.value - elapsedMs.value) / 1000)),
  )

  function createEngine() {
    return new AmbientEngine()
  }

  // 다음 트랙을 비활성 덱에 올리고, 하나의 타이머로 두 덱을 동시에 반대 방향으로 램프한다
  // (engine.crossfade — mood_player 처럼 단일 타이머라 두 덱이 항상 정확히 대칭으로 움직인다).
  // 이전 덱을 멈추는 책임도 그 안에서 처리되어(정지가 이 크로스페이드 자신의 타이머
  // 생명주기에 묶임), 이 덱이 다음 크로스페이드에 재사용될 때 자동으로 취소되므로
  // 한창 페이드인 중인 새 트랙을 오래된 정지 예약이 뒤늦게 끊어버리는 레이스도 생기지 않는다.
  function crossfadeTo(track) {
    const nextDeck = 1 - activeDeck
    const fade = SETTINGS.fadeDurationSec

    engine.loadOnDeck(nextDeck, track)
    engine.crossfade(activeDeck, nextDeck, fade)

    activeDeck = nextDeck
    currentTrack.value = track
    playingMoodId = moodId.value
    elapsedMs.value = 0
    isCrossfading.value = true

    clearTimeout(crossfadeFlagTimer)
    crossfadeFlagTimer = setTimeout(() => {
      isCrossfading.value = false
    }, fade * 1000)
  }

  function advance(force = false) {
    if (playlist.value.length === 0) return
    if (force || !isRepeat.value) {
      trackIndex = (trackIndex + 1) % playlist.value.length // 리스트 끝나면 순환
    }
    crossfadeTo(playlist.value[trackIndex])
  }

  function retreat() {
    if (playlist.value.length === 0) return
    trackIndex = (trackIndex - 1 + playlist.value.length) % playlist.value.length
    crossfadeTo(playlist.value[trackIndex])
  }

  function tick(now) {
    if (isPlaying.value) {
      elapsedMs.value += now - lastTick
      if (elapsedMs.value >= intervalMs.value) advance()
    }
    lastTick = now
    rafId = requestAnimationFrame(tick)
  }

  async function start() {
    error.value = ''
    if (playlist.value.length === 0) {
      error.value = '재생할 트랙이 없습니다.'
      return
    }

    engine = createEngine()
    try {
      await engine.init()
    } catch (err) {
      error.value = err.message
      engine = null
      return
    }

    engine.setMasterVolume(volume.value)
    trackIndex = 0
    activeDeck = 1 // crossfadeTo가 0번 덱으로 페이드인하도록
    crossfadeTo(playlist.value[0])

    isUnlocked.value = true
    isPlaying.value = true
    lastTick = performance.now()
    rafId = requestAnimationFrame(tick)
  }

  async function toggle() {
    if (!isUnlocked.value) {
      await start()
      return
    }
    if (isPlaying.value) {
      await engine.suspend()
      isPlaying.value = false
    } else {
      if (moodId.value !== playingMoodId && playlist.value.length > 0) {
        // 일시정지 사이 무드가 바뀌었으면 새 무드 첫 곡으로, 아니면 하던 곡을 이어재생
        trackIndex = 0
        crossfadeTo(playlist.value[0])
      } else {
        await engine.resume()
      }
      lastTick = performance.now()
      isPlaying.value = true
    }
  }

  function next() {
    if (!isUnlocked.value) return
    advance(true) // 수동 다음은 반복 모드여도 항상 다음 곡으로
  }

  function prev() {
    if (!isUnlocked.value) return
    retreat()
  }

  function toggleRepeat() {
    isRepeat.value = !isRepeat.value
  }

  function teardown() {
    cancelAnimationFrame(rafId)
    rafId = null
    clearTimeout(crossfadeFlagTimer)
    crossfadeFlagTimer = null
    engine?.dispose()
    engine = null
    isUnlocked.value = false
    isPlaying.value = false
    currentTrack.value = null
    elapsedMs.value = 0
  }

  watch(volume, (v) => engine?.setMasterVolume(v))

  // 무드가 바뀌면 새 무드의 첫 트랙으로 곧바로 크로스페이드 — 단, 재생 중이고 실제로
  // 재생 중이던 무드와 다를 때만. 일시정지 중에는 아무 것도 하지 않고(오디오를 깨우지 않음)
  // 재개 시점(toggle 참고)에 다시 판단한다. trackIndex 도 크로스페이드가 실제로 일어날 때만
  // 리셋해, 일시정지 중 무드가 왔다갔다 해도 실제 재생 트랙과 어긋나지 않게 한다.
  watch(moodId, (id) => {
    if (!isUnlocked.value || playlist.value.length === 0) return
    if (!isPlaying.value || id === playingMoodId) return
    trackIndex = 0
    crossfadeTo(playlist.value[0])
  })

  onBeforeUnmount(teardown)

  return {
    isUnlocked,
    isPlaying,
    isCrossfading,
    volume,
    intervalMs,
    error,
    currentTrack,
    playlist,
    progress,
    remainingSec,
    toggle,
    next,
    prev,
    isRepeat,
    toggleRepeat,
  }
}