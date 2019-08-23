<template>
  <div id="gameCenterPanel" v-if="gameCenter">
    <button v-on:click="$emit('close')" class="panel-closer">X</button>
    <div class="panel-content">
      <h3>{{gameCenter.name}}</h3>
      <p>{{gameCenter.address}}</p>
      <div v-for="category in gamesForGameCenterByCategory" class="category" :key="category.id">
        <h4>{{ category.name }}</h4>
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
  position: relative;
}

.panel-content {
  width: 20em;
  height: 100%;
  padding: 1em;
  overflow-y: scroll;
}

.panel-closer {
  position:absolute;
  right: 0.5em;
  top: 0.5em;
}
</style>
