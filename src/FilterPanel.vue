<template>
  <div id="filterPanelContainer">
    <div id="filterPanel" v-if="!collapsed">
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
    <div id="panelTab" @click="toogleCollapse">{{collapsed ? '&gt;' : '&lt;'}}</div>
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
      selectedGameIds: [],
      collapsed: true
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
    },
    toogleCollapse () {
      this.collapsed = !this.collapsed
      this.$emit('collapse', this.collapsed)
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
  width: 20em;
  height: 100%;
  padding: 1em;
  overflow-y: auto;
}

#filterPanelContainer {
  position: relative;
}

#panelTab {
  position: absolute;
  right: -2em;
  top: 0;
  width: 2em;
  height: 2em;
  text-align:center;
  background-color: white;
  padding: .5em;
  z-index: 1;
}
</style>
