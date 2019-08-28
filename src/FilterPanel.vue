<template>
  <div id="filterPanelContainer">
    <div id="filterPanel" v-if="!collapsed">
      <h2>Filter Panel</h2>
      <div v-for="category in gamesByCategory" class="category" :key="category.id">
        <h4 class="category-title">
          <input type="checkbox" class="category-checkbox" :id="category.id" v-bind.prop="getCategoryCheckStatus(category)" @change="categoryStateChange(category, $event)"/>
            <label class="category-label" :for="category.id">
              <div class="category-checkbox-replacement"/>
              <div class="category-name">{{ category.name }}</div>
            </label>
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

export default {
  name: 'filterPanel',
  components: {
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

.category-title {
  --category-height: 50px;
  position: relative;
  background: blue;
  color: white;
  height: var(--category-height);
  border-radius: calc(var(--category-height)/2);
  display: flex;
  align-items: center;
}
.category-checkbox {
  appearance: none;
  margin: 0;
}
.category-label {
  flex: 1;
  height: 100%;
}
/* inner circle representing checked status */
.category-checkbox:checked + .category-label .category-checkbox-replacement:before {
  content: " ";
  background: white;
  --check-size: 9px;
  --check-position: calc((var(--checkbox-size) - var(--checkbox-border) * 2 - var(--check-size))/2);
  position: absolute;
  top: var(--check-position);
  left: var(--check-position);
  height: var(--check-size);
  width: var(--check-size);
  border-radius: calc(var(--check-size)/2);
}
/* inner half-circle representing indeterminate status */
.category-checkbox:indeterminate+ .category-label .category-checkbox-replacement:before {
  content: " ";
  background: white;
  --check-size: 9px;
  --check-position: calc((var(--checkbox-size) - var(--checkbox-border) * 2 - var(--check-size))/2);
  position: absolute;
  top: var(--check-position);
  left: var(--check-position);
  height: var(--check-size);
  width: calc(var(--check-size)/2);
  border-bottom-left-radius: calc(var(--check-size)/2);
  border-top-left-radius: calc(var(--check-size)/2);
}
/* Outside circle representing checkbox */
.category-checkbox-replacement {
  --checkbox-size: 23px;
  --checkbox-position: calc((var(--category-height) - var(--checkbox-size))/2);
  --checkbox-border: 4px;
  position: absolute;
  top: var(--checkbox-position);
  left: var(--checkbox-position);
  height: var(--checkbox-size);
  width: var(--checkbox-size);
  border-radius: calc(var(--checkbox-size)/2);
  border: var(--checkbox-border) solid white;
}
.category-name {
  margin-left: 50px;
  line-height: var(--category-height);
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
