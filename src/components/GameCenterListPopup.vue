<template>
  <div class="popup">
    <ul>
      <li v-for="gc in clickedGameCenters" :key="gc.name">
        <router-link :to="{query: {...$route.query, selected: gc.name}}">
          <img class="list-icon" :src="getIconUrlForGameCenter(gc)"/>
          {{gc.name}}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import { getIconUrlForGameCenter } from '../utils/imageUtils.js'

export default {
  name: 'gamecenterlistpopup',
  props: ['clickedGameCenters'],
  methods: {
    getIconUrlForGameCenter,
  },
}
</script>

<style scoped>
.popup {
  background: #fcfdfd;
  overflow: auto;
  box-shadow: 2px 2px 3px #0005;
}

a {
  text-decoration: none;
  color: #1025D2;
}

a:hover {
  text-decoration: underline;
}

.popup ul {
  margin: 0;
}

.popup li a {
  display: flex;
  align-items:center;
  margin: 0.5em;
}

.list-icon {
  width: 44px;
  height: 44px;
}
</style>
