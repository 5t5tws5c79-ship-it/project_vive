// 무드별 음원 config.
// Cloudflare R2 호스팅. 교체 지점 = R2_BASE. 곡 목록·출처는 최상단 curation.json 참고.
//   (무드당 여러 개 넣으면 '다음 곡'으로 순환)
var R2_BASE = "https://pub-3fc25dd84d8b400c8e7c624382630552.r2.dev";
window.MOOD_AUDIO = {
  calm:    { label: "고요", urls: [ R2_BASE + "/audio/calm/calm-1.mp3" ] },
  muse:    { label: "사색", urls: [ R2_BASE + "/audio/muse/muse-1.mp3" ] },
  flutter: { label: "설렘", urls: [
    R2_BASE + "/audio/flutter/flutter-1.mp3",
    R2_BASE + "/audio/flutter/flutter-2.mp3" ] },
  vivid:   { label: "활기", urls: [
    R2_BASE + "/audio/vivid/vivid-1.mp3",
    R2_BASE + "/audio/vivid/vivid-2.mp3" ] },
  savory:  { label: "미식", urls: [ R2_BASE + "/audio/savory/savory-1.mp3" ] },
  dreamy:  { label: "몽환", urls: [
    R2_BASE + "/audio/dreamy/dreamy-1.mp3",
    R2_BASE + "/audio/dreamy/dreamy-2.mp3" ] },
};
