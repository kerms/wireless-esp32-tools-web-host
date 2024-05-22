<template>
  <nav class="relative px-2 py-0.5 sm:py-1 flex justify-between items-center border-b h-full">
    <div class="flex">
      <button @click.prevent="sideMenuOpen=true" class="flex items-center hover:text-blue-600 pl-1 mx-4">
        <svg class="block h-3 lg:h-4 lg:w-4 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <title>导航侧栏</title>
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
        </svg>
      </button>

      <router-link to="/" class="text-3xl px-4 font-bold leading-none hidden items-center sm:flex" title="走，去码头整点薯条">
        <InlineSvg name="favicon" class="h-5 lg:h-8"></InlineSvg>
      </router-link>


<!--      <a class="text-3xl px-4 font-bold leading-none" href="/">-->
<!--        <InlineSvg name="home" class="h-10"></InlineSvg>-->
<!--      </a>-->
<!--      <router-link to="/" class="flex items-center text-sm text-blue-600 font-bold">主页</router-link>-->
<!--      <a class="flex items-center text-sm text-blue-600 font-bold" href="/">主页6</a>-->

      <div class="flex pt-0.5 sm:pt-1 ml-4 text-sm items-center sm:hidden">
        <router-link :to="route.fullPath">{{ route.meta.title }}</router-link>
      </div>
    </div>

    <div class="flex">
      <ul class="hidden absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 sm:flex sm:mx-auto sm:items-center sm:w-auto sm:space-x-6">
        <li v-for="(item, index) in menuItems" :key="index" class="router-link">
          <router-link :to="item.href" :class="item?.class">{{item.name}}</router-link>
        </li>
      </ul>
    </div>

    <!--  <a class="md:ml-auto md:mr-3"></a>-->
    <div class="flex h-full">
      <div id="page-spec-slot" class="content-center h-full flex flex-row"></div>
      <div class="lg:hidden">
        <el-button :type="wsColor" size="small" class="transition duration-1000 min-h-full">
          <InlineSvg v-show="wsColor!=='success'" name="link-off" class="mr-2" width="20"></InlineSvg>
          <InlineSvg v-show="wsColor==='success'" name="link" class="mr-2" width="20"></InlineSvg>
          <div class="text-xs sm:text-sm lg:text-base">{{ wsState }}</div>
        </el-button>
      </div>
      <div class="hidden lg:flex">
        <el-button :type="wsColor" size="large" class="transition duration-1000 min-h-full">
          <InlineSvg v-show="wsColor!=='success'" name="link-off" class="mr-2" width="20"></InlineSvg>
          <InlineSvg v-show="wsColor==='success'" name="link" class="mr-2" width="20"></InlineSvg>
          <div class="text-base">{{ wsState }}</div>
        </el-button>
      </div>
    </div>
  </nav>
  <div :class='["custom-drawer", {open: sideMenuOpen}]'>
    <el-drawer
        v-model="sideMenuOpen"
        :with-header="false"
        size=""
        :direction="'ltr'"
    >
      <div :class="[sideMenuItemClass]" class="pr-6 flex text-gray-500" @click="sideMenuOpen=false">
        <InlineSvg name="cross" class="h-6"></InlineSvg>
        <div>
          <p class="h-6 flex items-center">{{ $t("page.close") }}</p>
        </div>
      </div>

      <div class="flex flex-col justify-between m-4 mt-0">
        <ul>
          <li v-for="(item, index) in menuItems" class="mb-1" :key="index">
            <router-link @click="sideMenuOpen=false" :title="item.name" :to="item.href" :class="[sideMenuItemClass, item?.class]">{{ item.name }}</router-link>
          </li>
        </ul>
      </div>

      <template #footer>
        <div>
          <el-button @click="toggle">
            <InlineSvg v-if="!isFullscreen" name="open-in-full" width="16px" fill="#000000"></InlineSvg>
            <p v-if="!isFullscreen">全屏</p>
            <InlineSvg v-if="isFullscreen" name="close-fullscreen" width="16px" fill="#000000"></InlineSvg>
            <p v-if="isFullscreen">缩小</p>
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>

  <div :class='["custom-drawer", {open: stateMenuOpen}]'>
    <el-drawer
        v-model="stateMenuOpen"
        :with-header="false"
        size=""
        modal-class="bg-amber-400 bg-opacity-0"
        :direction="'rtl'">
      <div class="flex-col justify-between m-4 bg-white">

        <div class="mt-auto">

        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import InlineSvg from "@/components/InlineSvg.vue";
import {computed, ref} from "vue";
import {useWsStore} from "@/stores/websocket";
import {translate} from "@/locales";
import {ControlEvent} from "@/api";
import {useRoute} from "vue-router";
import { useFullscreen } from '@vueuse/core'

const wsStore = useWsStore();
const {isFullscreen, toggle} = useFullscreen();
const route = useRoute();

const sideMenuItemClass = "block p-4 text-sm font-semibold hover:bg-blue-50 hover:text-blue-600 rounded"
const sideMenuOpen = ref(false);
const stateMenuOpen = ref(false)

const wsColor = computed(() => {
  let ret = "danger";
  switch (wsStore.state) {
    case ControlEvent.DISCONNECTED:
      ret = "danger";
      break
    case ControlEvent.CONNECTED:
      ret = "success";
      break
    case ControlEvent.CONNECTING:
      ret = "warning";
      break
  }
  return ret;
});

const wsState = computed(() => {
  return translate(wsStore.state);
});

type Item = {
  name: string;
  href: string;
  class?: string;
};

const menuItems: Item[] = ([
/*  {
    name: translate("page.home"),
    href: "/",
  }, */{
    name: translate("page.wifi"),
    href: "/wifi",
  }, {
    name: translate("page.about"),
    href: "/about",
  }, {
    name: translate("page.feedback"),
    href: "/feedback",
  },
]);

</script>

<style scoped>

/*nav *{
  border: solid 1px;
}*/


/* drawer overlay */
.custom-drawer :deep(.el-overlay) {
  transition: all 0s; /* Custom duration*/
}

.custom-drawer :deep(.el-drawer) {
  transition: all 0s; /* Custom duration*/
}

.custom-drawer.open :deep(.el-drawer) {
  transition: all 0.05s; /* Custom duration*/
}

.custom-drawer :deep(.el-drawer__body) {
  padding: 0;
}


</style>