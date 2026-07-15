import { loadKakaoSdk } from '../lib/kakao';

const CATEGORY_CODES = ['FD6','CE7','AT4','CT1'];

export async function getNearbyPlaces(lat, lng, radius = 1000) {
  const kakao = await loadKakaoSdk();
  const ps = new kakao.maps.services.Places();
  const location = new kakao.maps.LatLng(lat, lng);

  const promises = CATEGORY_CODES.map(code =>
    new Promise((resolve) => {
      ps.categorySearch(code, (data, status) => {
        resolve(status === kakao.maps.services.Status.OK ? data : []);
      }, { location, radius });
    })
  );
  const results = await Promise.all(promises);
  return results.flat().map(p => ({
    id: p.id ?? `${p.x}-${p.y}`,
    name: p.place_name,
    category: p.category_name,
    address: p.address_name,
    coords: { lat: Number(p.y), lng: Number(p.x) },
    distanceM: Number(p.distance || 0)
  }));
}