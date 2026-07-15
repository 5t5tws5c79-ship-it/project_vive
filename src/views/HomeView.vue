<script setup>
import { inject } from 'vue'
import MoodCard from '../components/MoodCard.vue'
import LocationCard from '../components/LocationCard.vue'
import ContributeTrack from '../components/ContributeTrack.vue'
import PlaceList from '../components/PlaceList.vue'

const app = inject('app')
</script>

<template>
  <MoodCard :mood="app.mood.value" :moods="app.moods" @select="app.setMood" />

  <LocationCard
    :location="app.location.value"
    :status="app.status.value"
    :error="app.error.value"
    :mode="app.mode.value"
    :demo-route="app.demoRoute"
    :demo-index="app.demoIndex.value"
    @relocate="app.locate"
    @goto-demo="app.gotoStep"
    @next-step="app.nextStep"
  />

  <ContributeTrack :places="app.places.value" :mood-label="app.mood.value.label" />

  <PlaceList
    :places="app.places.value"
    :loading="app.isPending.value"
    :radius-m="app.usedRadiusM.value"
    :load-error="app.loadError.value"
  />
</template>
