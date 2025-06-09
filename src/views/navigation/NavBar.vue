<template>
  <nav class="relative px-2 py-0.5 sm:py-1 flex justify-between items-center border-b h-full">
    <div class="flex">
      <button @click.prevent="sideMenuOpen=true" class="flex items-center hover:text-blue-600 pl-1 mx-2 sm:mx-4">
        <svg class="block h-3 lg:h-4 lg:w-4 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <title>{{ translate('navbar.navigationSidebar') }}</title>
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
        </svg>
        <el-badge v-if="updateStore.canUpdate" is-dot></el-badge>
      </button>

      <router-link to="/" class="text-3xl px-4 font-bold leading-none hidden items-center sm:flex" :title="translate('navbar.getSomeFries')">
        <InlineSvg name="favicon" class="h-5 lg:h-8"></InlineSvg>
      </router-link>

      <div id="nav-right-slot"></div>

      <div class="flex pt-0.5 sm:pt-1 ml-4 text-xs items-center sm:hidden">
        <router-link :to="route.fullPath">{{ $route.meta.title }}</router-link>
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
      <div class="mr-2">
          <el-select v-model="language" class="min-w-20 h-full" @change="handleLanguageChange">
            <el-option value="en">🇺🇸 English</el-option>
            <el-option value="zh">🇨🇳 简体中文</el-option>
            <el-option value="fr">🇫🇷 Français</el-option>
            <template #label>
              <div class="flex">
                <InlineSvg name="translate" class="w-4 mr-1"></InlineSvg>
                {{ languageFlag }}
              </div>
            </template>
          </el-select>
      </div>

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
          <li v-for="(item, index) in sideBarItems" class="mb-1" :key="index">
              <router-link @click="sideMenuOpen=false" :title="item.name" :to="item.href" :class="[sideMenuItemClass, item?.class]">
                {{ item.name }}
                <el-badge v-if="item?.badge?.value" is-dot></el-badge>
              </router-link>
          </li>
        </ul>
      </div>

      <template #footer>
        <div>
          <el-button @click="toggle">
            <InlineSvg v-if="!isFullscreen" name="open-in-full" width="16px" fill="#000000"></InlineSvg>
            <p v-if="!isFullscreen">{{ translate('page.fullscreen') }}</p>
            <InlineSvg v-if="isFullscreen" name="close-fullscreen" width="16px" fill="#000000"></InlineSvg>
            <p v-if="isFullscreen">{{ translate('page.windowed') }}</p>
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
import {computed, type ComputedRef, type Ref, ref} from "vue";
import {useWsStore} from "@/stores/websocket";
import {translate} from "@/locales";
import {ControlEvent} from "@/api";
import {useRoute} from "vue-router";
import { useFullscreen } from '@vueuse/core'
import {useUpdateStore} from "@/stores/useUpdateStore";
import {isOTAEnabled} from "@/composables/buildMode";
import {getFlagFromLang, locale, setLang} from "@/i18n"

const wsStore = useWsStore();
const updateStore = useUpdateStore();
const {isFullscreen, toggle} = useFullscreen();
const route = useRoute();
const language = ref(locale);

const languageFlag = computed(() => {
  return getFlagFromLang(language.value);
});

function handleLanguageChange(lang: string) {
  setLang(lang);
}

const sideMenuItemClass = "block p-4 text-sm font-semibold hover:bg-blue-50 hover:text-blue-600 rounded flex"
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
  return translate(wsStore.state.toLocaleLowerCase());
});

type Item = {
  name: string;
  href: string;
  class?: string;
  badge?: Ref<boolean>;
};

const menuItems: ComputedRef<Item[]> = computed(() => ([
  {
    name: translate("page.uart"),
    href: "/uart",
  }, {
    name: translate("page.wifi"),
    href: "/wifi",
  }, {
    name: translate("page.feedback"),
    href: "/feedback",
  },
]));

const sideBarItems: ComputedRef<Item[]> = computed(() => {
  const items: Item[] = [
    {
      name: translate("page.wifi"),
      href: "/wifi",
    }, {
      name: translate("page.uart"),
      href: "/uart",
    }, {
      name: translate("page.at"),
      href: "/at",
    }, {
      name: translate("page.about"),
      href: "/about",
    }, {
      name: translate("page.feedback"),
      href: "/feedback",
    },
  ];
  if (isOTAEnabled()) {
    items.push({
      name: translate("page.update"),
      href: "/update",
      badge: computed(() => updateStore.canUpdate),
    })
  }
  return items;
});



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

.el-select :deep(.el-select__wrapper) {
  @apply h-full;
}


</style>