import { SETTINGS } from '../config/settings'

// 실제 오디오 엔진 — <audio> 2덱(A/B) 크로스페이드.
// useCrossfadePlayer 가 기대하는 덱 인터페이스를 구현한다:
//   init · loadOnDeck(deck,track) · fadeDeck(deck,target,sec) · crossfade(from,to,sec)
//   · stopDeck(deck) · setMasterVolume(v) · suspend · resume · dispose
// mood_player/player-audio.js 의 볼륨 램프 로직을 덱 단위로 이식.
// crossfade()는 mood_player처럼 단일 타이머로 두 덱을 동시에 램프해 대칭을 보장한다
// (fadeDeck은 인터페이스 호환을 위해 남겨두지만 crossfadeTo에서는 더 이상 쓰지 않는다).
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
    // 느린 인트로를 건너뛰고 곡의 본론부터 들리도록 항상 offset 지점에서 시작
    // (20초 체크포인트마다 크로스페이드되는 데모에서 인트로만 듣다 끝나는 걸 방지)
    if (d.el.src !== track.url) {
      d.el.src = track.url
    }
    try { d.el.currentTime = SETTINGS.trackStartOffsetSec } catch (e) {}
    d.gain = 0
    d.el.volume = 0
    const p = d.el.play()
    if (p && p.catch) p.catch(() => {})
  }

  // target===0 로 도달하면 그 덱 스스로 stopDeck 을 호출한다 — 정지가 이 덱 자신의
  // 타이머 생명주기에 묶여, loadOnDeck/fadeDeck 가 이 덱을 재사용할 때 _clear() 로
  // 항상 자동 취소된다(외부에서 별도 setTimeout 으로 정지를 예약하면 그 덱이 먼저
  // 재사용됐을 때 새 페이드인을 뒤늦게 멈춰버리는 레이스가 생긴다).
  fadeDeck(deck, target, sec) {
    const d = this.decks[deck]
    this._clear(d)
    const from = d.gain
    const dur = Math.max(0, sec) * 1000
    if (dur === 0) {
      d.gain = target
      d.el.volume = this._clamp(target * this.master)
      if (target === 0) this.stopDeck(deck)
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
        if (target === 0) this.stopDeck(deck)
      }
    }, dur / steps)
  }

  // 두 덱을 하나의 타이머로 동시에 램프한다 — mood_player/player-audio.js 의 crossfade()
  // 와 동일하게, 같은 s/steps 비율(r)로 fromDeck·toDeck 게인을 (1-r, r)로 계산해 항상
  // 정확히 반대로 움직이게 한다. fadeDeck 을 두 번 따로 호출하면(덱마다 독립된
  // setInterval) 두 타이머가 브라우저 스케줄링 오차로 서로 드리프트해 청감상
  // 비대칭 크로스페이드가 될 수 있어, 크로스페이드 전용으로 별도 제공한다.
  crossfade(fromDeck, toDeck, sec) {
    const from = this.decks[fromDeck]
    const to = this.decks[toDeck]
    this._clear(from)
    this._clear(to)
    const dur = Math.max(0, sec) * 1000

    if (dur === 0) {
      from.gain = 0
      from.el.volume = 0
      to.gain = 1
      to.el.volume = this._clamp(this.master)
      this.stopDeck(fromDeck)
      return
    }

    const steps = 24
    let s = 0
    const timer = setInterval(() => {
      s++
      const r = s / steps
      to.gain = r
      from.gain = 1 - r
      to.el.volume = this._clamp(to.gain * this.master)
      from.el.volume = this._clamp(from.gain * this.master)
      if (s >= steps) {
        clearInterval(timer)
        from.timer = null
        to.timer = null
        to.gain = 1
        from.gain = 0
        this.stopDeck(fromDeck)
      }
    }, dur / steps)
    from.timer = timer
    to.timer = timer
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
