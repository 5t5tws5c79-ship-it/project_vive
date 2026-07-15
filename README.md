# 지금, 여기의 소리

> 내 주변 장소가 만드는 무드로 플레이리스트를 고르는 **위치 기반 앰비언트 플레이어**

한국관광공사 TourAPI 4.0 서울 데이터(8,150건)를 브라우저에서 직접 불러와, 현재 위치 주변 장소의 성격으로부터 무드를 정하고 그 무드에 맞는 음악을 크로스페이드로 이어 재생합니다. 백엔드 서버 없이 Vue 3 + Vite만으로 동작하는 정적 SPA입니다.

## Quick Start

```bash
npm install
npm run dev        # http://localhost:5173 — LAN에도 노출됨 (같은 와이파이의 폰에서 접속 가능)
```

```bash
npm run build      # dist/ 생성
npm run preview    # 빌드 결과 로컬 확인
```

> **위치 권한 참고**: 위치 기능은 보안 컨텍스트에서만 동작합니다. `localhost`는 허용되지만, LAN IP(HTTP)로 폰에서 접속하면 자동으로 기본 위치(서울시청)로 폴백됩니다.

### 환경변수 (.env)

챗봇(OpenAI) 연동 시 API 키는 반드시 환경변수로 관리합니다.

```bash
# .env — 절대 커밋하지 않습니다 (.gitignore에 포함되어 있는지 확인)
VITE_OPENAI_API_KEY=sk-...
```

- `VITE_` 접두사 값은 빌드 결과물에 노출되므로 **사용량 제한 키만 사용**하고 결제 한도를 낮게 설정합니다.
- Netlify 배포 시에는 대시보드 → Site settings → Environment variables에 별도 등록합니다.
- 소스코드 제출 시 `.env` 파일 미포함을 반드시 확인합니다.

## 기술 스택

| 구분 | 내용 |
|------|------|
| 프레임워크 | Vue 3 (`<script setup>` SFC) + vue-router 5 |
| 빌드 | Vite 8 (`@vitejs/plugin-vue`) |
| 데이터 | `public/data/*.json` — TourAPI 서울 원본을 런타임 fetch (번들 미포함, 원본 무수정) |
| 오디오 | Web Audio 기반 크로스페이드 (생성 앰비언트 / 유튜브 이중 소스) |
| 배포 | Netlify (SPA 리다이렉트 포함) |
| 백엔드 | 없음 — 커뮤니티는 localStorage, 챗봇은 프론트에서 OpenAI API 직접 호출 |

## 화면 구성

| 경로 | 화면 |
|------|------|
| `/` | 홈 — 무드 카드 · 현재 위치 · 곡 추천 유도 · 근처 장소 리스트 |
| `/community` | 장소별 큐레이션 목록 — 검색, 정렬, 지도↔목록 보기 전환 |
| `/community/new` | 곡 등록 폼 (장소·곡·아티스트·무드·한마디·비밀번호) |
| `/community/:id` | 글 상세 — 곡 정보, 좋아요, 비밀번호 기반 수정/삭제, 댓글 |

플레이어와 하단 내비게이션은 앱 셸에 고정되어 있어 **페이지를 이동해도 재생이 끊기지 않습니다.** 무드 색상은 CSS 변수로 주입되어 화면 전체 톤이 함께 바뀝니다.

## 핵심 기능

1. **위치 획득** — GPS 좌표 획득, 권한 거부·타임아웃·HTTP 접속 시 서울시청 폴백 + 사유 표시
2. **근접 장소 탐색** — 하버사인 거리로 가까운 순 상위 5곳, 반경 3km에서 시작해 8→20→50km 단계 확장
3. **무드 시스템** — 6개 무드(고요·사색·활력·축제·미식·도심 산책)가 TourAPI 콘텐츠 유형과 매핑, 선택 시 화면 톤·플레이리스트 즉시 전환
4. **크로스페이드 플레이어** — 두 덱(A/B) 오버랩 방식으로 90초마다 6초 페이드 전환, 첫 재생은 자동재생 정책상 사용자 제스처로 언락
5. **오디오 소스 토글** — 생성 앰비언트(무드별 사운드 레시피) ↔ 유튜브(무드별 영상 ID) 전환
6. **커뮤니티** — 회원가입 없는 익명 방식, 작성 시 비밀번호 저장 후 수정·삭제 시 대조 (localStorage)
7. **챗봇** — 데스크톱 플로팅 패널 / 모바일 전체화면, 제공 JSON 기반 자연어 질의응답 (OpenAI)

