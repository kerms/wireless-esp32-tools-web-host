<template>

  <div class="text-layout">
    <el-divider></el-divider>
    <el-divider>{{ translate('page.feedback') }}</el-divider>
    <el-divider></el-divider>

    <el-descriptions :title="translate('page.feedback') + '/' + translate('suggestion') + '/' + translate('feature')" border :column="1">
      <el-descriptions-item :label="translate('TencentQQGroup')">642246000</el-descriptions-item>
      <el-descriptions-item :label="translate('authorEmail')">kerms@niazo.org</el-descriptions-item>
<!--  TODO: add discord + BiliBili / instagram ?  -->
    </el-descriptions>

  </div>
  <el-divider></el-divider>
</template>


<script setup lang="ts">
import {translate} from "@/locales";
</script>
