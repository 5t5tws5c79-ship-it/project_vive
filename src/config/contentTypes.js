// TourAPI contenttypeid → 카테고리 배지 (shape는 지도 핀 모양 구분용)
export const CONTENT_TYPES = {
  12: { label: '관광지', icon: '🏞️', shape: 'circle' },
  14: { label: '문화시설', icon: '🏛️', shape: 'square' },
  15: { label: '축제공연행사', icon: '🎪', shape: 'star' },
  25: { label: '여행코스', icon: '🧭', shape: 'hexagon' },
  28: { label: '레포츠', icon: '🚴', shape: 'triangle' },
  32: { label: '숙박', icon: '🛏️', shape: 'diamond' },
  38: { label: '쇼핑', icon: '🛍️', shape: 'pentagon' },
  39: { label: '음식점', icon: '🍽️', shape: 'octagon' },
}

export const UNKNOWN_TYPE = { label: '기타', icon: '📍', shape: 'teardrop' }

export function contentType(id) {
  return CONTENT_TYPES[Number(id)] ?? UNKNOWN_TYPE
}
