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
    <div class="flex items-center">
      <h5 class="text-md font-bold text-gray-800 w-24">Wi-Fi模式</h5>
      <div class="flex shrink-0">
        <el-tooltip effect="light">
          <template #content>
            <p>热点+终端模式并存会影响稳定性。且保持热点开启会增加功耗。</p>
            <p>
              <el-text size="small">智能模式：</el-text>
              成功连接Wi-Fi，10秒后自动关闭热点；断开连接，5秒后自动打开热点
            </p>
            <p>
              <el-text size="small">热点+终端共存模式：</el-text>
              方便使用，但是影响稳定性
            </p>
            <p>
              <el-text size="small">单热点模式缺点：</el-text>
              无网络
            </p>
          </template>
          <InlineSvg name="help" class="w-3.5 h-3.5 text-gray-500 cursor-help"></InlineSvg>
        </el-tooltip>
      </div>
      <el-select v-model="wifiMode" placeholder="Select" :disabled="wsStore.state != ControlEvent.CONNECTED">
        <el-option
            v-for="item in wifiModeOptions"
            :key="item.key"
            :value="item.key"
            :label="item.label"
        />
      </el-select>
      <el-button type="primary" @click="wifiChangeMode" :loading="wifiMode_loading">保存</el-button>
    </div>

    <el-divider></el-divider>


    <el-descriptions
        title="Wi-Fi终端(STA)信息(路由器/手机热点等)"
        :column="1"
        border
        class="description-style"
    >
      <template #extra>
        <el-switch v-model="wifiSta_On" :disabled="wsStore.state != ControlEvent.CONNECTED || !wifiAp_On"
                   active-text="已启用" inactive-text="未启用" :loading="wifiMode_loading"
                   :before-change="()=>beforeWifiModeChange('STA')"
        />
      </template>
      <el-descriptions-item label="asd">
        <template #label>
          <div>
            信号强度
          </div>
        </template>
        <template #default>
          {{ wifiStaApInfo.rssi }}
        </template>
      </el-descriptions-item>
      <el-descriptions-item span="1">
        <template #label>
          <div>
            Wi-Fi名(SSID)
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
<!--        <password-viewer :password="wifiStaApInfo.password"></password-viewer>-->
<!--      </el-descriptions-item>-->
      <el-descriptions-item span="4">
        <template #label>
          <div>
            IP(内网地址)
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
        title="Wi-Fi热点(AP)信息(调试器自发热点)"
        :column="1"
        border
        class="description-style"
    >
      <template #extra>
        <el-switch v-model="wifiAp_On" :disabled="wsStore.state != ControlEvent.CONNECTED || !wifiSta_On"
                   :loading="wifiMode_loading" active-text="已开启" inactive-text="未开启"
                   :before-change="()=>beforeWifiModeChange('AP')"
        />
      </template>
      <el-descriptions-item span="6">
        <template #label>
          <div>
            Wi-Fi名(SSID)
          </div>
        </template>
        <div class="flex">
          <el-input v-model="wifiApInfo.ssid"></el-input>
        </div>
      </el-descriptions-item>
      <el-descriptions-item span="6">
        <template #label>
          <div>
            密码
          </div>
        </template>
        <el-input v-model="wifiApInfo.password"></el-input>
      </el-descriptions-item>
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
    <div class="flex justify-center mt-4">
      <el-button type="primary" :loading="wifiMode_loading" @click="wifiApChangeCredential">保存</el-button>
    </div>
    <el-divider></el-divider>
  </div>

</template>

<script setup lang="ts">
import {computed, onMounted, onUnmounted, reactive, ref} from "vue";
import {
  type IWifiMode,
  wifi_ap_get_info,
  wifi_ap_set_credential,
  wifi_connect_to,
  wifi_get_mode,
  wifi_get_scan_list,
  wifi_set_mode,
  wifi_sta_get_ap_info,
  WifiCmd,
  type WifiInfo,
  type WifiList,
  WifiMode,
  type WifiScanInfo,
  type WiFiCredential,
  WifiStatus,
} from "@/api/apiWifi";
import type {FormInstance} from "element-plus";

import InlineSvg from "@/components/InlineSvg.vue";
import type {ApiJsonMsg, ControlMsg} from "@/api";
import {ControlEvent, ControlMsgType, WtModuleID} from "@/api";
import {registerModule, unregisterModule} from "@/router/msgRouter";
import {useWsStore} from "@/stores/websocket";
import {globalNotify, globalNotifyRightSide} from "@/composables/notification";
import {isDevMode} from "@/composables/buildMode";

const formRef = ref<FormInstance>()
let wifiListPlaceholder = ref("我的WIFI")
let ssidValidateForm = reactive({
  wifiSsid: "",
  password: "",
})

let wifiSta_On = ref(false);
const wifiMode_loading = ref(false)

