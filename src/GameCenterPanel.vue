<template>
  <div id="game-center-panel" v-if="gameCenter">
    <div class="panel-header">
      <img :src="`/img/${gameCenter.logo || 'game'}_logo.png`" class="game-center-logo"/>
      <button v-on:click="$emit('close')" class="panel-closer">✖</button>
      <h3 class="name">{{gameCenter.name}}</h3>
    </div>
    <div class="panel-content" :key="gameCenter.name">
      <div class="address">{{gameCenter.address}}</div>
      <div v-for="category in gamesForGameCenterByCategory" class="category" :key="category.id">
        <h4 class="category-title-block" :style="{'background': category.color}">
          {{ category.name }}
        </h4>
        <ul class="games-list">
          <li v-for="game in category.games" :key="game.id" class="game">
            <div class="game-main-info">
              <img :src="`/img/games_logo/${game.id}.png`" class="game-logo" :alt="game.name" :title="game.name"/>
              <span class="count" v-if="game.info.count">×{{game.info.count}}</span>
            </div>
            <ul v-if="game.info.cabs && Object.keys(game.info.cabs).length" class="game-extra-info">
              <li v-for="cab in Object.keys(game.info.cabs)" :key="cab">
                {{game.cabs[cab]}}
                <span class="count" v-if="game.info.cabs[cab]">x{{game.info.cabs[cab]}}</span>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'gameCenterPanel',
  components: {},
  props: ['gameCenter', 'gamesByCategory'],
  computed: {
    gamesForGameCenterByCategory () {
      if (!this.gameCenter) {
        return {}
      }
      const result = []
      for (const category of this.gamesByCategory) {
        const gamesForCategory = category.games.map(game => {
          if (Object.keys(this.gameCenter.games).includes(game.id)) {
            game.info = this.gameCenter.games[game.id]
            return game
          }
          return undefined
        }).filter(g => g)

        if (gamesForCategory.length > 0) {
          result.push({
            id: category.id,
            name: category.name,
            color: category.color,
            games: gamesForCategory
          })
        }
      }
      return result
    }
  }
}

</script>

<style scoped>
#game-center-panel {
  position: absolute;
  width: 20em;
  right: 0;
  z-index: 100;
  height: 100%;
  background: white;
  box-shadow: 0px 0px 5px #bbb;
  display: flex;
  flex-direction: column;
}

@media(max-width: 40em) {
  #game-center-panel {
    width: 100%;
  }
}

.panel-header {
  background: #428df0;
  overflow: auto;
  color: white;
  box-shadow: 2px 2px 3px #ddd;
  flex-shrink: 0;
  padding: 1em;
}

.game-center-logo {
  align-self: center;
}

.name {
  flex: 1;
  margin: 0;
}

.panel-closer {
  position: absolute;
  right: 0.5em;
  top: 0.3em;
  padding: 0;
  border: none;
  color: white;
  background: none;
  font-size: 130%;
}

.panel-content {
  height: 100%;
  padding: 1em;
  overflow-y: auto;
}

.category-title-block {
  --category-height: 3em;
  --checkbox-height: 1.5em;
  color: white;
  height: var(--category-height);
  border-radius: calc(var(--category-height)/2);
  padding-left: calc(var(--category-height)/2);
  box-shadow: 3px 3px 4px #bbb;
  display: flex;
  align-items: center;
}

li.game {
  width:8em;
  margin: 0.3em;
}

.game-main-info {
  display: flex;
  align-items: center;
}

.game-logo {
  width: 6em;
}

.game-main-info .count {
  padding-left: 0.3em;
}

.count {
  font-weight: bold;
}

.game-extra-info li {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.7em;
  letter-spacing: -0.1em;
  padding-right: 0.3em;
}

.game-extra-info .count {
  padding-left: 0.2em;
}

ul {
  list-style-type: none;
  padding: 0;
}

.games-list, .game-extra-info {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

</style>
