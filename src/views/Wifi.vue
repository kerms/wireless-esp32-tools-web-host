<template>
  <div class="wifiView">
    <h2>Wifi View</h2>
    <el-form label-width="auto" ref="formRef" :model="ssidValidateForm">
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
              <div class="flex">
                <InlineSvg :name="item.wifiLogo" class="h-6 pr-4"></InlineSvg>
<!--                <span class="w-10">{{ item.rssi }}</span>-->
                <div>{{ item.ssid }}</div>
              </div>
            </template>
          </el-autocomplete>
          <div class="h-8">
            <el-button class="h-8" @click="onScanClick">扫描</el-button>
          </div>
        </div>

      </el-form-item>
      <el-form-item label="密码">
        <el-input
            v-model="password"
            show-password
            type="password"
            clearable
        />
      </el-form-item>

      <div class="flex justify-center">
        <el-button @click="onConnect" type="primary">连接</el-button>
      </div>
    </el-form>

  </div>
  <el-button class="h-8">扫描</el-button>
  <el-button  type="primary">连接</el-button>
</template>

<script setup lang="ts">
import {inject, onMounted, onUnmounted, reactive, ref} from "vue";
import {wifi_get_ap_info, wifi_get_scan_list, type WifiInfo, type WifiList} from "@/api/apiWifi";
import type {FormInstance} from "element-plus";
import type {ServerMsg,ControlMsg} from "@/composables/broadcastChannelDef";

import {
  ControlEvent,
  ControlMsgType
} from "@/composables/broadcastChannelDef";
import InlineSvg from "@/components/InlineSvg.vue";
import {getWebsocketService} from "@/composables/websocket/websocketService";


const formRef = ref<FormInstance>()
let wifiListPlaceholder = ref("我的WIFI")
let ssidValidateForm = reactive({
  wifiSsid: ""
})
const password = ref('')

let scanning = false;
let scan_cb: any;
let options: Array<WifiInfo> = [

]

const querySearch = (queryString: string, cb: any) => {
  if (scanning) {
    scan_cb = cb;
  } else {
    cb(options);
  }
}

const onClientMsg = (ev: MessageEvent<ServerMsg>) => {
  if (ev.data.type !== "json") {
    return;
  }

  const json: object = ev.data.data;

  let wifiList: WifiList;
  try {
    wifiList = ev.data.data as WifiList;
    console.log(wifiList);
  } catch (e) {
    return;
  }
  scanning = false;
  wifiList.scan_list.forEach(value => {
    if (value.rssi > -50) {
      value.wifiLogo = "wifi-3";
    } else if (value.rssi > -65) {
      value.wifiLogo = "wifi-2";
    } else {
      value.wifiLogo = "wifi-1";
    }
  });
  options = wifiList.scan_list;
  if (scan_cb) {
    scan_cb(options);
    scan_cb = null;
  }
};

const onClientCtrl = (ev: MessageEvent<ControlMsg>) => {
  if (ev.data.type !== ControlMsgType.WS_EVENT) {
    return
  }

  if (ev.data.data === ControlEvent.CONNECTED) {
    wifi_get_ap_info();
  }
};

function onScanClick() {
  scanning = true;
  wifi_get_scan_list();
}

function onConnect() {
  console.log(ssidValidateForm.wifiSsid, password.value);
}

onMounted(() => {

});

onUnmounted(() => {

});


</script>


<style scoped>
.wifiView {
  background-color: bisque;
  border-radius: 5px;
  padding: 20px;
}

</style>
