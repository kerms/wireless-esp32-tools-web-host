<script setup lang="ts">
import {useWsStore} from "@/stores/websocket";
import type {ControlMsg, ServerMsg} from "@/composables/broadcastChannelDef";
import type {IWebsocketService} from "@/composables/websocket/websocketService";
import {ControlEvent, ControlMsgType} from "@/composables/broadcastChannelDef";
import {getWebsocketService} from "@/composables/websocket/websocketService";
import {onMounted, onUnmounted} from "vue";

const wsState = useWsStore();

const onClientCtrl = (msg: ControlMsg) => {
  console.log("App.vue:", msg);
  if (msg.type === ControlMsgType.WS_EVENT) {
    wsState.$patch({state: msg.data as ControlEvent})
  }
};

const onServerMsg = (msg: ServerMsg) => {
  console.log("App.vue:", msg);
};

let websocketService: IWebsocketService;
onMounted(() => {
  // const host = window.location
  console.log("App.vue mounted")

  const host = "192.168.43.61";
  websocketService = getWebsocketService();
  websocketService.init(host, onServerMsg, onClientCtrl);
});

onUnmounted(() => {

});

import NavBar from "@/views/navigation/NavBar.vue";
</script>

<template>
  <header>
    <nav-bar/>
  </header>

  <p class="m-0">This is body</p>
  <RouterView/>
  <p>end</p>
  <!--  <p>{{ test }}</p>-->
  <el-button type="danger"><p>test</p></el-button>

</template>

<style>
.app {
  background-color: #ddd;
  box-shadow: 0 0 10px;
  border-radius: 10px;
  padding: 20px;
}

.router-active {
  background-color: #666;
  cursor: default;
}
</style>
