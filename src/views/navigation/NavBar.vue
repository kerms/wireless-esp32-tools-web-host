<template>
  <nav class="relative px-2 py-1 flex justify-between items-center border-b">
    <div class="flex">
      <button @click.prevent="sideMenuOpen=true" class="flex items-center hover:text-blue-600 p-3">
        <svg class="block h-4 w-4 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <title>导航侧栏</title>
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
        </svg>
      </button>

      <router-link to="/" class="text-3xl px-4 font-bold leading-none" title="走，去码头整点薯条">
        <InlineSvg name="favicon" class="h-10"></InlineSvg>
      </router-link>
<!--      <a class="text-3xl px-4 font-bold leading-none" href="/">-->
<!--        <InlineSvg name="home" class="h-10"></InlineSvg>-->
<!--      </a>-->
<!--      <router-link to="/" class="flex items-center text-sm text-blue-600 font-bold">主页</router-link>-->
<!--      <a class="flex items-center text-sm text-blue-600 font-bold" href="/">主页6</a>-->
    </div>

    <div class="flex">
      <ul class="hidden absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 md:flex md:mx-auto md:items-center md:w-auto md:space-x-6">
        <li v-for="(item, index) in menuItems" :key="index" class="router-link">
          <router-link :to="item.href" :class="item?.class">{{item.name}}</router-link>
        </li>
      </ul>
    </div>

    <!--  <a class="md:ml-auto md:mr-3"></a>-->
    <div class="flex">
      <el-button :type="wsColor" size="large" class="transition duration-1000">
        <InlineSvg v-show="wsColor!=='success'" name="link-off" class="mr-2" width="20"></InlineSvg>
        <InlineSvg v-show="wsColor==='success'" name="link" class="mr-2" width="20"></InlineSvg>
        {{ wsState }}
      </el-button>
    </div>
  </nav>
  <div :class='["custom-drawer", {open: sideMenuOpen}]'>
    <el-drawer
        v-model="sideMenuOpen"
        :with-header="false"
        size=""
        :direction="'ltr'"
    >
      <div id="testborder" :class="[sideMenuItemClass]" class="pr-6 flex text-gray-500" @click="sideMenuOpen=false">
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
          <p class="text-xs text-center text-gray-400">
            <span>Copyright <a href="http://github.com/kerms">kerms</a> 2024</span>
          </p>
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

const wsStore = useWsStore();

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
  },/* {
    name: translate("page.uart"),
    href: "/uart",
    class: "todo-menu-item",
  },*/
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