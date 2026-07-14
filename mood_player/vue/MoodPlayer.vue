<!--
  MoodPlayer — 위치 기반 무드 플레이어 1×3 위젯 (드롭인 컴포넌트)
  - 위치 소스: location prop(지도가 먹여줌) > mode 'demo' > mode 'gps'(90초 폴링)
  - 무드: LLM(gpt-5-mini) 주 + 규칙 폴백. 음악: <audio> 크로스페이드.
  - 지도 연동: :location 바인딩으로 위치 주입, @mood-changed 로 무드 수신(점 색 등)
-->
<template>
  <div class="mp" :style="{ '--mood': moodColor }">
    <div class="mp-tint" :style="{ backgroundColor: moodColor }"></div>

    <div class="mp-cell mp-mood">
      <div class="mp-cap">현재 무드</div>
      <div class="mp-label">{{ moodLabel }}</div>
      <span v-if="lastRes" class="mp-tag" :class="lastRes.decidedBy">
        {{ lastRes.decidedBy === 'llm' ? 'LLM' : '규칙' }} {{ Math.round((lastRes.confidence || 0) * 100) }}%
      </span>
    </div>

    <div class="mp-cell mp-ctx">
      <div class="mp-now">{{ nowPlaying }}</div>
      <div class="mp-near" v-if="near.length">근처: {{ near[0].title }}<span v-if="near.length > 1"> 외 {{ near.length - 1 }}곳</span></div>
      <div class="mp-reason">{{ analyzing ? '무드 분석 중…(LLM)' : (lastRes ? lastRes.reason : '') }}</div>
    </div>

    <div class="mp-cell mp-ctrl">
      <div class="mp-row">
        <span class="mp-pulse" :class="{ live: playing }"></span>
        <button @click="playing ? pause() : play()">{{ playing ? '⏸' : '▶' }}</button>
        <button @click="next()">⏭</button>
        <input type="range" min="0" max="100" v-model.number="volume" @input="onVol" />
      </div>
      <div class="mp-status">{{ statusText }}</div>
    </div>

    <audio ref="a0" preload="none"></audio>
    <audio ref="a1" preload="none"></audio>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { MOODS, MOOD_AUDIO, DEMO_ROUTE } from './moodConfig.js';
import * as Engine from './moodEngine.js';
import { createCrossfadePlayer } from './crossfadePlayer.js';

const props = defineProps({
  poiData:     { type: Array,  default: () => [] },                 // 제공 JSON POI: {title,lat,lng,typeId/type}
  location:    { type: Object, default: null },                    // {lat,lng,name} — 지도가 먹여주면 우선
  mode:        { type: String, default: 'gps' },                   // 'gps' | 'demo' (location 없을 때)
  apiKey:      { type: String, default: () => (import.meta?.env?.VITE_OPENAI_API_KEY || '') },
  pollMs:      { type: Number, default: 90000 },
  demoRoute:   { type: Array,  default: () => DEMO_ROUTE },
  nearbyCount: { type: Number, default: 5 },
});
const emit = defineEmits(['mood-changed', 'track-changed', 'location-resolved']);

const a0 = ref(null), a1 = ref(null);
let player = null, pollTimer = null, cdTimer = null;

const loc = ref(null), near = ref([]), curMoodId = ref(null), curMusicMood = ref(null);
const lastRes = ref(null), playing = ref(false), analyzing = ref(false);
const demoIdx = ref(0), pollLeft = ref(Math.round(props.pollMs / 1000)), volume = ref(85);

const moodColor  = computed(() => curMoodId.value ? MOODS[curMoodId.value].color : '#6aa9c9');
const moodLabel  = computed(() => curMoodId.value ? MOODS[curMoodId.value].label : '—');
const nowPlaying = computed(() => curMusicMood.value
  ? ('♪ ' + (MOOD_AUDIO[curMusicMood.value]?.label || curMusicMood.value))
  : (playing.value ? '음원 준비 중…' : '▶ 시작'));
const statusText = computed(() => {
  if (props.location) return loc.value ? `위치: ${loc.value.name || '외부'}` : '';
  if (props.mode === 'demo') return loc.value ? `가상 위치: ${loc.value.name}` : '';
  return `다음 폴링 ${pollLeft.value}s`;
});

function setMoodMusic(id) {
  const a = MOOD_AUDIO[id];
  if (!a || !a.urls || !a.urls.length) return;
  curMusicMood.value = id; player && player.crossfade(a.urls[0]);
  emit('track-changed', { moodId: id, url: a.urls[0] });
}
function next() {
  const id = curMusicMood.value; if (!id) return;
  const a = MOOD_AUDIO[id]; if (!a.urls.length) return;
  a._i = ((a._i || 0) + 1) % a.urls.length;
  player && player.crossfade(a.urls[a._i]);
  emit('track-changed', { moodId: id, url: a.urls[a._i] });
}
function applyMood(res) {
  lastRes.value = res; curMoodId.value = res.moodId;
  if (playing.value && res.moodId !== curMusicMood.value) setMoodMusic(res.moodId);
  emit('mood-changed', res);
}
async function updateLocation(l) {
  loc.value = l; near.value = Engine.nearby(props.poiData, l, props.nearbyCount);
  emit('location-resolved', l);
  const hour = Engine.kstHour();
  const key = props.apiKey;
  if (key && navigator.onLine) {
    analyzing.value = true;                         // 현재 무드/음악 유지 · 분석 중
    const res = await Engine.inferMood(near.value, hour, key);  // LLM 주 → 실패 시 규칙
    analyzing.value = false; applyMood(res);
  } else {
    applyMood(Engine.ruleMood(near.value, hour));   // 키 없음/오프라인일 때만 규칙
  }
}

