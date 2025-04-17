<template>
  <div class="checkbox-container" :style="{'--color': color, '--checkbox-size': size}">
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
    event: 'change',
  },
  props: ['id', 'value', 'checked', 'indeterminate', 'color', 'size'],
  computed: {
    isChecked () {
      // Implement v-model like behaviour on checkboxes
      // But instead of having a list of id, it's a list of object containing an id`
      if (Array.isArray(this.checked)) {
        return this.checked.map(o => o.id).includes(this.value)
      } else {
        return this.checked
      }
    },
  },
  methods: {
    change (event) {
      // Implement v-model like behaviour on checkboxes
      // But instead of having a list of id, it's a list of object containing an id`
      if (Array.isArray(this.checked)) {
        const checked = this.checked.slice()
        const found = checked.findIndex(o => o.id === this.value)
        if (found !== -1) {
          checked.splice(found, 1)
        } else {
          checked.push({ id: this.value })
        }
        this.$emit('change', checked)
      } else {
        this.$emit('change', event)
      }
    },
  },
}

</script>

<style>
.checkbox-container {
  --check-size: calc(var(--checkbox-size)/2.5);
  min-height: var(--checkbox-size);
  display: flex;
}
.checkbox {
  appearance: none;
  margin: 0;
  opacity: 0;
}
.checkbox-label {
  display: flex;
  align-items: center;
  flex: 1;
}
/* Outside circle representing checkbox */
.checkbox-display {
  --checkbox-border: calc(var(--checkbox-size)/5.5);
  --check-position: calc(var(--checkbox-size)/2 - var(--checkbox-border) - var(--check-size)/2);
  position: relative;
  height: var(--checkbox-size);
  width: var(--checkbox-size);
  border-radius: calc(var(--checkbox-size)/2);
  border: var(--checkbox-border) solid var(--color);
  flex-shrink: 0;
}
/* inner circle representing checked status */
.checkbox:checked + .checkbox-label .checkbox-display:before {
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
  position: absolute;
  top: var(--check-position);
  left: var(--check-position);
  height: var(--check-size);
  width: calc(var(--check-size)/2);
  border-bottom-left-radius: calc(var(--check-size)/2);
  border-top-left-radius: calc(var(--check-size)/2);
}
.checkbox-label-display {
  margin-left: calc(var(--checkbox-size)/2);
  flex: 1;
}
</style>
