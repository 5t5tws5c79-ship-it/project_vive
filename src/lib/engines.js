// 실제 오디오 엔진 — <audio> 2덱(A/B) 크로스페이드.
// useCrossfadePlayer 가 기대하는 덱 인터페이스를 구현한다:
//   init · loadOnDeck(deck,track) · fadeDeck(deck,target,sec) · stopDeck(deck)
//   · setMasterVolume(v) · suspend · resume · dispose
// mood_player/crossfadePlayer.js 의 볼륨 램프 로직을 덱 단위로 이식.
// 트랙 shape = { id, title, url }. element.volume 방식이라 CORS 불필요.
export class AmbientEngine {
  constructor() {
    this.master = 1
    this.decks = [this._makeDeck(), this._makeDeck()]
  }

  _makeDeck() {
    const el = new Audio()
    el.loop = true // 단일 트랙 무드가 중간에 끊기지 않도록
    el.preload = 'auto'
    el.volume = 0
    return { el, gain: 0, timer: null }
  }

  _clear(d) {
    if (d.timer) {
      clearInterval(d.timer)
      d.timer = null
    }
  }

  // 최초 play() 가 사용자 제스처 컨텍스트를 유지하도록 아무 것도 await 하지 않는다.
  init() {}

  loadOnDeck(deck, track) {
    const d = this.decks[deck]
    this._clear(d)
    if (d.el.src !== track.url) {
      d.el.src = track.url // 새 src 는 자동으로 0초부터 시작
    } else {
      try { d.el.currentTime = 0 } catch (e) {}
    }
    d.gain = 0
    d.el.volume = 0
    const p = d.el.play()
    if (p && p.catch) p.catch(() => {})
  }

  fadeDeck(deck, target, sec) {
    const d = this.decks[deck]
    this._clear(d)
    const from = d.gain
    const dur = Math.max(0, sec) * 1000
    if (dur === 0) {
      d.gain = target
      d.el.volume = this._clamp(target * this.master)
      return
    }
    const steps = 24
    let s = 0
    d.timer = setInterval(() => {
      s++
      const r = s / steps
      d.gain = from + (target - from) * r
      d.el.volume = this._clamp(d.gain * this.master)
      if (s >= steps) {
        this._clear(d)
        d.gain = target
      }
    }, dur / steps)
  }

  stopDeck(deck) {
    const d = this.decks[deck]
    this._clear(d)
    d.gain = 0
    try { d.el.pause() } catch (e) {}
    d.el.volume = 0
  }

  setMasterVolume(v) {
    this.master = this._clamp(v)
    for (const d of this.decks) d.el.volume = this._clamp(d.gain * this.master)
  }

  // 재생 멈춤: 양쪽 덱 정지(게인/현재 트랙은 보존해 resume 이 이어가게)
  suspend() {
    for (const d of this.decks) {
      try { d.el.pause() } catch (e) {}
    }
  }

  // 재개: 소리가 나던(gain>0) 덱만 다시 재생
  resume() {
    for (const d of this.decks) {
      if (d.gain > 0) {
        const p = d.el.play()
        if (p && p.catch) p.catch(() => {})
      }
    }
  }

  dispose() {
    for (const d of this.decks) {
      this._clear(d)
      try { d.el.pause() } catch (e) {}
      d.el.removeAttribute('src')
      try { d.el.load() } catch (e) {}
    }
  }

  _clamp(v) {
    return Math.max(0, Math.min(1, v))
  }
}
