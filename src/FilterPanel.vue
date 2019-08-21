<template>
  <div id="filterPanel">
    <h2>Filter Panel</h2>
      <div v-for="category in gamesByCategory" class="category" :key="category.id">
        <h4><input type="checkbox" :id="category.id" @change="categoryStateChange(category, $event)"/><label :for="category.id">{{ category.name }}</label></h4>
        <ul>
          <li v-for="game in category.games" :key="game.id">
            <input type="checkbox" :id="game.id" :value="game.id" v-model="selectedGameIds"/>
            <label :for="game.id">{{game.name}}</label>
          </li>
        </ul>
      </div>
  </div>
</template>

<script>

export default {
  name: 'filterPanel',
  components: {
  },
  props: ['gamesByCategory'],
  data () {
    return {
      selectedGameIds: []
    }
  },
  methods: {
    categoryStateChange (category, event) {
      const categoryGameIds = category.games.map(game => game.id)
      if (event.target.checked) {
        // Add all games of this category
        for (let gameId of categoryGameIds) {
          if (!this.selectedGameIds.includes(gameId)) {
            this.selectedGameIds.push(gameId)
          }
        }
      } else {
        // Remove all games of this category
        this.selectedGameIds = this.selectedGameIds.filter(gameId => !categoryGameIds.includes(gameId))
      }
    }
  },
  watch: {
    selectedGameIds (val) {
      this.$emit('change', val)
    }
  }
}
</script>

<style>
#filterPanel {
  padding: 1em;
  width: 20em;
  overflow-y: auto;
}
</style>
