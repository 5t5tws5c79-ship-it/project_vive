// 무드별 음원 config.
// 기본값 = 로열티프리(SoundHelix) — 지금 바로 재생 확인용.
// ▶ 배포 시: 각 URL을 당신 Cloudflare R2에 올린 음원 주소로 교체만 하면 됩니다.
//   (무드당 여러 개 넣으면 '다음 곡'으로 순환)
window.MOOD_AUDIO = {
  calm:    { label: "SoundHelix 4 (로열티프리)", urls: [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" ] },
  muse:    { label: "SoundHelix 3 (로열티프리)", urls: [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" ] },
  flutter: { label: "SoundHelix 2 (로열티프리)", urls: [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" ] },
  vivid:   { label: "SoundHelix 7 (로열티프리)", urls: [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" ] },
  savory:  { label: "SoundHelix 5 (로열티프리)", urls: [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" ] },
  dreamy:  { label: "SoundHelix 6 (로열티프리)", urls: [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" ] },
};
