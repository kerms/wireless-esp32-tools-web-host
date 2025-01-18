<template>
  <div class="text-layout">
    <h1 class="page-title">
      Wi-Fi {{ translate('wifi.settings') }}
    </h1>
    <el-divider></el-divider>

    <h2 class="mb-4 text-xl font-bold tracking-tight md:text-2xl lg:text-3xl">{{ translate('wifi.connection') }} Wi-Fi</h2>
    <el-form label-width="auto" ref="formRef" :model="ssidValidateForm" class="m-auto">
      <el-form-item
          label="Wi-Fi"
          prop="wifiSsid"
          :rules="[
        { required: true, message: translate('wifi.warnWifiName')},
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
      <el-form-item :label="translate('wifi.password')">
        <el-input
            v-model="ssidValidateForm.password"
            show-password
            type="password"
            clearable
        />
      </el-form-item>
      <div class="mb-2">
        <el-alert type="info" show-icon>
          {{ translate("wifi.connectInfo")}}
        </el-alert>
      </div>
      <div class="flex justify-center">
        <el-button @click="onConnectClick" type="primary">{{ translate('wifi.connect') }}</el-button>
      </div>
    </el-form>

    <el-divider></el-divider>
    <div class="flex items-center">
      <h5 class="text-md font-bold text-gray-800 w-32">Wi-Fi {{ translate('wifi.mode') }}</h5>
      <div class="flex shrink-0">
        <el-tooltip effect="light">
          <template #content>
            <div v-html="translate('wifi.modeTipsHtml')"></div>
          </template>
          <InlineSvg name="help" class="w-3.5 h-3.5 text-gray-500 cursor-help"></InlineSvg>
        </el-tooltip>
      </div>
      <el-select v-model="wifiMode" :disabled="wsStore.state != ControlEvent.CONNECTED">
        <el-option
            v-for="item in wifiModeOptions"
            :key="item.key"
            :value="item.key"
            :label="item.label"
        />
      </el-select>
      <el-button type="primary" @click="wifiChangeMode" :loading="wifiMode_loading">{{ translate('wifi.save') }}</el-button>
    </div>

    <el-divider></el-divider>


    <el-descriptions
        :title="'Wi-Fi ' + translate('wifi.stationInfo')"
        :column="1"
        border
        class="description-style"
    >
      <template #extra>
        <el-switch v-model="wifiSta_On" :disabled="wsStore.state != ControlEvent.CONNECTED || !wifiAp_On"
                   :active-text="translate('wifi.enabled')" :inactive-text="translate('wifi.disabled')" :loading="wifiMode_loading"
                   :before-change="()=>beforeWifiModeChange('STA')"
        />
      </template>
      <el-descriptions-item span="4">
        <template #label>
          <div>
            {{ translate('wifi.signalStrength') }}
          </div>
        </template>
        <template #default>
          <p>{{ wifiStaApInfo.rssi }}</p>
        </template>
      </el-descriptions-item>
      <el-descriptions-item span="4">
        <template #label>
          <div>
            Wi-Fi(SSID)
          </div>
        </template>
        <p>{{ wifiStaApInfo.ssid }}</p>
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
            MAC
          </div>
        </template>
        <p>{{ wifiStaApInfo.mac }}</p>
      </el-descriptions-item>
      <el-descriptions-item span="4">
        <template #label>
          <div>IP({{ translate('wifi.internalAddress') }})</div>
        </template>
        <p>{{ wifiStaApInfo.ip }}</p>
      </el-descriptions-item>
      <el-descriptions-item span="4">
        <template #label>
          <div>
            {{ translate('wifi.gateway') }}
          </div>
        </template>
        <p>{{ wifiStaApInfo.gateway }}</p>
      </el-descriptions-item>
      <el-descriptions-item span="4">
        <template #label>
          <div>
            {{ translate('wifi.netmask') }}
          </div>
        </template>
        <p>{{ wifiStaApInfo.netmask }}</p>
      </el-descriptions-item>
      <el-descriptions-item span="4">
        <template #label>
          <div>
            {{ translate('wifi.primaryDNS') }}
          </div>
        </template>
        <p>{{ wifiStaApInfo.dns_main }}</p>
      </el-descriptions-item>
      <el-descriptions-item span="4">
        <template #label>
          <div>
            {{ translate('wifi.backupDNS') }}
          </div>
        </template>
        <p>{{ wifiStaApInfo.dns_backup }}</p>
      </el-descriptions-item>

      <el-descriptions-item span="4">
        <template #label>
          <div>
            {{ translate('wifi.IPmode') }}
          </div>
        </template>
        <el-select v-model="wifiStaticInfo.static_ip_en" :disabled="wsStore.state != ControlEvent.CONNECTED">
          <el-option
              v-for="item in staIPModeOptions"
              :key="item.key"
              :value="item.key"
              :label="item.label"
          />
        </el-select>
      </el-descriptions-item>
      <el-descriptions-item span="4" v-if="wifiStaticInfo.static_ip_en">
        <template #label>
          <div>IP({{ translate('wifi.internalAddress') }})</div>
        </template>
        <el-input v-model="wifiStaticInfo.ip"></el-input>
      </el-descriptions-item>
      <el-descriptions-item span="4" v-if="wifiStaticInfo.static_ip_en">
        <template #label>
          <div>
            {{ translate('wifi.gateway') }}
          </div>
        </template>
        <el-input v-model="wifiStaticInfo.gateway"></el-input>
      </el-descriptions-item>
      <el-descriptions-item span="4" v-if="wifiStaticInfo.static_ip_en">
        <template #label>
          <div>
            {{ translate('wifi.netmask') }}
          </div>
        </template>
        <el-input v-model="wifiStaticInfo.netmask"></el-input>
      </el-descriptions-item>

      <el-descriptions-item span="4">
        <template #label>
          <div>
            {{ translate('wifi.DNSmode') }}
          </div>
        </template>
        <el-select v-model="wifiStaticInfo.static_dns_en" :disabled="wsStore.state != ControlEvent.CONNECTED">
          <el-option
              v-for="item in staDNSModeOptions"
              :key="item.key"
              :value="item.key"
              :label="item.label"
          />
        </el-select>
      </el-descriptions-item>
      <el-descriptions-item span="4" v-if="wifiStaticInfo.static_dns_en">
        <template #label>
          <div>
            {{ translate('wifi.primaryDNS') }}
          </div>
        </template>
        <el-input v-model="wifiStaticInfo.dns_main"></el-input>
      </el-descriptions-item>
      <el-descriptions-item span="4" v-if="wifiStaticInfo.static_dns_en">
        <template #label>
          <div>
            {{ translate('wifi.backupDNS') }}
          </div>
        </template>
        <el-input v-model="wifiStaticInfo.dns_backup"></el-input>
      </el-descriptions-item>
    </el-descriptions>
    <div class="flex justify-center mt-4">
      <el-button type="primary" :loading="wifiMode_loading" @click="wifiStaSetStaticInfo">{{ translate('wifi.save') }}</el-button>
    </div>

    <el-divider></el-divider>

    <el-descriptions
        :title="'Wi-Fi ' + translate('wifi.hotspotInfo')"
        :column="1"
        border
        class="description-style"
    >
      <template #extra>
        <el-switch v-model="wifiAp_On" :disabled="wsStore.state != ControlEvent.CONNECTED || !wifiSta_On"
                   :loading="wifiMode_loading" :active-text="translate('wifi.enabled')" :inactive-text="translate('wifi.disabled')"
                   :before-change="()=>beforeWifiModeChange('AP')"
        />
      </template>
      <el-descriptions-item span="6">
        <template #label>
          <div>
            Wi-Fi(SSID)
          </div>
        </template>
        <div class="flex">
          <el-input v-model="wifiApInfo.ssid"></el-input>
        </div>
      </el-descriptions-item>
      <el-descriptions-item span="6">
        <template #label>
          <div>
            {{ translate('wifi.password') }}
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
            {{ translate('wifi.gateway') }}
          </div>
        </template>
        {{ wifiApInfo.gateway }}
      </el-descriptions-item>

      <el-descriptions-item span="4">
        <template #label>
          <div>
            {{ translate('wifi.netmask') }}
          </div>
        </template>
        {{ wifiApInfo.netmask }}
      </el-descriptions-item>
    </el-descriptions>
    <div class="flex justify-center mt-4">
      <el-button type="primary" :loading="wifiMode_loading" @click="wifiApChangeCredential">{{ translate('wifi.save') }}</el-button>
    </div>
    <el-divider></el-divider>
  </div>

