// TourAPI contenttypeid → 카테고리 배지
export const CONTENT_TYPES = {
  12: { label: '관광지', icon: '🏞️' },
  14: { label: '문화시설', icon: '🏛️' },
  15: { label: '축제공연행사', icon: '🎪' },
  25: { label: '여행코스', icon: '🧭' },
  28: { label: '레포츠', icon: '🚴' },
  32: { label: '숙박', icon: '🛏️' },
  38: { label: '쇼핑', icon: '🛍️' },
  39: { label: '음식점', icon: '🍽️' },
}

export const UNKNOWN_TYPE = { label: '기타', icon: '📍' }

export function contentType(id) {
  return CONTENT_TYPES[Number(id)] ?? UNKNOWN_TYPE
}
