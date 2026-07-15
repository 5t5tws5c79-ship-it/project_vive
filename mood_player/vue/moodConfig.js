// 무드 정의 · 카테고리 매핑 · 무드별 음원 · 발표 경로.
// ▶ 배포 시 여기만 손보면 됨: MOOD_AUDIO 의 URL 을 당신 Cloudflare R2 주소로 교체.

export const MOODS = {
  calm:   { label: "고요", color: "#6aa9c9" },
  muse:   { label: "사색", color: "#8f86c9" },
  flutter:{ label: "설렘", color: "#e6a15c" },
  vivid:  { label: "활기", color: "#e0655f" },
  savory: { label: "미식", color: "#cf8f6a" },
  dreamy: { label: "몽환", color: "#6f7fc9" },
};

// TourAPI contentTypeId → 무드 (LLM 실패 시 규칙 폴백용)
export const TYPE_TO_MOOD = {
  "12":"calm","25":"calm","14":"muse","15":"flutter",
  "28":"vivid","38":"vivid","39":"savory","32":"dreamy",
};
export const TYPE_LABEL = {
  "12":"관광지","14":"문화시설","15":"축제공연행사","25":"여행코스",
  "28":"레포츠","32":"숙박","38":"쇼핑","39":"음식점",
};

// 무드별 음원. Cloudflare R2 호스팅. 교체 지점=R2_BASE. 곡 목록·출처는 최상단 curation.json 참고.
const R2_BASE = "https://pub-3fc25dd84d8b400c8e7c624382630552.r2.dev";
export const MOOD_AUDIO = {
  calm:    { label:"고요", urls:[`${R2_BASE}/audio/calm/calm-1.mp3`] },
  muse:    { label:"사색", urls:[`${R2_BASE}/audio/muse/muse-1.mp3`] },
  flutter: { label:"설렘", urls:[`${R2_BASE}/audio/flutter/flutter-1.mp3`,`${R2_BASE}/audio/flutter/flutter-2.mp3`] },
  vivid:   { label:"활기", urls:[`${R2_BASE}/audio/vivid/vivid-1.mp3`,`${R2_BASE}/audio/vivid/vivid-2.mp3`] },
  savory:  { label:"미식", urls:[`${R2_BASE}/audio/savory/savory-1.mp3`] },
  dreamy:  { label:"몽환", urls:[`${R2_BASE}/audio/dreamy/dreamy-1.mp3`,`${R2_BASE}/audio/dreamy/dreamy-2.mp3`] },
};

// 발표용 가상 산책 경로 (부모가 gotoStep/nextStep 으로 구동)
export const DEMO_ROUTE = [
  { name:"은평·진관사길", lat:37.6384, lng:126.9463 },
  { name:"성수·서울숲",   lat:37.5445, lng:127.0557 },
  { name:"인사동·대학로", lat:37.5805, lng:127.0024 },
  { name:"압구정·강남",   lat:37.5270, lng:127.0276 },
  { name:"남산·한강길",   lat:37.5538, lng:127.0166 },
];
