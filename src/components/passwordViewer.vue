<template>
  <div class="flex justify-between">
    <p v-if="isPasswordVisible">{{ password }}</p>
    <p v-else>••••••••</p>
    <span @click="togglePasswordVisibility" class="flex items-center">
      <InlineSvg v-show="isPasswordVisible" name="view" width="16"></InlineSvg>
      <InlineSvg v-show="!isPasswordVisible" name="view-hide" width="16"></InlineSvg>
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import InlineSvg from "@/components/InlineSvg.vue";

const isPasswordVisible = ref(false);

defineProps<{
  password: string
}>()

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};
</script>