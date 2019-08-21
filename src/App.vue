<template>
  <div id="app">
    <FilterPanel :gamesByCategory="gamesByCategory" @change="updateFilteredGames" @collapse="updatePanelCollapsed"/>
    <Map :gamesByCategory="gamesByCategory" :filteredGameIds="filteredGameIds" :panelCollapsed="panelCollapsed" @selectGameCenter="updateSelectedGameCenter"/>
    <GameCenterPanel :gameCenter="selectedGameCenter" :gamesByCategory="gamesByCategory" :filteredGameIds="filteredGameIds"/>
  </div>
</template>

<script>
import axios from 'axios'
import Map from './Map.vue'
import FilterPanel from './FilterPanel.vue'
import GameCenterPanel from './GameCenterPanel.vue'

export default {
  name: 'app',
  components: {
    Map,
    FilterPanel,
    GameCenterPanel
  },
  data () {
    return {
      gamesByCategory: [],
      filteredGameIds: [],
      panelCollapsed: false,
      selectedGameCenter: null
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

#app {
  display: flex;
}

#map {
  flex: 1;
}
</style>
