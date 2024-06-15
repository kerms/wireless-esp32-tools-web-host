<template>
  <div class="text-layout description-style">
    <h1 class="page-title">
      固件更新
    </h1>
    <p class="text-center">(需联网)</p>
    <el-divider></el-divider>

    <el-descriptions title="当前版本" border :column="1">
      <el-descriptions-item label="硬件版本">{{ sysStore.hwInfo.ver }}</el-descriptions-item>
      <el-descriptions-item label="固件版本">{{ sysStore.curFmInfo.ver }}</el-descriptions-item>
      <el-descriptions-item label="固件日期">{{ sysStore.curFmInfo.date }}</el-descriptions-item>
    </el-descriptions>

    <el-divider></el-divider>

    <el-descriptions title="最新版本" border :column="1">
      <template #extra>
        <div class="flex">
          <el-tooltip placement="top" effect="light">
            <template #content>
              <p>2秒延迟后重启</p>
            </template>
            <el-button @click="doReboot" type="warning" :disabled="sysStore.rebootInProgress">
              重启{{ sysStore.rebootInProgress ? '中' : ''}}
            </el-button>
          </el-tooltip>

          <el-button @click="doUpdate" type="primary" :disabled="!updateStore.canUpdate">
            更新
          </el-button>
        </div>

      </template>
      <el-descriptions-item label="固件版本">{{ updateStore.newFmInfo.fm_ver }}</el-descriptions-item>
      <el-descriptions-item label="更新日期">{{ updateStore.newFmInfo.upd_date }}</el-descriptions-item>
      <el-descriptions-item label="固件大小">{{ updateStore.newFmInfo.fm_size }}</el-descriptions-item>
      <el-descriptions-item label="更新进度">
        <el-alert v-if="updateStore.updateStatus === 'OK'" title="更新已完成，重启后，刷新网页生效" type="success" show-icon :closable="false" />
        <el-progress v-else :percentage="updateStore.updateProgress" :format="format" :status="updateStore.progressBarStatus"/>
      </el-descriptions-item>
      <el-descriptions-item label="更新内容">
        <pre>{{ updateStore.newFmInfo.upd_note }}</pre>
      </el-descriptions-item>
    </el-descriptions>

    <el-divider @click="showHidden = !showHidden">底部</el-divider>
    <div v-if="showHidden">
      <p>直链更新（仅用于测试，请勿使用）</p>
      <el-input placeholder="https://..." v-model="directLinkUpdate"></el-input>
      <el-button type="primary" @click="doDirectLinkUpdate">更新</el-button>
    </div>

  </div>

</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref} from "vue";
import {
  wt_ota_do_update, wt_ota_do_url_update,
  wt_ota_get_progress, wt_ota_get_update_info,
} from "@/api/apiOTA";
import {useSystemStore} from "@/stores/useSystemStore";
import {wt_sys_reboot} from "@/api/apiSystem";
import {useUpdateStore} from "@/stores/useUpdateStore";

const sysStore = useSystemStore();
const updateStore = useUpdateStore();
const showHidden = ref(false)

const directLinkUpdate = ref("");

const format = (percentage: number) => (percentage.toFixed(2) + '%')

function doUpdate() {
  wt_ota_do_update();
  updateStore.setProgressInterval();
}

function doReboot() {
  wt_sys_reboot();
}

function doDirectLinkUpdate() {
  if (directLinkUpdate.value.length === 0) {
    return;
  }
  updateStore.setProgressInterval();
  wt_ota_do_url_update(directLinkUpdate.value);
}

onMounted(() => {
  wt_ota_get_update_info();
  wt_ota_get_progress();
});

onUnmounted(() => {
  updateStore.clearProgressInterval();
});

</script>

<style scoped>
.description-style :deep(.el-descriptions__label) {
  @apply w-32
}
</style>
