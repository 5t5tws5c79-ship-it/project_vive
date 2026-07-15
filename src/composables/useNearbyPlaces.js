import { computed, ref } from 'vue'
import { SETTINGS } from '../config/settings'
import { haversineMeters } from '../lib/geo'
import { loadPois } from '../lib/pois'

// F2. 근접 장소 탐색 — 로컬 TourAPI POI 데이터셋 기준(무드 추론용 장소 검색엔 카카오 미사용)
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