</template>

<script setup lang="ts">
import {computed, type ComputedRef, onMounted, onUnmounted, reactive, ref} from "vue";
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
  WifiStatus, wifi_sta_get_static_info,
  type IWifiStaStaticInfo, wifi_sta_set_static_conf,
} from "@/api/apiWifi";
import type {FormInstance} from "element-plus";

import InlineSvg from "@/components/InlineSvg.vue";
import type {ApiJsonMsg, ControlMsg} from "@/api";
import {ControlEvent, ControlMsgType, WtModuleID} from "@/api";
import {registerModule, unregisterModule} from "@/router/msgRouter";
import {useWsStore} from "@/stores/websocket";
import {globalNotify, globalNotifyRightSide} from "@/composables/notification";
import {isDevMode} from "@/composables/buildMode";
import {translate} from "@/locales";

const formRef = ref<FormInstance>()
let wifiListPlaceholder = ref("MY-WIFI")
let ssidValidateForm = reactive({
  wifiSsid: "",
  password: "",
})

let wifiSta_On = ref(false);
const wifiMode_loading = ref(false)

let wifiAp_On = ref(false);

let wifiMode = ref(-1);

let wifiModeOptions = computed( () => [
  {
    label: translate('wifi.APauto_STA'),
    key: WifiMode.WIFI_AP_AUTO_STA_ON,
  }, {
    label: translate('wifi.APonly'),
    key: WifiMode.WIFI_AP_ON_STA_OFF,
  }, {
    label: translate('wifi.AP_STA'),
    key: WifiMode.WIFI_AP_STA_ON,
  }, /*
   {
    value: "仅开启终端（STA）",
    key: 2,
  },*/
])

