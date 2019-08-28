<template>
  <div id="filterPanelContainer">
    <div id="filterPanel" v-if="!collapsed">
      <h2>Filter Panel</h2>
      <div v-for="category in gamesByCategory" class="category" :key="category.id">
        <h4 class="category-title-block">
          <Checkbox class="category-checkbox" :id="category.id" :label="category.name" :status="getCategoryCheckStatus(category)" @change="categoryStateChange(category, $event)"/>
          <button class="category-toogle-button" @click="toogleCategory(category.id)">▼</button>
        </h4>
        <ul v-show="expandedCategoryIds.includes(category.id)">
          <li v-for="game in category.games" :key="game.id">
            <input type="checkbox" :id="game.id" :value="game.id" v-model="selectedGameIds"/>
            <label :for="game.id">{{game.name}}</label>
          </li>
        </ul>
      </div>
      <h3>Amount Of selected Filter</h3>
      <div class="slidecontainer">
        <input type="range" min="1" :max="selectedGameIds.length || 1" v-model.number="selectedAmountFilter" class="slider">
      </div>
        Show game centers with {{selectedAmountFilter > 1 && selectedAmountFilter === selectedGameIds.length ? 'all' : 'at least ' + selectedAmountFilter}} of the selected games
    </div>
    <div id="panelTab" @click="toogleCollapse">{{collapsed ? '&gt;' : '&lt;'}}</div>
  </div>
</template>

<script>
import Checkbox from './components/Checkbox.vue'

export default {
  name: 'filterPanel',
  components: {
    Checkbox
  },
  props: ['gamesByCategory'],
  data () {
    return {
      selectedGameIds: [],
      selectedAmountFilter: 1,
      collapsed: true,
      expandedCategoryIds: []
    }
  },
  methods: {
    getCategoryCheckStatus (category) {
      const selected = category.games.filter(game => this.selectedGameIds.includes(game.id))

      const allSelected = selected.length === category.games.length
      const someSelected = selected.length !== 0

      return {
        checked: allSelected,
        indeterminate: someSelected && !allSelected
      }
    },
    categoryStateChange (category, event) {
      const categoryGameIds = category.games.map(game => game.id)
      if (event.target.checked) {
        // Add all games of this category
        const gameIdsToAdd = categoryGameIds.filter(gameId => !this.selectedGameIds.includes(gameId))
        this.selectedGameIds = this.selectedGameIds.concat(gameIdsToAdd)
      } else {
        // Remove all games of this category
        this.selectedGameIds = this.selectedGameIds.filter(gameId => !categoryGameIds.includes(gameId))
      }
    },
    toogleCollapse () {
      this.collapsed = !this.collapsed
      this.$emit('collapse', this.collapsed)
    },
    toogleCategory (id) {
      const index = this.expandedCategoryIds.indexOf(id)
      if (index > -1) {
        this.expandedCategoryIds.splice(index, 1)
      } else {
        this.expandedCategoryIds.push(id)
      }
    }
  },
  watch: {
    selectedGameIds (val, oldVal) {
      if (val.length === 0) {
        this.selectedAmountFilter = 1
      } else {
        if (this.selectedAmountFilter > val.length) {
          // Make sure the value of the slider is not more than the maximum
          this.selectedAmountFilter = val.length
        } else if (this.selectedAmountFilter > 1 &&
          this.selectedAmountFilter === oldVal.length) {
          // If the value of the slider was the maximum, keep the maximum value
          this.selectedAmountFilter = val.length
        }
      }
      this.$emit('change', val, this.selectedAmountFilter)
    },
    selectedAmountFilter (val) {
      this.$emit('change', this.selectedGameIds, val)
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
.category-title-block {
  --category-height: 50px;
  background: blue;
  color: white;
  height: var(--category-height);
  border-radius: calc(var(--category-height)/2);
  display: flex;
}
.category-checkbox {
  flex: 1;
}
.category-toogle-button {
  background: none;
  border: none;
  color: white;
  margin-right: 10px;
  height: 100%;
  padding: 10px;
}
</style>
