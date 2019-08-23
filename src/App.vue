<template>
  <div id="app">
    <Map :gamesByCategory="gamesByCategory"/>
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
      gamesByCategory: []
    }
  },
  methods: {
    updateFilteredGames (gameIds) {
      this.filteredGameIds = gameIds
    },
    updatePanelCollapsed (collapsed) {
      this.panelCollapsed = collapsed
    },
    updateSelectedGameCenter (gameCenter) {
      this.selectedGameCenter = gameCenter
    }
  },
  mounted () {
    axios.get('data/games_by_category.json')
      .then(response => {
        this.gamesByCategory = response.data
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
  font-family: sans-serif;
}

</style>
