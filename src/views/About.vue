<script setup lang="ts">
import {useSystemStore} from "@/stores/useSystemStore";
import {translate} from "@/locales";

const version = import.meta.env.VITE_APP_GIT_TAG || "v0.0.0";
const compileTime = import.meta.env.VITE_APP_LAST_COMMIT || "1970-00-00";
const sysStore = useSystemStore();
</script>

<template>
  <div class="text-layout">
    <el-divider></el-divider>
    <el-divider>{{ translate('page.about') }}</el-divider>
    <el-divider></el-divider>
    <el-collapse>
      <el-collapse-item :title="translate('aboutWebHost')">
        <el-descriptions border :column="1" class="mt-5 description-style">
          <el-descriptions-item :label="translate('version')">{{ version }}</el-descriptions-item>
          <el-descriptions-item :label="translate('releaseTime')">{{ compileTime }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions :title="translate('credit')" border :column="1" class="mt-5 description-style">
          <el-descriptions-item label="vuejs"><a target="_blank" href="https://github.com/vuejs/vue/blob/main/LICENSE">MIT</a>
          </el-descriptions-item>
          <el-descriptions-item label="typescript"><a
              href="https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt">Apache 2.0</a></el-descriptions-item>
          <el-descriptions-item label="vite"><a target="_blank" href="https://github.com/vitejs/vite/blob/main/LICENSE">MIT</a>
          </el-descriptions-item>
          <el-descriptions-item label="tailwindcss"><a
              href="https://github.com/tailwindlabs/tailwindcss/blob/master/LICENSE">MIT</a></el-descriptions-item>
          <el-descriptions-item label="element-plus"><a
              href="https://github.com/element-plus/element-plus/blob/dev/LICENSE">MIT</a></el-descriptions-item>
          <el-descriptions-item label="pinia"><a target="_blank" href="https://github.com/vuejs/pinia/blob/v2/LICENSE">MIT</a>
          </el-descriptions-item>
          <el-descriptions-item label="mitt"><a target="_blank" href="https://github.com/developit/mitt/blob/main/LICENSE">MIT</a>
          </el-descriptions-item>
          <el-descriptions-item label="vue-router"><a
              href="https://github.com/vuejs/vue-router/blob/dev/LICENSE">MIT</a></el-descriptions-item>
          <el-descriptions-item label="vue-i18n"><a target="_blank" href="https://github.com/kazupon/vue-i18n?tab=MIT-1-ov-file#readme">MIT</a>
          </el-descriptions-item>
          <el-descriptions-item label="lightningcss"><a
              href="https://github.com/parcel-bundler/lightningcss/blob/master/LICENSE">MPL-2.0 license</a>
          </el-descriptions-item>
        </el-descriptions>
      </el-collapse-item>
      <el-collapse-item :title="translate('aboutDebugger')">
        <el-descriptions border :column="1" class="mt-5 description-style">
          <el-descriptions-item :label="translate('officialWebsite')"><a target="_blank" href="https://yunsi.studio/wireless-debugger">https://yunsi.studio/wireless-debugger</a></el-descriptions-item>
          <el-descriptions-item :label="translate('version')">{{ sysStore.curFmInfo.ver }}</el-descriptions-item>
          <el-descriptions-item :label="translate('releaseTime')">{{ sysStore.curFmInfo.date }}</el-descriptions-item>
          <el-descriptions-item :label="translate('serialNumber')">{{ sysStore.sysInfo.sn }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions :title="translate('credit')" border :column="1" class="mt-5 description-style">
          <el-descriptions-item label="windowsair"><a target="_blank" href="https://github.com/windowsair/wireless-esp8266-dap">wireless-esp8266-dap</a>
          </el-descriptions-item>
        </el-descriptions>
      </el-collapse-item>
    </el-collapse>


    <el-descriptions :title="translate('author') + ' :空空(kerms)'" border :column="1" class="mt-5 description-style">
      <el-descriptions-item :label="translate('officialWebsite')"><a target="_blank" href="https://yunsi.studio/">https://yunsi.studio/</a></el-descriptions-item>
      <el-descriptions-item label="github"><a target="_blank" href="https://github.com/kerms">https://github.com/kerms</a>
      </el-descriptions-item>
      <el-descriptions-item :label="translate('email')">kerms@niazo.org</el-descriptions-item>
      <el-descriptions-item label="BiliBili"><a target="_blank" href="https://space.bilibili.com/3461571571353885">3461571571353885</a>
      </el-descriptions-item>
      <el-descriptions-item :label="translate('TencentQQGroup')">642246000</el-descriptions-item>
      <el-descriptions-item :label="translate('note')">{{ translate('welcomeMessage') }}</el-descriptions-item>
    </el-descriptions>
  </div>
  <el-divider></el-divider>

</template>

<style scoped lang="postcss">
.description-style :deep(.el-descriptions__label) {
  @apply w-32
}

</style>