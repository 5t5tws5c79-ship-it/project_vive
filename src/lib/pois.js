import { FILES } from '../config/dataset'
import { contentType } from '../config/contentTypes'

// loadPois(): public/data 내 JSON 파일들을 fetch 해서 일반화된 POI 리스트 반환
export async function loadPois() {
  const responses = await Promise.all(
    FILES.map((f) => fetch('/' + f.path).then((r) => {
      if (!r.ok) throw new Error(`Failed to load ${f.path}`);
      return r.json();
    })),
  );

  const pois = responses.flatMap((json) => {
    const items = json.items || [];
    return items
      .filter((it) => it.mapx && it.mapy)
      .map((it) => ({
        id: `${it.contentid}-${it.contenttypeid}`,
        title: it.title,
        addr: it.addr1 || '',
        coords: [Number(it.mapy), Number(it.mapx)], // [lat, lon]
        type: contentType(it.contenttypeid),
        typeId: Number(it.contenttypeid), // 무드 규칙 폴백·프롬프트용 (카카오 경로엔 없음)
        raw: it,
      }));
  });

  return pois;
}