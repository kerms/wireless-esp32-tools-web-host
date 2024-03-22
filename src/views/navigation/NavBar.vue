<template>
  <nav class="relative px-4 py-1 flex justify-between items-center border-b">
    <div class="flex">
      <button @click.prevent="sideMenuOpen=true" class="flex items-center hover:text-blue-600 p-3">
        <svg class="block h-4 w-4 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <title>Mobile menu</title>
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
        </svg>
      </button>

      <router-link to="/" class="text-3xl px-4 font-bold leading-none">
        <InlineSvg name="home" class="h-10"></InlineSvg>
      </router-link>
<!--      <a class="text-3xl px-4 font-bold leading-none" href="/">-->
<!--        <InlineSvg name="home" class="h-10"></InlineSvg>-->
<!--      </a>-->
      <router-link to="/" class="flex items-center text-sm text-blue-600 font-bold">主页</router-link>
<!--      <a class="flex items-center text-sm text-blue-600 font-bold" href="/">主页6</a>-->
    </div>

    <div class="flex">
      <ul class="hidden absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 md:flex md:mx-auto md:items-center md:w-auto md:space-x-6">
        <li><router-link to="/wifi" title="Wifi" class="text-sm text-gray-400 hover:text-gray-800">wifi</router-link></li>
<!--        <li><a class="text-sm text-gray-400 hover:text-gray-500" href="#">Home</a></li>-->
<!--        <li><a class="text-sm text-blue-600 font-bold">About Us</a></li>-->
<!--        <li><a class="text-sm text-gray-400 hover:text-gray-500" href="#">Services</a></li>-->
      </ul>
    </div>

    <!--  <a class="md:ml-auto md:mr-3"></a>-->
    <div class="flex">
      <button @click="stateMenuOpen=true"
              class="py-2 px-6 bg-blue-500 hover:bg-blue-600 text-sm text-white font-bold rounded-xl transition duration-200">
        <span class="flex">
          <svg class="mr-2" width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 19.4998H12.01M2 8.81929C3.69692 7.30051 5.74166 6.16236 8 5.53906M5 12.8584C5.86251 12.0129 6.87754 11.3223 8 10.8319M16 5.53906C18.2583 6.16236 20.3031 7.30051 22 8.81929M16 10.8319C17.1225 11.3223 18.1375 12.0129 19 12.8584M12 4.5V15.4998" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ wsState }}</span>
        </span>
      </button>
<!--      <span>{{ $t("Disconnected") }}</span>-->
    </div>
  </nav>
  <div :class='["custom-drawer", {open: sideMenuOpen}]'>
    <el-drawer
        v-model="sideMenuOpen"
        :with-header="false"
        size=""
        :direction="'ltr'">
      <div :class="[sideMenuItemClass]" class="px-6" @click="sideMenuOpen=false">
        <InlineSvg name="cross" class="w-6"></InlineSvg>
      </div>
      <div class="flex-col justify-between m-4 mt-0">
        <div>
          <ul>
            <li v-for="(item, index) in menuItems" class="mb-1" :key="index">
              <router-link @click="sideMenuOpen=false" :title="item.name" :to="item.href" :class="sideMenuItemClass">{{ item.name }}</router-link>
<!--              <a :href="item.href" :class="sideMenuItemClass">{{ item.name }}</a>-->
            </li>
          </ul>
        </div>
        <div class="mt-auto">

          <p class="my-4 text-xs text-center text-gray-400">
            <span>Copyright kerms 2024</span>
          </p>
        </div>
      </div>
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
          <div class="pt-6">
            <a class="block px-4 py-3 mb-3 leading-loose text-xs text-center font-semibold bg-gray-50 hover:bg-gray-100 rounded-xl"
               href="#">Sign in</a>
            <a class="block px-4 py-3 mb-2 leading-loose text-xs text-center text-white font-semibold bg-blue-600 hover:bg-blue-700  rounded-xl"
               href="#">Sign Up</a>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import InlineSvg from "@/components/InlineSvg.vue";
import {computed, ref, toRef} from "vue";
import {useWsStore} from "@/stores/websocket";
import {useI18n} from "vue-i18n";

const { t } = useI18n()
const wsStore = useWsStore();

const sideMenuItemClass = "block p-4 text-sm font-semibold text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded"
const sideMenuOpen = ref(false);
const stateMenuOpen = ref(false)

const wsState = computed(() => {

  return t(wsStore.state);
});

const menuItems = ([
  {
    name: "Home",
    href: "/",
  }, {
    name: "About Us",
    href: "/about",
  }, {
    name: "Services",
    href: "/",
  }, {
    name: "Wifi",
    href: "/wifi",
  }, {
    name: "Contact",
    href: "/",
  }, {
    name: "6",
    href: "/",
  },
]);

</script>

<style scoped>

/*nav *{
  border: solid 1px;
}*/

/* drawer */
.custom-drawer :deep(.el-drawer) {
  transition: all 0.1s; /* Custom duration*/
}

/* drawer overlay */
.custom-drawer.open :deep(.el-overlay) {
  transition: all 0s; /* Custom duration*/
}

.custom-drawer :deep(.el-drawer__body) {
  padding: 0;
}

</style>