각 기능의 상세 동작·설계 근거는 [기능 및 사용법 문서](./docs/project_vive_기능_및_사용법.md)를 참고하세요.

## 사용 흐름

1. 접속 시 위치 권한 요청 → 허용하면 GPS, 거부하면 서울시청 폴백 (사유가 위치 카드에 표시)
2. 근처 장소 상위 5곳이 카테고리 배지·거리와 함께 표시
3. "지금의 무드" 카드에서 무드 선택 → 화면 톤과 플레이리스트 전환
4. 하단 플레이어 ▶로 재생 시작 → 90초마다 자동 크로스페이드, ⏭로 즉시 전환
5. 플레이어 바 탭 → 시트에서 볼륨·소스(앰비언트/유튜브) 조절
6. '큐레이션' 탭에서 장소별 곡을 지도/목록으로 탐색, "＋ 이 장소의 곡 등록하기"로 작성

## 설정 지점

| 위치 | 항목 |
|------|------|
| `src/config/settings.js` | 근접 장소 수(5), 탐색 반경 단계, 전환 주기(90초), 페이드 길이(6초), 폴백 위치 |
| `src/config/moods.js` | 무드 정의 전체 — 색·설명·트랙 레시피·유튜브 ID |
| `src/config/dataset.js` | 권역(`REGION`), 데이터 파일 목록(`FILES`), 출처 표기(`ATTRIBUTION`) |

**권역 교체**: ① 새 권역 JSON을 `public/data/`로 복사 ② `dataset.js`의 `FILES`·`REGION`·`ATTRIBUTION` 교체 ③ 끝 — 나머지 코드는 수정 불필요.

## 데이터 및 라이선스

이 서비스는 한국관광공사 Tour API(TourAPI 4.0)의 데이터를 활용하였습니다.

| 항목 | 내용 |
|------|------|
| 출처 | [한국관광공사](https://www.data.go.kr/data/15101578/openapi.do) — 서울(SEL) 8,150건, 2026-06 수집 |
| 라이선스 | [공공누리 제3유형](https://www.kogl.or.kr/info/licenseTypeView.do?licenseType=3) (출처 표시 + 변경 금지) |
| 준수 사항 | 원본 JSON 무수정 (한글 파일명만 CDN 인코딩 회피를 위해 ASCII로 변경, 내용은 바이트 동일), 출처 표기를 앱 푸터에 상시 노출 |

스키마·파일별 건수는 `public/data/SCHEMA.md`, `public/data/SOURCE.md` 참조.

## 배포 (Netlify)

`netlify.toml`에 빌드 명령(Node 22)과 SPA 리다이렉트(`/* → /index.html`)가 설정되어 있습니다. repo 연동 후 push하면 자동 배포됩니다.

> **주의**: `netlify.toml`의 `base = "frontend"`는 앱이 리포지토리의 `frontend/` 하위에 있다는 전제입니다. 앱이 리포 루트에 있는 구조라면 해당 줄을 제거하세요.

## 프로젝트 구조

```
project_vive/
├─ index.html                  # 앱 진입 HTML
├─ vite.config.js              # host: true (LAN 노출)
├─ netlify.toml                # Netlify 빌드/리다이렉트
├─ public/
│  └─ data/                    # TourAPI 서울 JSON 6종 + SCHEMA.md + SOURCE.md
└─ src/
   ├─ main.js / App.vue        # 앱 셸 — 위치→장소→무드→플레이어 파이프라인 소유
   ├─ router/index.js          # 4개 라우트
   ├─ config/                  # settings · moods · dataset · contentTypes
   ├─ composables/             # useGeolocation · useNearbyPlaces · useMoodPlaceholder · useCrossfadePlayer
   ├─ lib/                     # geo(하버사인) · pois(로더) · engines(오디오 엔진)
   ├─ components/              # PlayerBar · NowPlayingSheet · MoodCard · CurationMap · ChatbotLauncher 등
   └─ views/                   # Home · Community · CurationNew · CurationDetail
```