<template>
  <div id="filterPanel">
    <h2>Filter Panel</h2>
      <div v-for="category in gamesByCategory" class="category" :key="category.id">
        <h4>{{ category.name }}</h4>
        <ul>
          <li v-for="game in category.games" :key="game.id">
            <input type="checkbox" :id="game.id" :value="game.id" v-model="selectedGames"/>
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
      selectedGames: []
    }
  },
  watch: {
    selectedGames (val) {
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
