<template>
  <div id="game-center-panel" v-if="gameCenter">
    <div class="panel-header">
      <img :src="`img/${gameCenter.logo || 'game'}_logo.png`" class="game-center-logo"/>
      <button v-on:click="$emit('close')" class="panel-closer">✖</button>
      <h3 class="name">{{gameCenter.name}}</h3>
    </div>
    <div class="panel-content" :key="gameCenter.name">
      <div class="address">{{gameCenter.address}}</div>
      <div v-for="category in gamesForGameCenterByCategory" class="category" :key="category.id">
        <h4 class="category-title-block" :style="{'background': category.color}">
          {{ category.name }}
        </h4>
        <ul>
          <li v-for="game in category.games" :key="game.id">{{game.name}}</li>
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
      for (let category of this.gamesByCategory) {
        const gamesForCategory = category.games.filter(game => this.gameCenter.gameIds.includes(game.id))
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
  z-index: 1;
  height: 100%;
  background: white;
  box-shadow: 0px 0px 5px #bbb;
  display: flex;
  flex-direction: column;
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
</style>
