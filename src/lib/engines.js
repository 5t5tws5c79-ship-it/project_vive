export class AmbientEngine {
  async init() { return; }
  loadOnDeck(deck, track) { this._deck = { deck, track }; }
  fadeDeck(deck, target, _sec) { /* no-op */ }
  stopDeck(_deck) { /* no-op */ }
  setMasterVolume(_v) { /* no-op */ }
  async suspend() { /* no-op */ }
  async resume() { /* no-op */ }
  dispose() { /* no-op */ }
}

export class YouTubeEngine {
  constructor(opts = {}) { this.opts = opts; }
  async init() { /* optionally prepare iframe API */ }
  loadOnDeck(deck, track) { this._deck = { deck, track }; }
  fadeDeck(deck, target, _sec) { /* no-op */ }
  stopDeck(_deck) { /* no-op */ }
  setMasterVolume(_v) { /* no-op */ }
  async suspend() { /* no-op */ }
  async resume() { /* no-op */ }
  dispose() { /* no-op */ }
}