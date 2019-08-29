<template>
  <div id="filterPanelContainer">
    <div id="filterPanel" v-if="!collapsed">
      <div v-for="category in gamesByCategory" class="category" :key="category.id">
        <h4 class="category-title-block" :style="{'background': category.color}">
          <Checkbox class="category-checkbox" :id="category.id" :value="category.id" :checked="getCategoryChecked(category)" :indeterminate="getCategoryIndeterminate(category)" @change="categoryStateChange(category, $event)" color="white" size="1.5em">
            {{category.name}}
          </Checkbox>
          <button class="category-toogle-button" @click="toogleCategory(category.id)">▼</button>
        </h4>
        <ul v-show="expandedCategoryIds.includes(category.id)">
          <li v-for="game in category.games" :key="game.id">
            <Checkbox :id="game.id" :value="game.id" v-model="selectedGameIds" color="black" size="1em">
              {{game.name}}
            </Checkbox>
          </li>
        </ul>
      </div>
      <h3>Amount Of selected Filter</h3>
      <div class="slidecontainer">
        <input type="range" min="1" :max="selectedGameIds.length || 1" v-model.number="selectedAmountFilter" class="slider">
      </div>
        Show game centers with {{selectedAmountFilter > 1 && selectedAmountFilter === selectedGameIds.length ? 'all' : 'at least ' + selectedAmountFilter}} of the selected games
    </div>
    <div id="panelTab" @click="toogleCollapse">{{collapsed ? '▶' : '◀'}}</div>
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
    getCategoryChecked (category) {
      return category.games.every(game => this.selectedGameIds.includes(game.id))
    },
    getCategoryIndeterminate (category) {
      const allSelected = this.getCategoryChecked(category)
      const someSelected = category.games.some(game => this.selectedGameIds.includes(game.id))
      return someSelected && !allSelected
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
  box-shadow: 3px 3px 4px #bbb;
}

#panelTab {
  position: absolute;
  border-top-right-radius: 1.5em;
  border-bottom-right-radius: 1.5em;
  right: -3em;
  top: 0;
  width: 3em;
  height: 3em;
  background-color: white;
  padding-left: 1em;
  padding-top: 0.8em;
  z-index: 1;
  box-shadow: 3px 3px 4px #bbb;
}
.category-title-block {
  --category-height: 3em;
  --checkbox-height: 1.5em;
  color: white;
  height: var(--category-height);
  border-radius: calc(var(--category-height)/2);
  padding-left: calc((var(--category-height) - var(--checkbox-height))/2);
  box-shadow: 3px 3px 4px #bbb;
  display: flex;
}
.category-checkbox {
  flex: 1;
}
.category-toogle-button {
  background: none;
  border: none;
  color: white;
    height: 100%;
    padding: 0 1.5em;
}
ul {
  list-style-type: none;
}
</style>
