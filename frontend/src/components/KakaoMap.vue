<script setup>
import { onMounted, ref } from 'vue'
import { getNearbyPlaces } from '../api/KakaoMap'


const mapContainer = ref(null)


const latitude = 37.5007
const longitude = 127.0364



onMounted(async () => {


  const position = new kakao.maps.LatLng(
    latitude,
    longitude
  )



  const map = new kakao.maps.Map(
    mapContainer.value,
    {
      center: position,
      level: 4
    }
  )



  // 지도 크기 재계산
  setTimeout(() => {

    map.relayout()

    map.setCenter(position)

  }, 500)



  const places = await getNearbyPlaces(
    latitude,
    longitude
  )



  console.log("places:", places)



  const infowindow =
    new kakao.maps.InfoWindow()



  places.forEach(place => {


    const markerPosition =
      new kakao.maps.LatLng(
        place.latitude,
        place.longitude
      )



    /*
      커스텀 마커
      카카오 기본 핀 제거
    */

    const markerElement =
      document.createElement("div")


    markerElement.className =
      "music-marker"



    markerElement.innerHTML = `
      🎵
    `



    const customMarker =
      new kakao.maps.CustomOverlay({

        position: markerPosition,

        content: markerElement,

        yAnchor:1

      })



    customMarker.setMap(map)




    // 마커 클릭
    markerElement.addEventListener(
      "click",
      () => {


        infowindow.setContent(`

          <div class="place-info">

            <h3>
              🎧 ${place.name}
            </h3>


            <p>
              ${place.category}
            </p>


            <p>
              ${place.address}
            </p>


            <p>
              📍 ${place.distance}m
            </p>


          </div>

        `)



        infowindow.open(
          map,
          customMarker
        )


      }
    )


  })




  // 지도 빈 곳 클릭하면 정보창 닫기
  kakao.maps.event.addListener(
    map,
    "click",
    () => {

      infowindow.close()

    }
  )



})

</script>



<template>

  <div
    ref="mapContainer"
    class="map"
  ></div>

</template>



<style scoped>


.map {

  width:100%;

  height:100vh;

}



/* 음악 마커 */

.music-marker {

  width:48px;

  height:48px;


  border-radius:50%;


  background:#6c5ce7;


  display:flex;

  justify-content:center;

  align-items:center;


  font-size:24px;


  cursor:pointer;


  box-shadow:
  0 0 20px rgba(108,92,231,0.8);


  transition:0.2s;

}



.music-marker:hover {

  transform:scale(1.2);

}




.place-info {

  padding:15px;

  min-width:220px;

  text-align:center;

}


.place-info h3 {

  margin-bottom:10px;

}


</style>