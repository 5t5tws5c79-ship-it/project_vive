<script setup>
import { computed, onMounted, provide, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import AppNav from './components/AppNav.vue'
import PlayerBar from './components/PlayerBar.vue'
import NowPlayingSheet from './components/NowPlayingSheet.vue'
import ChatbotLauncher from './components/ChatbotLauncher.vue'
import { useGeolocation } from './composables/useGeolocation'
import { useNearbyPlaces } from './composables/useNearbyPlaces'
import { useMoodPlaceholder } from './composables/useMoodPlaceholder'
import { useCrossfadePlayer } from './composables/useCrossfadePlayer'
import { ATTRIBUTION, REGION } from './config/dataset'

const route = useRoute()

// 위치 → 근처 장소 → (무드: 플레이스홀더) → 플레이어
const { location, status, error, locate } = useGeolocation()
const { places, usedRadiusM, poiCount, isLoading, loadError } = useNearbyPlaces(location)
const { moodId, mood, setMood, moods } = useMoodPlaceholder()
const player = useCrossfadePlayer(moodId)

// 위치와 데이터 중 하나라도 아직이면 로딩 취급
const isPending = computed(() => status.value !== 'ready' || isLoading.value)

// 하단 플레이어를 누르면 열리는 재생 정보 + 설정 시트
const isSheetOpen = ref(false)

// 플레이어는 페이지를 넘겨도 계속 재생돼야 하므로 셸에 두고 아래로 흘려보낸다
provide('app', {
  location,
  status,
  error,
  locate,
  places,
  usedRadiusM,
  poiCount,
  isPending,
  loadError,
  mood,
  moods,
  setMood,
  player,
})

// 무드 색을 CSS 변수로 흘려보내 화면 전체 톤을 바꾼다
watchEffect(() => {
  const root = document.documentElement
  root.style.setProperty('--mood', mood.value.color)
  root.style.setProperty('--mood-accent', mood.value.accent)
})

onMounted(locate)
</script>

<template>
  <div class="app">
    <header class="header">
      <h1 class="brand">
        <span class="brand__dot" aria-hidden="true" />
        지금, 여기의 소리
      </h1>
      <p v-if="poiCount" class="tagline">
        {{ REGION }} {{ poiCount.toLocaleString() }}곳의 장소를 듣고 있습니다
      </p>
    </header>

    <main class="main">
      <RouterView :key="route.fullPath" />
    </main>

    <footer class="footer">
      이 서비스는 {{ ATTRIBUTION.text }}의 데이터를 활용하였습니다. 출처:
      <a :href="ATTRIBUTION.url" target="_blank" rel="noreferrer">{{ ATTRIBUTION.org }}</a>
      · <a :href="ATTRIBUTION.licenseUrl" target="_blank" rel="noreferrer">{{ ATTRIBUTION.license }}</a>
    </footer>

    <!-- 챗봇 진입점: 데스크톱 = 우하단 플로팅 / 모바일 = 전체화면 -->
    <ChatbotLauncher />

    <!-- 하단 고정: 플레이어 + 탭 내비 (페이지를 넘겨도 재생이 끊기지 않는다) -->
    <div class="dock">
      <PlayerBar :player="player" :mood-label="mood.label" @expand="isSheetOpen = true" />
      <AppNav />
    </div>

    <Transition name="sheet">
      <NowPlayingSheet
        v-if="isSheetOpen"
        :player="player"
        :mood="mood"
        @close="isSheetOpen = false"
      />
    </Transition>
  </div>
</template>

<style scoped>
.app {
  /* 본문과 하단 도크가 같은 폭 체계를 쓰도록 셸 최대 폭을 변수로 공유 */
  --shell-max: 720px;
  position: relative;
  z-index: 1;
  max-width: var(--shell-max);
  margin: 0 auto;
  /* 하단 도크(플레이어+내비)에 가리지 않도록 여백 확보 */
  padding: 28px 16px calc(150px + env(safe-area-inset-bottom));
}

.header {
  margin-bottom: 20px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.brand__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--mood);
  box-shadow: 0 0 14px var(--mood);
  transition: background 1s ease, box-shadow 1s ease;
}

.tagline {
  margin: 6px 0 0 19px;
  font-size: 0.78rem;
  color: var(--text-faint);
}

.main {
  display: grid;
  gap: 14px;
}

.footer {
  margin-top: 28px;
  font-size: 0.68rem;
  line-height: 1.7;
  color: var(--text-faint);
}

.footer a {
  color: var(--text-dim);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.dock {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  display: grid;
  gap: 0;
  /* 본문(.app)과 동일한 좌우 여백 */
  padding: 0 16px env(safe-area-inset-bottom);
  background: linear-gradient(to top, var(--bg) 72%, transparent);
}

.dock > * {
  /* 본문 섹션 폭 = 셸 최대 폭 - 좌우 패딩 32px. 도크도 정확히 같은 폭으로 */
  max-width: calc(var(--shell-max, 720px) - 32px);
  width: 100%;
  margin: 0 auto;
}

@media (min-width: 860px) {
  .app {
    --shell-max: 880px;
  }
}
</style>