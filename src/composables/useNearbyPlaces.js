import { computed, ref, watch } from 'vue'
import { SETTINGS } from '../config/settings'
import { haversineMeters } from '../lib/geo'
import { loadPois } from '../lib/pois'

// F2. 근접 장소 탐색 — 카카오 키가 있으면 카카오로 먼저 조회, 실패/없으면 로컬 POI 사용
export function useNearbyPlaces(location) {
  const count = ref(SETTINGS.nearbyCount)
  const pois = ref([])
  const isLoading = ref(true)
  const loadError = ref('')

  // 로컬 POI는 초기 폴백
  loadPois()
    .then((data) => {
      pois.value = data
    })
    .catch((err) => {
      loadError.value = err.message
    })
    .finally(() => {
      isLoading.value = false
    })

  const useKakao = Boolean(import.meta.env.VITE_KAKAO_KEY)
  let requestId = 0

  async function fetchKakaoFor(loc) {
    const id = ++requestId
    isLoading.value = true
    loadError.value = ''
    try {
      const mod = await import('../api/KakaoMap')
      const getNearbyPlaces = mod.getNearbyPlaces
      const kplaces = await getNearbyPlaces(loc.lat, loc.lng, SETTINGS.searchRadiusM)
      if (id !== requestId) return
      if (!kplaces || kplaces.length === 0) {
        return
      }
      pois.value = kplaces.map((p) => ({
        id: p.id ?? `${p.coords.lng}-${p.coords.lat}`,
        title: p.name ?? '',
        addr: p.address ?? '',
        coords: [Number(p.coords.lat), Number(p.coords.lng)],
        type: 'kakao',
        raw: p,
      }))
    } catch (err) {
      if (id !== requestId) return
      loadError.value = err?.message ?? String(err)
    } finally {
      if (id === requestId) isLoading.value = false
    }
  }

  watch(
    location,
    (loc) => {
      if (!loc) return
      if (!useKakao) return
      fetchKakaoFor(loc)
    },
    { immediate: true },
  )

  const nearby = computed(() => {
    const fallback = { places: [], radiusM: SETTINGS.radiusExpandSteps[0] }
    if (!location.value || pois.value.length === 0) return fallback

    const locArr = Array.isArray(location.value)
      ? location.value
      : [location.value.lat, location.value.lng]

    const ranked = pois.value
      .map((poi) => ({ ...poi, distanceM: haversineMeters(locArr, poi.coords) }))
      .sort((a, b) => a.distanceM - b.distanceM)

    for (const radiusM of SETTINGS.radiusExpandSteps) {
      const within = ranked.filter((p) => p.distanceM <= radiusM)
      if (within.length > 0) return { places: within.slice(0, count.value), radiusM }
    }

    return { places: ranked.slice(0, count.value), radiusM: Infinity }
  })

  return {
    places: computed(() => nearby.value.places),
    usedRadiusM: computed(() => nearby.value.radiusM),
    poiCount: computed(() => pois.value.length),
    isLoading,
    loadError,
    count,
  }
}
