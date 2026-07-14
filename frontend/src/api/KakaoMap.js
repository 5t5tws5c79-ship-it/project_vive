const CATEGORY_CODES = [
  "FD6", // 음식점
  "CE7", // 카페
  "AT4", // 관광명소
  "CT1"  // 문화시설
];


export function getNearbyPlaces(lat, lng) {

  const ps = new kakao.maps.services.Places();

  const location = new kakao.maps.LatLng(lat, lng);


  const promises = CATEGORY_CODES.map((code) => {

    return new Promise((resolve) => {

      ps.categorySearch(
        code,
        (data, status) => {

          if (status === kakao.maps.services.Status.OK) {
            resolve(data);
          } else {
            resolve([]);
          }

        },
        {
          location: location,
          radius: 500
        }
      );

    });

  });


  return Promise.all(promises)
    .then(results => {

      // 음식점 + 카페 + 관광명소 + 문화시설 합치기
      const places = results.flat();


      return places.map(place => ({

        name: place.place_name,

        category: place.category_name,

        address: place.address_name,

        latitude: place.y,

        longitude: place.x,

        distance: place.distance

      }));

    });

}