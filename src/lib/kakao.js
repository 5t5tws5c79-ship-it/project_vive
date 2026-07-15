let sdkPromise = null;

export function loadKakaoSdk() {
  // 여러 컴포넌트가 동시에 호출해도 한 번만 로드하고 같은 프로미스를 공유한다.
  // (kakao.maps 네임스페이스만 있고 클래스가 아직 준비 안 된 시점의 경쟁 조건 방지)
  if (sdkPromise) return sdkPromise;

  const key = import.meta.env.VITE_KAKAO_KEY;
  if (!key) return Promise.reject(new Error('VITE_KAKAO_KEY is missing'));

  sdkPromise = new Promise((resolve, reject) => {
    const finish = () => window.kakao.maps.load(() => resolve(window.kakao));

    // 이미 로드된 SDK 재사용
    if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) {
      return resolve(window.kakao);
    }
    if (window.kakao && window.kakao.maps) {
      return finish();
    }

    const s = document.createElement('script');
    // autoload=false 필수: 안 붙이면 SDK가 document.write로 라이브러리를 로드하려다
    // 동적 append된 스크립트에서는 막혀서 kakao.maps.LatLng 등이 정의되지 않는다.
    // kakao.maps.load(콜백)로 명시적으로 로드해야 클래스가 준비된다.
    s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=services&autoload=false`;
    s.onload = finish;
    s.onerror = () => {
      sdkPromise = null; // 실패 시 재시도 가능하도록 캐시 비움
      reject(new Error('Kakao SDK load failed'));
    };
    document.head.appendChild(s);
  });

  return sdkPromise;
}
