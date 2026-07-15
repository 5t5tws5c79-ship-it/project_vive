# MoodPlayer — 위치 기반 무드 플레이어 (Vue 3 드롭인 컴포넌트)

현재 위치 근처 장소를 읽어 무드를 추론하고(LLM 주 + 규칙 폴백), 무드에 맞는 음악을 크로스페이드로 재생하는 1×3 위젯.

## 파일 (이 폴더 통째로 `src/components/MoodPlayer/` 에 복사)

| 파일 | 역할 |
|------|------|
| `MoodPlayer.vue` | 컴포넌트(1×3 위젯) |
| `moodEngine.js` | 순수 로직: 근접 계산 · 무드추론(LLM+규칙) |
| `crossfadePlayer.js` | `<audio>` 2채널 크로스페이드 |
| `moodConfig.js` | 무드·색·**음원 URL**·발표 경로 (여기만 손보면 됨) |

의존성: Vue 3 뿐. (지도·차트 라이브러리 불필요)

## 최소 사용법

```vue
<script setup>
import MoodPlayer from '@/components/MoodPlayer/MoodPlayer.vue';
import pois from '@/data/서울_poi.json';   // 제공 JSON을 {title,lat,lng,typeId} 형태로
</script>

<template>
  <!-- 자립형: 스스로 GPS 90초 폴링 -->
  <MoodPlayer :poi-data="pois" mode="gps" />
</template>
```

> POI 항목은 `{ title, lat, lng, typeId }` 필요. TourAPI 원본은 `mapx=경도, mapy=위도`(문자열)라 `lat=Number(mapy), lng=Number(mapx), typeId=String(contenttypeid)` 로 매핑해서 넘기세요.

## Props

| prop | 타입 | 기본 | 설명 |
|------|------|------|------|
| `poiData` | Array | `[]` | POI 목록 `{title,lat,lng,typeId}` |
| `location` | Object\|null | `null` | `{lat,lng,name}` — **주면 이걸로 반응**(지도 연동용) |
| `mode` | String | `'gps'` | `location` 없을 때: `'gps'`(90초 폴링) / `'demo'`(발표 경로) |
| `apiKey` | String | `VITE_OPENAI_API_KEY` | OpenAI 키. 비면 규칙 폴백만 |
| `pollMs` | Number | `90000` | GPS 재폴링 간격 |
| `demoRoute` | Array | 서울 5정거장 | 발표 가상 산책 좌표 |
| `nearbyCount` | Number | `5` | 근접 상위 N |

## Events

| event | payload | 시점 |
|-------|---------|------|
| `mood-changed` | `{moodId,label?,reason,decidedBy,confidence}` | 무드 확정(규칙 즉시 → LLM 정제) |
| `track-changed` | `{moodId,url}` | 곡 전환 |
| `location-resolved` | `{lat,lng,name,source}` | 위치 확정 |

## 노출 메서드 (`ref` 로 부모에서 호출)

`play()` · `pause()` · `next()` · `setLocation(lat,lng,name)` · `gotoStep(i)` · `nextStep()`

## 지도팀 연동 (핵심)

```vue
<template>
  <TeamMap @move="onDotMove" :dot-color="moodColor" />
  <MoodPlayer ref="mp" :poi-data="pois" :location="mapLoc" @mood-changed="onMood" />
</template>
<script setup>
import { ref } from 'vue';
const mapLoc = ref(null), moodColor = ref('#6aa9c9');
function onDotMove({ lat, lng, name }) { mapLoc.value = { lat, lng, name }; } // 지도가 점 옮기면 플레이어가 반응
function onMood(res) { moodColor.value = colorOf(res.moodId); }               // 무드로 지도 점 색 갱신
</script>
```

- **지도 → 플레이어**: 점이 이동하면 `:location` 갱신(또는 `mp.value.setLocation(...)`).
- **플레이어 → 지도**: `@mood-changed` 로 무드 받아 점/오버레이 색 반영.

## 배포 (Netlify 정적 SPA — 의뢰서 아키텍처 그대로)

1. **키**: `.env` 에 `VITE_OPENAI_API_KEY=...` (Netlify 대시보드 env 에도 등록). 사용량 제한 키 사용.
   - 브라우저 직접 호출이라 빌드에 노출됨 — 의뢰서가 인정한 구조적 한계(사용량 제한으로 관리).
2. **음악**: `moodConfig.js` 의 `MOOD_AUDIO` URL 을 **Cloudflare R2**(또는 배포물 `public/`) 주소로 교체. 기본값은 로열티프리(SoundHelix).
3. 백엔드 없음 · 브라우저에서 OpenAI/오디오 직접 로드 → 정적 배포로 동작.

## 첫 재생(자동재생 정책)

브라우저 정책상 소리는 **사용자 제스처 후** 시작됨. 부모에서 버튼으로 `mp.value.play()` 를 한 번 호출하거나, 앱의 첫 클릭 시 `play()` 를 연결하세요.

## 검증

로컬에 Node 없이도 `../player.html`(동일 로직 바닐라판)로 동작을 확인할 수 있습니다. 이 Vue 컴포넌트는 그 검증된 로직을 그대로 모듈화한 것.

## 데이터 출처

장소: 한국관광공사 Tour API(TourAPI 4.0) · 공공누리 제3유형(출처표시+변경금지). 앱에 출처 표기 필요.
