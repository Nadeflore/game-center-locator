<template>
  <div id="filter-panel" :class="{ collapsed }">
    <div id="filter-panel-header">
      <h2>絞り込み</h2>
    </div>
    <button id="panel-tab" @click="toogleCollapse">{{collapsed ? '▶' : '◀'}}</button>
    <div id="filter-panel-content">
      <div v-for="category in gamesByCategory" class="category" :key="category.id">
        <h4 class="category-title-block" :style="{'background': category.color}">
          <Checkbox class="category-checkbox" :id="category.id" :value="category.id" :checked="getCategoryChecked(category)" :indeterminate="getCategoryIndeterminate(category)" @change="categoryStateChange(category, $event)" color="white" size="1.5em">
            {{category.name}}
          </Checkbox>
          <button class="category-toogle-button" @click="toogleCategory(category.id)">▼</button>
        </h4>
        <ul v-show="expandedCategoryIds.includes(category.id)" class="games-list">
          <li v-for="game in category.games" :key="game.id" class="game">
            <Checkbox :id="game.id" :value="game.id" v-model="selectedGameIds" color="black" size="1em">
              <img :src="`/img/games_logo/${game.id}.png`" class="game-logo" :alt="game.name" :title="game.name"/>
            </Checkbox>
            <ul v-if="game.cabs && Object.keys(game.cabs).length" class="cabs">
              <li v-for="cab in Object.keys(game.cabs)" :key="cab">
                <Checkbox class="cab-checkbox" :id="game.id + '[' + cab + ']'" :value="game.id + '[' + cab + ']'" v-model="selectedGameIds" color="black" size="1em">
                  {{game.cabs[cab]}}</Checkbox>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <h3>ゲーム数</h3>
      <div class="slidecontainer">
        <input type="range" min="1" :max="rangeMaximum" v-model.number="gameAmountFilter" class="slider">
      </div>
        <p>
        Show game centers with {{(gameAmountFilter > 1 && gameAmountFilter === selectedGameIds.length ? 'all' : 'at least ' + gameAmountFilter) + (this.selectedGameIds.length > 0 ? ' of the selected' : '') + ' games'}}
        </p>
    </div>
  </div>
</template>

<script>
import Checkbox from './components/Checkbox.vue'

export default {
  name: 'filterPanel',
  components: {
    Checkbox
  },
  props: ['gamesByCategory', 'defaultSelectedGameIds', 'defaultGameAmountFilter'],
  data () {
    return {
      selectedGameIds: this.defaultSelectedGameIds,
      gameAmountFilter: this.defaultGameAmountFilter,
      collapsed: true,
      expandedCategoryIds: []
    }
  },
  computed: {
    totalGames () {
      let total = 0
      for (const category of this.gamesByCategory) {
        total += category.games.length
      }
      return total
    },
    rangeMaximum () {
      return this.selectedGameIds.length || this.totalGames
    }
  },
  methods: {
    getCategoryChecked (category) {
      return category.gameIds.every(gameId => this.selectedGameIds.includes(gameId))
    },
    getCategoryIndeterminate (category) {
      const allSelected = this.getCategoryChecked(category)
      const someSelected = category.gameIds.some(gameId => this.selectedGameIds.includes(gameId))
      return someSelected && !allSelected
    },
    categoryStateChange (category, event) {
      if (event.target.checked) {
        // Add all games of this category
        const gameIdsToAdd = category.gameIds.filter(gameId => !this.selectedGameIds.includes(gameId))
        this.selectedGameIds = this.selectedGameIds.concat(gameIdsToAdd)
      } else {
        // Remove all games of this category
        this.selectedGameIds = this.selectedGameIds.filter(gameId => !category.gameIds.includes(gameId))
      }
    },
    toogleCollapse () {
      this.collapsed = !this.collapsed
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
      if (val.length !== 0) {
        if (this.gameAmountFilter > val.length) {
          // Make sure the value of the slider is not more than the maximum
          this.gameAmountFilter = val.length
        } else if (this.gameAmountFilter > 1 &&
          this.gameAmountFilter === oldVal.length) {
          // If the value of the slider was the maximum, keep the maximum value
          this.gameAmountFilter = val.length
        }
      }
      this.$emit('change', val, this.gameAmountFilter)
    },
    gameAmountFilter (val) {
      this.$emit('change', this.selectedGameIds, val)
    }
  }
}
</script>

<style scoped>
#filter-panel {
  width: 20em;
  position: absolute;
  display: flex;
  flex-direction: column;
  z-index: 1;
  height: 100%;
  background: white;
  box-shadow: 3px 3px 4px #0003;
}

@media(max-width: 40em) {
  #filter-panel:not(.collapsed) {
    width: 100%;
  }

  #filter-panel:not(.collapsed) #panel-tab {
    right: 0;
    box-shadow: none;
  }
}

#filter-panel.collapsed {
  left: -20em;
}

#filter-panel-header {
  height: 3em;
  padding-left: 2em;
  background: #428df0;
  color: white;
  box-shadow: 2px 2px 3px #0005;
  display: flex;
  align-items: center;
}

h2 {
  margin: 0;
  font-size: 140%;
}

#panel-tab {
  position: absolute;
  border-top-right-radius: 1.5em;
  border-bottom-right-radius: 1.5em;
  right: -3em;
  top: 0;
  width: 3em;
  height: 3em;
  background: #428df0;
  color: white;
  padding-right: 1em;
  padding-bottom: 0.1em;
  z-index: 1;
  box-shadow: 3px 3px 4px #0005;
}

#filter-panel-content {
  flex: 1;
  padding: 1em;
  overflow-y: auto;
}

.category-title-block {
  --category-height: 3em;
  --checkbox-height: 1.5em;
  color: white;
  background: black;
  height: var(--category-height);
  border-radius: calc(var(--category-height)/2);
  padding-left: calc((var(--category-height) - var(--checkbox-height))/2);
  box-shadow: 3px 3px 4px #bbb;
  margin-top: 0;
  margin-bottom: 1em;
  display: flex;
}
.category-checkbox {
  flex: 1;
}
.category-toogle-button {
  color: white;
  height: 100%;
  padding: 0 1.5em;
}
ul {
  list-style-type: none;
  padding-left: 0.5em;
}
.games-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.game {
  margin: 0.3em;
}

.cabs li {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.7em;
  letter-spacing: -0.105em;
}

button {
  background: none;
  border: none;
  font-size: 100%;
}

button::-moz-focus-inner {
  border: 0;
}
button:focus {
  outline: none;
}

/* Slider style */
.slider {
  --slider-height: 1em;
  width: 100%;
  height: var(--slider-height);
  border-radius: calc(var(--slider-height)/2);
  appearance: none;
  background: #d3d3d3;
}
.slider::-moz-range-thumb {
  width: calc(2*var(--slider-height));
  height: calc(2*var(--slider-height));
  border-radius: var(--slider-height);
  border: none;
  appearance: none;
  background: #48f;
}
.slider::-webkit-slider-thumb {
  width: calc(2*var(--slider-height));
  height: calc(2*var(--slider-height));
  border-radius: var(--slider-height);
  border: none;
  appearance: none;
  background: #48f;
}
.game-logo {
  width: 6em;
}
</style>
