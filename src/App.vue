<template>
  <div id="app">
    <FilterPanel :gamesByCategory="gamesByCategory" v-on:change="updateFilteredGames"/>
    <Map :gamesByCategory="gamesByCategory" :filteredGameIds="filteredGameIds"/>
  </div>
</template>

<script>
import axios from 'axios'
import Map from './Map.vue'
import FilterPanel from './FilterPanel.vue'

export default {
  name: 'app',
  components: {
    Map,
    FilterPanel
  },
  data () {
    return {
      gamesByCategory: [],
      filteredGameIds: []
    }
  },
  methods: {
    updateFilteredGames (gameIds) {
      this.filteredGameIds = gameIds
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
}

#app {
  display: flex;
}

#map {
  flex: 1;
}
</style>