let wsStore = useWsStore();

const defWifiInfo: ComputedRef<WifiInfo> = computed(() => {
  return {
    cmd: 1,
    module: 1,
    gateway: translate('wifi.disconnected'),
    ip: translate('wifi.disconnected'),
    mac: translate('wifi.disconnected'),
    dns_main: translate('wifi.disconnected'),
    dns_backup: translate('wifi.disconnected'),
    rssi: 0,
    netmask: translate('wifi.disconnected'),
    ssid: translate('wifi.disconnected'),
    password: ""
  };
});

const staIPModeOptions = [
  {
    label: translate('wifi.autoIP'),
    key: 0,
  }, {
    label: translate('wifi.staticIP'),
    key: 1,
  },
]

const staDNSModeOptions = [
  {
    label: translate('wifi.autoDNS'),
    key: 0,
  }, {
    label: translate('wifi.staticDNS'),
    key: 1,
  },
]

let wifiStaApInfo: ComputedRef<WifiInfo> = computed(() => defWifiInfo.value);
let wifiApInfo: ComputedRef<WifiInfo> = computed(() => defWifiInfo.value);
let wifiStaticInfo = reactive<IWifiStaStaticInfo>({
  dns_backup: "0.0.0.0",
  dns_main: "0.0.0.0",
  gateway: "0.0.0.0",
  ip: "0.0.0.0",
  netmask: "0.0.0.0",
  static_dns_en: 0,
  static_ip_en: 0,
});

let scanning = ref(false);
let scan_cb: any;
let connectBtnClicked = 0;
let options: Array<WifiScanInfo> = [];
const scanText = computed(() => {
  return scanning.value ? translate("wifi.scanning") : translate("wifi.scan");
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
        globalNotifyRightSide(wifiStaApInfo.value.ssid + " " + translate('wifi.connectionSuccess'), "success");
        wifi_sta_get_static_info();
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
      globalNotifyRightSide(translate('wifi.scanDone'), "success");
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
        globalNotifyRightSide(translate('wifi.setFailed'), "error");
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
      break;
    }
    case WifiCmd.WIFI_API_JSON_AP_SET_CRED: {
      const wifiCred = msg as WiFiCredential;
      if (wifiCred.err !== undefined) {
        globalNotifyRightSide(wifiCred.err, "error");
      } else {
        globalNotifyRightSide(translate('wifi.setSuccess'), "success");
      }
      wifiMode_loading.value = false;

      break;
    }
    case WifiCmd.WIFI_API_JSON_STA_GET_STATIC_INFO: {
      const staticInfo = msg as IWifiStaStaticInfo & ApiJsonMsg;
      Object.assign(wifiStaticInfo, staticInfo);
      break;
    }
    case WifiCmd.WIFI_API_JSON_STA_SET_STATIC_CONF:
      wifiMode_loading.value = false;
      break;
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
    wifi_sta_get_static_info();
  }
};

function onScanClick() {
  if (wsStore.state !== ControlEvent.CONNECTED) {
    globalNotify(translate('wifi.debuggerNotConnected'), 'error');
    return;
  }
  scanning.value = true;
  wifi_get_scan_list();
}

function onConnectClick() {
  if (wsStore.state !== ControlEvent.CONNECTED) {
    globalNotify(translate('wifi.debuggerNotConnected'), 'error');
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
  wifi_sta_get_ap_info();
  return false;
}

function wifiChangeMode() {
  wifiMode_loading.value = true;
  wifi_set_mode(wifiMode.value);
}

function wifiApChangeCredential() {
  if (wifiApInfo.value.ssid === "") {
    globalNotifyRightSide(translate('wifi.enterAPName'), "error");
    return;
  }
  wifiMode_loading.value = true;
  wifi_ap_set_credential(wifiApInfo.value.ssid, wifiApInfo.value.password);
}

function wifiStaSetStaticInfo() {
  wifiMode_loading.value = true;
  wifi_sta_set_static_conf(wifiStaticInfo);
  wifi_sta_get_ap_info();
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
  wifi_sta_get_static_info();
});

onUnmounted(() => {
  unregisterModule(WtModuleID.WIFI);
});

</script>


<style scoped lang="postcss">
.description-style :deep(.el-descriptions__label) {
  @apply w-32
}
</style>
