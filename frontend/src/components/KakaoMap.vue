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


  const options = {
    center: position,
    level: 4
  }


  const map = new kakao.maps.Map(
    mapContainer.value,
    options
  )


  const places = await getNearbyPlaces(
    latitude,
    longitude
  )


  places.forEach(place => {

    const markerPosition =
      new kakao.maps.LatLng(
        place.latitude,
        place.longitude
      )


    const marker =
      new kakao.maps.Marker({
        position: markerPosition
      })


    marker.setMap(map)

  })


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
  width: 100%;
  height: 100vh;
}
</style>