<template>
  <div class="popup" :class="{ hidden: !gameCenter }">
    <button v-on:click="$emit('close')" class="popup-closer"/>
    <div class="popup-content">
      <h3>{{gameCenter? gameCenter.name : ''}}</h3>
      <div v-for="(games, category) in gamesByCategory" class="category" :key="category">
        <h4>{{ category }}</h4>
        <ul>
          <li v-for="game in games" :key="game.name">{{game.name}}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'gameCenterPopup',
  components: {},
  props: ['gameCenter', 'games'],
  computed: {
    gamesByCategory () {
      if (!this.gameCenter) {
        return {}
      }
      const result = {}
      for (let gameId in this.games) {
        if (this.gameCenter.game_ids.includes(gameId)) {
          const game = this.games[gameId]
          const category = game.category
          if (result[category]) {
            result[category].push(game)
          } else {
            result[category] = [game]
          }
        }
      }
      return result
    }
  }
}

</script>

<style scoped>
.popup {
    position: absolute;
    min-width: 580px;
    background-color: white;
    -webkit-filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
    filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
    padding: 15px;
    border-radius: 10px;
    border: 1px solid #ccc;
    bottom: 12px;
    left: -50px;
}
.popup:after, .popup:before {
    top: 100%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
}
.popup:after {
    border-top-color: white;
    border-width: 10px;
    left: 48px;
    margin-left: -10px;
}
.popup:before {
    border-top-color: #cccccc;
    border-width: 11px;
    left: 48px;
    margin-left: -11px;
}
.popup-closer {
    text-decoration: none;
    position: absolute;
    top: 2px;
    right: 8px;
}
.popup-closer:after {
    content: "✖";
}
.popup-content {
    overflow: scroll;
    max-height: 600px;
}
.hidden {
    display: none;
}
</style>