let wifiAp_On = ref(false);

let wifiMode = ref(-1);

const wifiTestString = ref("666");

let wifiModeOptions = [
  {
    label: "智能热点+常开终端（AP+STA）",
    key: WifiMode.WIFI_AP_AUTO_STA_ON,
  }, {
    label: "仅开启热点（AP）",
    key: WifiMode.WIFI_AP_ON_STA_OFF,
  }, {
    label: "[不推荐] 常开热点+常开终端（AP+STA）",
    key: WifiMode.WIFI_AP_STA_ON,
  }, /* {
    value: "仅开启终端（STA）",
    key: 2,
  },*/

]

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
  password: "",
}

let wifiStaApInfo = reactive<WifiInfo>({...defWifiInfo});
let wifiApInfo = reactive<WifiInfo>({...defWifiInfo});

let scanning = ref(false);
let scan_cb: any;
let connectBtnClicked = 0;
let options: Array<WifiScanInfo> = [];
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

const onClientMsg = (msg: ApiJsonMsg) => {
  switch (msg.cmd as WifiCmd) {
    case WifiCmd.UNKNOWN:
      break;
    case WifiCmd.WIFI_API_JSON_STA_GET_AP_INFO: {
      const info = msg as WifiInfo;
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
      const list = msg as WifiList;
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
      const info = msg as WifiInfo;
      Object.assign(wifiApInfo, info);
      break;
    }
    case WifiCmd.WIFI_API_JSON_SET_MODE:
      wifi_get_mode();
      /* falls through */
    case WifiCmd.WIFI_API_JSON_GET_MODE: {
      const modeInfo = msg as IWifiMode;
      wifiMode_loading.value = false;
      if (modeInfo.err !== undefined) {
        globalNotifyRightSide("设置失败", "error");
        return;
      }

      if (modeInfo.status !== undefined) {
        wifiAp_On.value = modeInfo.status === WifiStatus.WIFI_MODE_AP || modeInfo.status === WifiStatus.WIFI_MODE_APSTA;
        wifiSta_On.value = modeInfo.status === WifiStatus.WIFI_MODE_STA || modeInfo.status === WifiStatus.WIFI_MODE_APSTA;
      }
      if (modeInfo.mode !== undefined) {
        if (modeInfo.mode < WifiMode.WIFI_AP_STOP) {
          wifiMode.value = modeInfo.mode;
        } else if (modeInfo.mode === WifiMode.WIFI_AP_START) {
          wifiAp_On.value = true;
        } else if (modeInfo.mode === WifiMode.WIFI_AP_STOP) {
          wifiAp_On.value = false;
        } else if (modeInfo.mode === WifiMode.WIFI_STA_START) {
          wifiSta_On.value = true;
        } else if (modeInfo.mode === WifiMode.WIFI_STA_STOP) {
          wifiSta_On.value = false;
        }
      }
      console.log("@@@", wifiAp_On.value);
      break;
    }
    case WifiCmd.WIFI_API_JSON_AP_SET_CRED: {
      const wifiCred = msg as WiFiCredential;
      if (wifiCred.err !== undefined) {
        globalNotifyRightSide(wifiCred.err, "error");
      } else {
        globalNotifyRightSide("已保存配置", "success");
      }
      wifiMode_loading.value = false;

      break;
    }
    default:
      if (isDevMode()) {
        console.log(msg);
      }
      break;
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
    wifi_get_mode();
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

function beforeWifiModeChange(ap_sta: "AP" | "STA" = "AP") {
  if (ap_sta === "AP") {
    wifiMode_loading.value = true;
    wifi_set_mode(wifiAp_On.value ? WifiMode.WIFI_AP_STOP : WifiMode.WIFI_AP_START);
  } else {
    wifiMode_loading.value = true;
    wifi_set_mode(wifiSta_On.value ? WifiMode.WIFI_STA_STOP : WifiMode.WIFI_STA_START);
  }
  return false;
}

function wifiChangeMode() {
  wifiMode_loading.value = true;
  wifi_set_mode(wifiMode.value);
}

function wifiApChangeCredential() {
  if (wifiApInfo.ssid === "") {
    globalNotifyRightSide("请输入AP名称", "error");
    return;
  }
  wifiMode_loading.value = true;
  wifi_ap_set_credential(wifiApInfo.ssid, wifiApInfo.password);
}

onMounted(() => {
  registerModule(WtModuleID.WIFI, {
    ctrlCallback: onClientCtrl,
    serverJsonMsgCallback: onClientMsg,
    serverBinMsgCallback: () => {},
  });
  wifi_sta_get_ap_info();
  wifi_ap_get_info();
  wifi_get_mode();
});

onUnmounted(() => {
  unregisterModule(WtModuleID.WIFI);
});


</script>


<style scoped>
.description-style :deep(.el-descriptions__label) {
  @apply w-32
}
</style>
