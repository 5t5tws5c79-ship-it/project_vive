import { computed, ref } from 'vue'
import { SETTINGS } from '../config/settings'
import { haversineMeters } from '../lib/geo'
import { loadPois } from '../lib/pois'

// F2. 근접 장소 탐색 — 하버사인 거리로 가까운 순 상위 N개.
// 반경 안에 아무것도 없으면 단계적으로 넓힌다 (서울 데이터인데 지방에서 접속한 경우 등).
export function useNearbyPlaces(location) {
  const count = ref(SETTINGS.nearbyCount)
  const pois = ref([])
  const isLoading = ref(true)
  const loadError = ref('')

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

  const nearby = computed(() => {
    const fallback = { places: [], radiusM: SETTINGS.radiusExpandSteps[0] }
    if (!location.value || pois.value.length === 0) return fallback

    const ranked = pois.value
      .map((poi) => ({ ...poi, distanceM: haversineMeters(location.value, poi.coords) }))
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
