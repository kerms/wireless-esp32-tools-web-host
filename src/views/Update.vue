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

          <el-button @click="doUpdate" type="primary" :disabled="!canUpdate">
            更新
          </el-button>
        </div>

      </template>
      <el-descriptions-item label="固件版本">{{ newFmInfo.fm_ver }}</el-descriptions-item>
      <el-descriptions-item label="更新日期">{{ newFmInfo.upd_date }}</el-descriptions-item>
      <el-descriptions-item label="固件大小">{{ newFmInfo.fm_size }}</el-descriptions-item>
      <el-descriptions-item label="更新进度">
        <el-alert v-if="updateStatus === 'OK'" title="更新已完成，重启后，刷新网页生效" type="success" show-icon :closable="false" />
        <el-progress v-else :percentage="updateProgress" :format="format" :status="progressBarStatus"/>
      </el-descriptions-item>
      <el-descriptions-item label="更新内容">
        <pre>{{ newFmInfo.upd_note }}</pre>
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
import type {ApiJsonMsg, ControlMsg} from "@/api";
import {
  type IOTAFmInfo,
  type IOTAProgress,
  wt_ota_do_update, wt_ota_do_url_update,
  wt_ota_get_progress,
  wt_ota_get_update_info,
  WtOTACmd, WtOTAProgressStatus
} from "@/api/apiOTA";
import {ControlEvent, ControlMsgType, WtModuleID} from "@/api";
import {registerModule, unregisterModule} from "@/router/msgRouter";
import {useSystemStore} from "@/stores/useSystemStore";
import {wt_sys_reboot} from "@/api/apiSystem";
import {isDevMode} from "@/composables/buildMode";

const sysStore = useSystemStore();
const showHidden = ref(false)

const format = (percentage: number) => (percentage.toFixed(2) + '%')

const canUpdate = ref(false);
const updateProgress = ref(0);
const updateStatus = ref('');

const progressBarStatus = ref('');

const directLinkUpdate = ref("");

let progressIntervalID = -1;

const newFmInfo = ref({
  fm_size: 0,
  fm_ver: "-",
  upd_date: "-",
  upd_note: "-",
})
const onClientMsg = (msg: ApiJsonMsg) => {
  switch (msg.cmd as WtOTACmd) {
    case WtOTACmd.WT_OTA_GET_UPDATE_INFO: {
      const info = msg as IOTAFmInfo;
      Object.assign(newFmInfo.value, info);
      if (newFmInfo.value.fm_ver !== sysStore.curFmInfo.ver && newFmInfo.value.fm_ver[0] !== '-'
          && updateStatus.value === 'IDLE') {
        canUpdate.value = true;
      }
      break;
    }
    case WtOTACmd.WT_OTA_DO_UPDATE:
      break;
    case WtOTACmd.WT_OTA_GET_PROGRESS: {
      const progress = msg as IOTAProgress;
      updateStatus.value = progress.status;
      if (progress.total_size !== 0) {
        updateProgress.value = (progress.progress / progress.total_size) * 100;
      } else {
        updateProgress.value = 0;
      }
      if (progress.status === WtOTAProgressStatus.IDLE) {
        if (newFmInfo.value.fm_ver !== sysStore.curFmInfo.ver && newFmInfo.value.fm_ver[0] !== '-') {
          canUpdate.value = true;
        }
        if (progressIntervalID >= 0) {
          clearInterval(progressIntervalID);
          progressIntervalID = -1;
        }
        progressBarStatus.value = '';
      } else if (progress.status === WtOTAProgressStatus.FAILED) {
        if (progressIntervalID >= 0) {
          clearInterval(progressIntervalID);
          progressIntervalID = -1;
        }
        progressBarStatus.value = 'exception';
      } else if (progress.status === WtOTAProgressStatus.IN_PROGRESS) {
        if (progressIntervalID < 0) {
          progressIntervalID = setInterval(() => {
            wt_ota_get_progress();
          }, 1000);
        }
        progressBarStatus.value = '';
        canUpdate.value = false;
      } else if (progress.status === WtOTAProgressStatus.OK) {
        if (progressIntervalID >= 0) {
          clearInterval(progressIntervalID);
          progressIntervalID = -1;
        }
        canUpdate.value = false;
        progressBarStatus.value = 'success';
      }
      break;
    }
    default:
      break;
  }

  if (isDevMode()) {
    console.log(msg);
  }
};

const onClientCtrl = (msg: ControlMsg) => {
  if (msg.type !== ControlMsgType.WS_EVENT) {
    return
  }

  if (msg.data === ControlEvent.CONNECTED) {
    wt_ota_get_update_info();
    wt_ota_get_progress();
  }
};

function doUpdate() {
  wt_ota_do_update();
  progressIntervalID = setInterval(() => {
    wt_ota_get_progress();
  }, 1000);
}

function doReboot() {
  wt_sys_reboot();
}

function doDirectLinkUpdate() {
  if (directLinkUpdate.value.length === 0) {
    return;
  }
  progressIntervalID = setInterval(() => {
    wt_ota_get_progress();
  }, 1000);
  wt_ota_do_url_update(directLinkUpdate.value);
}

onMounted(() => {
  registerModule(WtModuleID.OTA, {
    ctrlCallback: onClientCtrl,
    serverJsonMsgCallback: onClientMsg,
    serverBinMsgCallback: () => {
    },
  });

  wt_ota_get_update_info();
  wt_ota_get_progress();

});

onUnmounted(() => {
  unregisterModule(WtModuleID.OTA);
  clearInterval(progressIntervalID);
  progressIntervalID = -1;
});

</script>


<style scoped>
.description-style :deep(.el-descriptions__label) {
  @apply w-32
}
</style>
