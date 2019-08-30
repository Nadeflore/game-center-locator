<template>
  <div id="gameCenterPanel" v-if="gameCenter">
    <button v-on:click="$emit('close')" class="panel-closer">✖</button>
    <div class="panel-content" :key="gameCenter.name">
      <h3>{{gameCenter.name}}</h3>
      <p>{{gameCenter.address}}</p>
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
#gameCenterPanel {
  position: absolute;
  right: 0;
  z-index: 1;
  height: 100%;
  background: white;
  box-shadow: -1px 1px 4px #bbb;
}

.panel-content {
  width: 20em;
  height: 100%;
  padding: 1em;
  overflow-y: auto;
}

.panel-closer {
  position:absolute;
  right: 0.5em;
  top: 0.5em;
  border: none;
  background: none;
  font-size: 150%;
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
