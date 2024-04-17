<template>
  <div class="text-layout">
    <h1 class="page-title">
      Wi-Fi 配置
    </h1>
    <el-divider></el-divider>

    <h2 class="mb-4 text-xl font-bold tracking-tight md:text-2xl lg:text-3xl">连接Wi-Fi</h2>
    <el-form label-width="auto" ref="formRef" :model="ssidValidateForm" class="m-auto">
      <el-form-item
          label="Wi-Fi名"
          prop="wifiSsid"
          :rules="[
        { required: true, message: '请输入WIFI名'},
      ]"
      >
        <div class="flex w-full">
          <el-autocomplete
              v-model="ssidValidateForm.wifiSsid"
              clearable
              :placeholder="wifiListPlaceholder"
              class="inline-input w-full"
              :fetch-suggestions="querySearch"
              value-key="ssid"
          >
            <template #default="{ item }">
              <div class="flex items-center border-b">
                <InlineSvg :name="item.wifiLogo" class="h-6 pr-4"></InlineSvg>
                <!--                <span class="w-10">{{ item.rssi }}</span>-->
                <div>{{ item.ssid }}</div>
              </div>
            </template>
          </el-autocomplete>
          <div class="h-8">
            <el-button class="h-8" @click="onScanClick">{{ scanText }}</el-button>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="密码">
        <el-input
            v-model="ssidValidateForm.password"
            show-password
            type="password"
            clearable
        />
      </el-form-item>
      <div class="mb-2">
        <el-alert type="info" show-icon>
          如果不是通过透传器的热点连接，更换Wi-Fi将导致此界面与透传器断开连接。
        </el-alert>
      </div>
      <div class="flex justify-center">
        <el-button @click="onConnectClick" type="primary">连接</el-button>
      </div>
    </el-form>

    <el-divider></el-divider>


    <el-descriptions
        title="Wi-Fi终端信息"
        :column="1"
        border
        class="description-style"
    >
      <el-descriptions-item label="asd">
        <template #label >
          <div>
            信号强度
          </div>
        </template>
        <template #default >
          {{ wifiStaApInfo.rssi }}
        </template>
      </el-descriptions-item>
      <el-descriptions-item span="1">
        <template #label>
          <div>
            SSID
          </div>
        </template>
        {{ wifiStaApInfo.ssid }}
      </el-descriptions-item>
<!--      <el-descriptions-item span="6" >-->
<!--        <template #label>-->
<!--          <div>-->
<!--            密码-->
<!--          </div>-->
<!--        </template>-->
<!--        <password-viewer password="asdasdasd"></password-viewer>-->
<!--      </el-descriptions-item>-->
      <el-descriptions-item span="4">
        <template #label>
          <div>
            IP
          </div>
        </template>
        {{ wifiStaApInfo.ip }}
      </el-descriptions-item>
      <el-descriptions-item span="4">
        <template #label>
          <div>
            MAC
          </div>
        </template>
        {{ wifiStaApInfo.mac }}
      </el-descriptions-item>
      <el-descriptions-item span="4">
        <template #label>
          <div>
            网关
          </div>
        </template>
        {{ wifiStaApInfo.gateway }}
      </el-descriptions-item>

      <el-descriptions-item span="4">
        <template #label>
          <div>
            掩码
          </div>
        </template>
        {{ wifiStaApInfo.netmask }}
      </el-descriptions-item>
    </el-descriptions>

    <el-divider></el-divider>

    <el-descriptions
        title="Wi-Fi热点信息"
        :column="1"
        border
        class="description-style"
    >
      <el-descriptions-item span="6">
        <template #label>
          <div>
            SSID
          </div>
        </template>
        {{ wifiApInfo.ssid }}
      </el-descriptions-item>
<!--      <el-descriptions-item span="6">-->
<!--        <template #label>-->
<!--          <div>-->
<!--            密码-->
<!--          </div>-->
<!--        </template>-->
<!--        <password-viewer password="asdasdasd"></password-viewer>-->
<!--      </el-descriptions-item>-->
      <el-descriptions-item span="4">
        <template #label>
          <div>
            IP
          </div>
        </template>
        {{ wifiApInfo.ip }}
      </el-descriptions-item>

      <el-descriptions-item span="4">
        <template #label>
          <div>
            MAC
          </div>
        </template>
        {{ wifiApInfo.mac }}
      </el-descriptions-item>

      <el-descriptions-item span="4">
        <template #label>
          <div>
            网关
          </div>
        </template>
        {{ wifiApInfo.gateway }}
      </el-descriptions-item>

      <el-descriptions-item span="4">
        <template #label>
          <div>
            掩码
          </div>
        </template>
        {{ wifiApInfo.netmask }}
      </el-descriptions-item>
    </el-descriptions>

    <el-divider></el-divider>
  </div>

</template>

