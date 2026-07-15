// 선정 권역: 서울 (요구사항 — 5개 권역 중 1곳)
//
// 원본 JSON은 public/data/ 에 그대로 두고 런타임에 fetch한다. 번들에 섞지 않으며,
// 파일 내용은 수정하지 않는다 (공공누리 제3유형 = 출처 표시 + 변경 금지).
// 한글 파일명은 CDN 경로 인코딩 문제를 피하려고 ASCII로만 바꿨다. 내용은 원본과 바이트 단위 동일.
//
// 【다른 권역으로 교체할 때】
//   1. data/<권역>/*.json 을 public/data/ 로 복사
//   2. 아래 FILES 경로와 REGION, ATTRIBUTION 을 교체
//   3. 끝. 나머지 코드는 손댈 필요 없다.

export const REGION = '서울'

export const FILES = [
  { path: 'data/seoul-12-attraction.json', contentTypeId: 12 },
  { path: 'data/seoul-14-culture.json', contentTypeId: 14 },
  { path: 'data/seoul-15-festival.json', contentTypeId: 15 },
  { path: 'data/seoul-25-course.json', contentTypeId: 25 },
  { path: 'data/seoul-28-leisure.json', contentTypeId: 28 },
  { path: 'data/seoul-38-shopping.json', contentTypeId: 38 },
  
]

// 공공누리 3유형은 출처 표시가 의무다. 화면에 반드시 노출할 것.
export const ATTRIBUTION = {
  text: '한국관광공사 Tour API(TourAPI 4.0)',
  org: '한국관광공사',
  url: 'https://www.data.go.kr/data/15101578/openapi.do',
  license: '공공누리 제3유형 (출처 표시 + 변경 금지)',
  licenseUrl: 'https://www.kogl.or.kr/info/licenseTypeView.do?licenseType=3',
  collectedAt: '2026-06',
}
