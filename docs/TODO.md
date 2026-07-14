# 내일 할 일 & 실행법

## ▶ 실행 — 둘 중 하나

### A. 실제 Vue3 앱 (← 제출·발표 형태, serve.ps1 불필요)
- 지도팀 Vue 프로젝트 안에서 `npm run dev` (Vite가 알아서 서빙 + .env 주입)
- `.env` 에 `VITE_OPENAI_API_KEY=...` (VITE_ 접두사 필수)
- `MoodPlayer.vue` 를 `:location` / `@mood-changed` 로 지도에 연결
- → 이게 의뢰서 요구 형태(FE에서 OpenAI 직접 호출 + VITE_ 키)

### B. 내 로컬 HTML 데모만 빠르게 볼 때 (Node 없을 때만)
```
powershell -ExecutionPolicy Bypass -File mood_player\serve.ps1
```
- 브라우저: http://localhost:8000/player.html
- ⚠️ 학원 컴퓨터엔 .env가 없음(안 올라감) → 키 다시 넣기:
  `.env` 에 `VITE_OPENAI_API_KEY=...` (또는 `API_KEY=...`) — **키 값 따로 챙겨가기**
  또는 플레이어 화면의 키 입력칸에 붙여넣기
- 인터넷 필요 (음악 스트리밍 + OpenAI)

## ✅ 제출까지 체크리스트
- [ ] 지도팀 코드 받아 `MoodPlayer.vue` 통합 (`:location` / `@mood-changed`)
- [ ] `.env` `VITE_OPENAI_API_KEY` + Netlify 대시보드 env 등록 (사용량 제한 키)
- [ ] `moodConfig.js` 음원 URL을 Cloudflare R2로 교체 (선택 · 발표 와우 · ↓ R2 섹션 참고)
- [ ] Netlify 배포 후 URL 동작 확인
- [ ] 발표 시연 = `player.html` 가상 산책(다음 장소 클릭)로 안전하게

## ☁️ Cloudflare R2 음원 호스팅 & 주입 (Node/CLI 불필요 · 대시보드로)

R2 = 무료(egress 0) · 광고 없음 · 죽은 링크 없음. 무드당 mp3 1개 이상(로열티프리 or 본인 소유 음원).

1. Cloudflare 로그인 → **R2** → **Create bucket** (예: `mood-audio`)
2. 버킷 열고 mp3 **드래그&드롭 업로드** — 무드별 이름 권장: `calm-1.mp3`, `vivid-1.mp3` …
3. 버킷 → **Settings → Public access → R2.dev subdomain → Allow Access** (공개 허용)
4. 나오는 공개 URL 베이스 복사: `https://pub-xxxxxxxx.r2.dev`
5. 각 파일 URL = `베이스/파일명` → 예: `https://pub-xxxxxxxx.r2.dev/calm-1.mp3`

**주입** — `mood_player/vue/moodConfig.js` 의 `MOOD_AUDIO` URL 교체:
```js
calm:  { label:"고요", urls:["https://pub-xxxx.r2.dev/calm-1.mp3","https://pub-xxxx.r2.dev/calm-2.mp3"] },
vivid: { label:"활기", urls:["https://pub-xxxx.r2.dev/vivid-1.mp3"] },
// … 6무드(calm/muse/flutter/vivid/savory/dreamy) 전부
```
- HTML 데모(player.html)에도 실제 곡 쓰려면 `mood_player/audio.js` 도 동일하게 교체.
- 무드당 2개 이상 넣으면 `⏭ 다음 곡` 이 순환.

**CORS는 안 건드려도 됨** — `<audio>` 재생은 CORS 불필요. (나중에 Web Audio 이펙트로 바꾸면 그때만 R2에 CORS 허용 규칙 추가)

**라이선스** — 로열티프리(Pixabay Music / FMA / NCS 등) 또는 본인 소유 음원만. 저작권 음원 립핑·호스팅은 리스크.

## 메모
- `serve.ps1`은 Node 없는 로컬에서 HTML 데모 보려는 임시 도구. 실제 배포엔 안 씀.
- 발표 와우 = 위치 이동 → AI가 근거 말하며 무드·음악·색 동시 전환.
