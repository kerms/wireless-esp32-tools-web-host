<script setup lang="ts">
import {useWsStore} from "@/stores/websocket";
import type {IWebsocketService} from "@/composables/websocket/websocketService";
import {getWebsocketService} from "@/composables/websocket/websocketService";
import {onMounted, onUnmounted} from "vue";
import {changeFavicon} from "@/composables/importFavicon";
import {logHelloMessage} from "@/composables/logConsoleMsg";
import NavBar from "@/views/navigation/NavBar.vue";
import type {ControlMsg, ServerMsg} from "@/api";
import {ControlEvent, ControlMsgType} from "@/api";
import {routeCtrlMsg, routeModuleServerMsg} from "@/router/msgRouter";
import {globalNotify} from "@/composables/notification";
import {isDevMode} from "@/composables/buildMode";

const wsState = useWsStore();

const onClientCtrl = (msg: ControlMsg) => {
  if (isDevMode()) {
    console.log("App.vue:", msg);
  }
  if (msg.type === ControlMsgType.WS_EVENT) {
    wsState.$patch({state: msg.data as ControlEvent})
    routeCtrlMsg(msg);
    if (msg.data === ControlEvent.CONNECTED) {
      globalNotify("调试器已连接", "success");
    }
  }
};

const onServerMsg = (msg: ServerMsg) => {
  if (isDevMode()) {
    console.log("App.vue:", msg);
  }
  routeModuleServerMsg(msg);
};

let websocketService: IWebsocketService;
onMounted(() => {

  logHelloMessage();
  let host = "";
  if (isDevMode()) {
    host = import.meta.env.VITE_DEVICE_HOST_NAME || "dap.local";
  } else {
    host = window.location.host
  }
  websocketService = getWebsocketService();
  websocketService.init(host, onServerMsg, onClientCtrl);
  changeFavicon();
});

onUnmounted(() => {

});
</script>

<template>
  <div class="flex flex-col h-screen">
    <header>
      <nav-bar/>
    </header>
    <RouterView/>
  </div>
</template>