<script setup lang="ts">
import {computed, onMounted, onUnmounted, reactive, ref} from "vue";
import {
  wifi_sta_get_ap_info,
  wifi_get_scan_list,
  WifiCmd,
  type WifiInfo,
  type WifiList,
  WifiModuleID,
  wifi_ap_get_info, wifi_connect_to
} from "@/api/apiWifi";
import type {FormInstance} from "element-plus";

import InlineSvg from "@/components/InlineSvg.vue";
import type {ApiJsonMsg, ControlMsg, ServerMsg} from "@/api";
import {ControlEvent, ControlMsgType} from "@/api";
import {registerModule, unregisterModule} from "@/router/msgRouter";
import {useWsStore} from "@/stores/websocket";
import {globalNotify, globalNotifyRightSide} from "@/composables/notification";

const formRef = ref<FormInstance>()
let wifiListPlaceholder = ref("我的WIFI")
let ssidValidateForm = reactive({
  wifiSsid: "",
  password: "",
})


let wsStore = useWsStore();

const defWifiInfo: WifiInfo = {
  cmd: 1,
  module: 1,
  gateway: "未连接",
  ip: "未连接",
  mac: "未连接",
  rssi: 0,
  netmask: "未连接",
  ssid: "未连接",
}

let wifiStaApInfo = reactive<WifiInfo>({...defWifiInfo});
let wifiApInfo = reactive<WifiInfo>({...defWifiInfo});

let scanning = ref(false);
let scan_cb: any;
let connectBtnClicked = 0;
let options: Array<WifiInfo> = [];
const scanText = computed(() => {
  return scanning.value ? "扫描中" : "扫描";
});

const querySearch = (queryString: string, cb: any) => {
  if (scanning.value) {
    scan_cb = cb;
  } else {
    cb(options);
  }
}

const onClientMsg = (msg: ServerMsg) => {
  if (msg.type !== "json") {
    return;
  }

  let json = msg.data as ApiJsonMsg;

  switch (json.cmd as WifiCmd) {
    case WifiCmd.UNKNOWN:
      break;
    case WifiCmd.WIFI_API_JSON_STA_GET_AP_INFO: {
      const info = msg.data as WifiInfo;
      if (info.rssi === 0) {
        Object.assign(wifiStaApInfo, defWifiInfo);
      } else {
        Object.assign(wifiStaApInfo, info);
      }
      if (connectBtnClicked) {
        connectBtnClicked = 0;
        globalNotifyRightSide(wifiStaApInfo.ssid + " 连接成功", "success");
      }
      break;
    }
    case WifiCmd.WIFI_API_JSON_CONNECT:
      break;
    case WifiCmd.WIFI_API_JSON_GET_SCAN: {
      const list = msg.data as WifiList;
      scanning.value = false;
      list.scan_list.forEach(value => {
        if (value.rssi > -50) {
          value.wifiLogo = "wifi-3";
        } else if (value.rssi > -65) {
          value.wifiLogo = "wifi-2";
        } else {
          value.wifiLogo = "wifi-1";
        }
      });
      options = list.scan_list;
      if (scan_cb) {
        scan_cb(options);
        scan_cb = null;
      }
      globalNotifyRightSide("扫描完成", "success");
      break;
    }
    case WifiCmd.WIFI_API_JSON_DISCONNECT:
      break;
    case WifiCmd.WIFI_API_JSON_AP_GET_INFO: {
      const info = msg.data as WifiInfo;
      Object.assign(wifiApInfo, info);
      break;
    }
  }
};

const onClientCtrl = (msg: ControlMsg) => {
  if (msg.type !== ControlMsgType.WS_EVENT) {
    return
  }

  if (msg.data === ControlEvent.DISCONNECTED) {
    Object.assign(wifiStaApInfo, defWifiInfo);
    Object.assign(wifiApInfo, defWifiInfo);
  }

  if (msg.data === ControlEvent.CONNECTED) {
    wifi_sta_get_ap_info();
    wifi_ap_get_info();
  }
};

function onScanClick() {
  if (wsStore.state !== ControlEvent.CONNECTED) {
    globalNotify("调试器未连接", 'error');
    return;
  }
  scanning.value = true;
  wifi_get_scan_list();
}

function onConnectClick() {
  if (wsStore.state !== ControlEvent.CONNECTED) {
    globalNotify("调试器未连接", 'error');
    return;
  }
  if (ssidValidateForm.wifiSsid !== "") {
    wifi_connect_to(ssidValidateForm.wifiSsid, ssidValidateForm.password);
    connectBtnClicked = 1;
  }
}

onMounted(() => {
  registerModule(WifiModuleID, {
    ctrlCallback: onClientCtrl,
    serverMsgCallback: onClientMsg
  });
  wifi_sta_get_ap_info();
  wifi_ap_get_info();
});

onUnmounted(() => {
  unregisterModule(WifiModuleID);
});


</script>


<style scoped>
.description-style :deep(.el-descriptions__label) {
  @apply w-32
}
</style>
