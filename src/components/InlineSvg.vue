<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
});

const icon = defineAsyncComponent(() =>
    import('@/assets/icon/' + `${props.name}.svg`)
);
</script>

<template>
  <component :is="icon" class="fill-current" />
</template>

<style scoped>

</style>