function play() {
  playing.value = true;
  if (curMoodId.value && curMoodId.value !== curMusicMood.value) setMoodMusic(curMoodId.value);
  else if (curMusicMood.value) player && player.resume();
  else if (curMoodId.value) setMoodMusic(curMoodId.value);
}
function pause() { playing.value = false; player && player.pause(); }
function onVol() { player && player.setVolume(volume.value); }

/* 모드 / 타이머 */
function stopTimers() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  if (cdTimer) { clearInterval(cdTimer); cdTimer = null; }
}
function gotoStep(i) {
  const rt = props.demoRoute; if (!rt.length) return;
  demoIdx.value = ((i % rt.length) + rt.length) % rt.length;
  const s = rt[demoIdx.value];
  updateLocation({ lat: s.lat, lng: s.lng, name: s.name, source: 'demo' });
}
function nextStep() { gotoStep(demoIdx.value + 1); }
function startGps() {
  stopTimers();
  const poll = () => {
    pollLeft.value = Math.round(props.pollMs / 1000);
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      p => updateLocation({ lat: p.coords.latitude, lng: p.coords.longitude, name: '내 위치', source: 'gps' }),
      () => {});
  };
  poll();
  pollTimer = setInterval(poll, props.pollMs);
  cdTimer = setInterval(() => { pollLeft.value = Math.max(0, pollLeft.value - 1); }, 1000);
}
// 외부(지도)에서 직접 호출 가능
function setLocation(lat, lng, name) { updateLocation({ lat, lng, name: name || '외부', source: 'external' }); }

watch(() => props.location, (l) => {
  if (l && typeof l.lat === 'number') { stopTimers(); updateLocation({ ...l, source: 'external' }); }
});

onMounted(() => {
  player = createCrossfadePlayer(a0.value, a1.value);
  player.setVolume(volume.value);
  if (props.location && typeof props.location.lat === 'number') updateLocation({ ...props.location, source: 'external' });
  else if (props.mode === 'demo') gotoStep(0);
  else startGps();
});
onBeforeUnmount(() => { stopTimers(); player && player.pause(); });

// 부모에서 ref 로 제어: player.play() / pause() / next() / setLocation() / nextStep()
defineExpose({ play, pause, next, setLocation, gotoStep, nextStep });
</script>

<style scoped>
.mp {
  position: relative; display: grid;
  grid-template-columns: minmax(110px, 140px) minmax(0, 1fr) minmax(150px, 200px);
  border: 1px solid #303444; border-radius: 16px; overflow: hidden;
  background: #1c1f28; color: #e7e9f0; min-height: 120px; width: 100%; max-width: 100%;
  font-family: "Pretendard", "Malgun Gothic", system-ui, sans-serif; line-height: 1.45;
}
.mp-tint { position: absolute; inset: 0; opacity: .20; transition: background-color 1.1s ease; pointer-events: none; }
.mp-cell { position: relative; z-index: 1; min-width: 0; padding: 16px 18px; display: flex; flex-direction: column; justify-content: center; }
.mp-mood { border-right: 1px solid rgba(255,255,255,.06); }
.mp-cap { font-size: 11px; letter-spacing: .05em; color: #9aa0b4; text-transform: uppercase; }
.mp-label { font-size: clamp(24px, 4.5vw, 34px); font-weight: 800; color: var(--mood); line-height: 1.05; margin-top: 2px; }
.mp-tag { display: inline-block; font-size: 10px; border-radius: 5px; padding: 1px 6px; margin-top: 8px; width: fit-content; }
.mp-tag.llm { background: #2a3550; color: #9fc0ff; border: 1px solid #3a4a70; }
.mp-tag.rule { background: #3a2f2a; color: #e0b58f; border: 1px solid #5a453a; }
.mp-now { font-size: 14px; color: var(--mood); font-weight: 600; overflow-wrap: anywhere; }
.mp-near { font-size: 13px; margin-top: 4px; overflow-wrap: anywhere; }
.mp-reason { font-size: 12.5px; color: #9aa0b4; font-style: italic; margin-top: 6px; min-height: 17px; overflow-wrap: anywhere; }
.mp-ctrl { gap: 8px; }
.mp-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.mp-row button { flex: 0 0 auto; font: inherit; color: #e7e9f0; background: #232634; border: 1px solid #303444; border-radius: 9px; padding: 7px 12px; cursor: pointer; }
.mp-row button:hover { border-color: var(--mood); }
.mp-row input[type=range] { flex: 1 1 60px; min-width: 0; accent-color: var(--mood); }
.mp-status { font-size: 12px; color: #9aa0b4; }
.mp-pulse { width: 9px; height: 9px; border-radius: 50%; background: var(--mood); display: inline-block; }
.mp-pulse.live { animation: mp-p 1.5s ease-out infinite; }
@keyframes mp-p { 0% { box-shadow: 0 0 0 0 rgba(255,255,255,.25); } 100% { box-shadow: 0 0 0 11px rgba(255,255,255,0); } }
@media (max-width: 720px) {
  .mp { grid-template-columns: 1fr; }
  .mp-mood { border-right: 0; border-bottom: 1px solid rgba(255,255,255,.06); }
}
audio { display: none; }
</style>
