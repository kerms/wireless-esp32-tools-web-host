<script setup lang="ts">
import {ref} from "vue";

const isChecked = ref(false);

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: false,
  }
});

const clickEmit = defineEmits(['click']);

const handleClick = () => {
  clickEmit('click', props.id, !isChecked.value);
};

</script>

<template>
  <div :class="props.class">
    <input :id="props.id" type="checkbox" class="tgl tgl-skewed" v-model="isChecked" @click="handleClick"/>
    <label data-tg-off="OFF" data-tg-on="ON" :for="props.id" class="tgl-btn"></label>
  </div>
</template>
