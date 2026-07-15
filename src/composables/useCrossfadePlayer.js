import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { SETTINGS } from '../config/settings'
import { moodById } from '../config/moods'
import { AmbientEngine, YouTubeEngine } from '../lib/engines'

// F5. 크로스페이드 플레이어 — 두 덱(A/B)을 오버랩시키며 일정 주기로 트랙 전환.
// 브라우저 자동재생 정책 때문에 첫 재생은 사용자 제스처(unlock)로만 시작된다.
export function useCrossfadePlayer(moodId) {
  const isUnlocked = ref(false)
  const isPlaying = ref(false)
  const volume = ref(0.8)
  const source = ref(SETTINGS.audioSource) // 'ambient' | 'youtube'
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

  const playlist = computed(() => {
    const mood = moodById(moodId.value)
    if (source.value === 'youtube') {
      return mood.youtubeIds.map((videoId, i) => ({
        id: `${mood.id}-yt-${i}`,
        title: `${mood.label} #${i + 1}`,
        videoId,
      }))
    }
    return mood.tracks
  })

  const progress = computed(() => Math.min(1, elapsedMs.value / intervalMs.value))
  const remainingSec = computed(() =>
    Math.max(0, Math.ceil((intervalMs.value - elapsedMs.value) / 1000)),
  )

  function createEngine() {
    return source.value === 'youtube'
      ? new YouTubeEngine({ onError: (msg) => (error.value = msg) })
      : new AmbientEngine()
  }

  // 다음 트랙을 비활성 덱에 올리고 두 덱의 게인을 서로 반대 방향으로 램프한다.
  function crossfadeTo(track) {
    const nextDeck = 1 - activeDeck
    const fade = SETTINGS.fadeDurationSec

    engine.loadOnDeck(nextDeck, track)
    engine.fadeDeck(nextDeck, 1, fade)
    engine.fadeDeck(activeDeck, 0, fade)

    const previousDeck = activeDeck
    activeDeck = nextDeck
    currentTrack.value = track
    elapsedMs.value = 0
    isCrossfading.value = true

    setTimeout(() => {
      engine.stopDeck(previousDeck)
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
      error.value =
        source.value === 'youtube'
          ? '이 무드에 유튜브 영상 ID가 설정되지 않았습니다. config/moods.js의 youtubeIds를 채워주세요.'
          : '재생할 트랙이 없습니다.'
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
      await engine.resume()
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
    engine?.dispose()
    engine = null
    isUnlocked.value = false
    isPlaying.value = false
    currentTrack.value = null
    elapsedMs.value = 0
  }

  watch(volume, (v) => engine?.setMasterVolume(v))

  // 무드가 바뀌면 새 무드의 첫 트랙으로 곧바로 크로스페이드
  watch(moodId, () => {
    if (!isUnlocked.value || playlist.value.length === 0) return
    trackIndex = 0
    crossfadeTo(playlist.value[0])
  })

  // 소스 모드를 바꾸면 엔진을 통째로 교체 — 재생 중이었다면 새 엔진으로 이어서 재생
  watch(source, async () => {
    const wasPlaying = isUnlocked.value
    teardown()
    if (wasPlaying) await start()
  })

  onBeforeUnmount(teardown)

  return {
    isUnlocked,
    isPlaying,
    isCrossfading,
    volume,
    source,
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