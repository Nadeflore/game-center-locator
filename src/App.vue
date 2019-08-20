<template>
  <div id="app">
    <Map :games="games" :gameCenters="gameCenters"/>
  </div>
</template>

<script>
import axios from 'axios'
import Map from './Map.vue'

export default {
  name: 'app',
  components: {
    Map
  },
  data () {
    return {
      gameCenters: [],
      games: {}
    }
  },
  mounted () {
    axios.get('data/games.json')
      .then(response => {
        this.games = response.data
      })
    axios.get('data/game_centers.json')
      .then(response => {
        this.gameCenters = response.data
      })
  }
}
</script>

<style>
html, body, #app {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    overflow: hidden;
}
</style>
