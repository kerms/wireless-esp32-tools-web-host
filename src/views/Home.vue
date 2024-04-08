<template>
  <div class="text-layout">
      <h2 class="page-title">主页</h2>

        <router-link to="/wifi">
          <el-card>
            <p class="text-center">Wi-Fi设置</p>
          </el-card>
        </router-link>

  </div>
</template>

<script setup lang="ts">


import InlineSvg from "@/components/InlineSvg.vue";
</script>