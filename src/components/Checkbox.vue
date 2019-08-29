<template>
  <div class="checkbox-container" :style="{'--color': color}">
    <input type="checkbox" class="checkbox" :checked="isChecked" :indeterminate.prop="indeterminate" :id="id" :value="value" @change="change($event)"/>
    <label class="checkbox-label" :for="id">
      <div class="checkbox-display"/>
      <div class="checkbox-label-display">
        <slot/>
      </div>
    </label>
  </div>
</template>

<script>

export default {
  name: 'checkbox',
  model: {
    prop: 'checked',
    event: 'change'
  },
  props: ['id', 'value', 'checked', 'indeterminate', 'color'],
  computed: {
    isChecked () {
      // Re-implement v-model behaviour on checkboxes
      if (Array.isArray(this.checked)) {
        return this.checked.includes(this.value)
      } else {
        return this.checked
      }
    }
  },
  methods: {
    change (event) {
      // Re-implement v-model behaviour on checkboxes
      if (Array.isArray(this.checked)) {
        const checked = this.checked.slice()
        const found = checked.indexOf(this.value)
        if (found !== -1) {
          checked.splice(found, 1)
        } else {
          checked.push(this.value)
        }
        this.$emit('change', checked)
      } else {
        this.$emit('change', event)
      }
    }
  }
}

</script>

<style>
.checkbox-container {
  --block-height: 3em;
  --check-size: calc(var(--block-height)/5);
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
  display: flex;
  align-items: center;
}
/* Outside circle representing checkbox */
.checkbox-display {
  --checkbox-size: calc(var(--block-height)/2);
  --checkbox-position: calc((var(--block-height) - var(--checkbox-size))/2);
  --checkbox-border: calc(var(--block-height)/11);
  position: absolute;
  top: var(--checkbox-position);
  left: var(--checkbox-position);
  height: var(--checkbox-size);
  width: var(--checkbox-size);
  border-radius: calc(var(--checkbox-size)/2);
  border: var(--checkbox-border) solid var(--color);
}
/* inner circle representing checked status */
.checkbox:checked + .checkbox-label .checkbox-display:before {
  --check-position: calc((var(--checkbox-size) - var(--checkbox-border) * 2 - var(--check-size))/2);
  content: " ";
  background: var(--color);
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
  background: var(--color);
  --check-position: calc((var(--checkbox-size) - var(--checkbox-border) * 2 - var(--check-size))/2);
  position: absolute;
  top: var(--check-position);
  left: var(--check-position);
  height: var(--check-size);
  width: calc(var(--check-size)/2);
  border-bottom-left-radius: calc(var(--check-size)/2);
  border-top-left-radius: calc(var(--check-size)/2);
}
.checkbox-label-display {
  margin-left: var(--block-height);
}
</style>
