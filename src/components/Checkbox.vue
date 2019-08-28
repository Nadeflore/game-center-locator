<template>
  <div class="checkbox-container">
    <input type="checkbox" class="checkbox" :id="id" v-bind.prop="status" @change="$emit('change', $event)"/>
    <label class="checkbox-label" :for="id">
      <div class="checkbox-display"/>
      <div class="checkbox-label-display">{{ label }}</div>
    </label>
  </div>
</template>

<script>

export default {
  name: 'checkbox',
  components: {},
  props: ['id', 'label', 'status']
}

</script>

<style>
.checkbox-container {
  --block-height: 50px;
  position: relative;
  height: var(--block-height);
  display: flex;
}
.checkbox {
  appearance: none;
  margin: 0;
}
.checkbox-label {
  height: 100%;
}
/* inner circle representing checked status */
.checkbox:checked + .checkbox-label .checkbox-display:before {
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
.checkbox:indeterminate + .checkbox-label .checkbox-display:before {
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
.checkbox-display {
  --checkbox-size: 23px;
  --checkbox-position: calc((var(--block-height) - var(--checkbox-size))/2);
  --checkbox-border: 4px;
  position: absolute;
  top: var(--checkbox-position);
  left: var(--checkbox-position);
  height: var(--checkbox-size);
  width: var(--checkbox-size);
  border-radius: calc(var(--checkbox-size)/2);
  border: var(--checkbox-border) solid white;
}
.checkbox-label-display {
  margin-left: 50px;
  line-height: var(--block-height);
}
</style>
