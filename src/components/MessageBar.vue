<template>
  <div id="message-bar" :class="{ error }">
    <slot/>
  </div>
</template>

<script>

export default {
  name: 'messagebar',
  props: ['error'],
}
</script>

<style scoped>
#message-bar {
  position: absolute;
  left: 50%;
  top: 1em;
  transform: translate(-50%, 0);
  box-shadow: 2px 2px 3px #0005;
  z-index: 1;
  background-color: white;
  padding: 1em;
  border-radius: 0.2em;
}

#message-bar.error {
background-color: #ffdbe1;
}
</style>
