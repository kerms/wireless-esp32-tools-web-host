<template>
  <div>
    <el-tabs v-model="store.configPanelTab" class="mx-2 custom-tabs fit">
      <el-tab-pane name="first" class="min-h-80">
        <template #label>{{ $t("uart.port") }}</template>
        <div class="flex flex-col gap-2">
          <el-form :size="store.winLeft.show ? '' : 'small'" label-position="left" label-width="auto">
            <el-form-item
                class="mb-2"
            >
              <template #label>{{ $t("uart.baudrate") }}</template>
              <div class="flex w-full">
                <el-select v-model="store.uartBaud" :teleported="false" @change="onUartBaudChange">
                  <template #header>
                    <div class="overflow-auto max-h-40">
                      <div class="flex gap-0">
                        <el-input-number
                            v-model="uartCustomBaud"
                            :placeholder="translate('uart.customBaud')"
                            size="small"
                            :controls="false"
                            :min="110"
                            class="flex-grow"
                        ></el-input-number>
                        <el-button size="small" @click="onUseCustomUartBaud">{{ $t('uart.use') }}</el-button>
                        <!--                      <el-button size="small" @click="onConfirm" class="ml-0">增加</el-button>-->
                      </div>

                      <el-option-group :label="translate('uart.commonlyUsed')">
                        <el-option
                            v-for="item in store.predefinedUartBaudFrequent"
                            :key="item.baud"
                            :value="item.baud"
                            class="border-b list-none"
                        />
                      </el-option-group>

                      <el-option-group :label="translate('uart.other')">
                        <el-option
                            v-for="item in store.uartBaudList"
                            :key="item.baud"
                            :value="item.baud"
                            class="border-b list-none"
                        />
                      </el-option-group>
                    </div>
                  </template>
                </el-select>
              </div>
            </el-form-item>
            <p class="text-xs">{{ $t('uart.actual') }} {{ $t('uart.baudrate') }}:{{ store.uartBaudReal }}</p>

            <el-form-item :label="translate('uart.dataBits')" class="mb-2">
              <el-select v-model="store.uartConfig.data_bits" :teleported="false"
                         placeholder="Select" @change="onUartConfigChange">
                <el-option
                    v-for="item in uartDataBitsOptions"
                    :key="item.key"
                    :value="item.key"
                    :label="item.label"
                />
              </el-select>
            </el-form-item>

            <el-form-item :label="translate('uart.parity')" class="mb-2">
              <el-select v-model="store.uartConfig.parity" :teleported="false"
                         placeholder="Select" @change="onUartConfigChange">
                <el-option
                    v-for="item in uartParityOptions"
                    :key="item.key"
                    :value="item.key"
                    :label="item.label"
                />
              </el-select>
            </el-form-item>

            <el-form-item :label="translate('uart.stopBits')">
              <el-select v-model="store.uartConfig.stop_bits" :teleported="false"
                         placeholder="Select" @change="onUartConfigChange">
                <el-option
                    v-for="item in uartStopBitsOptions"
                    :key="item.key"
                    :value="item.key"
                    :label="item.label"
                />
              </el-select>
            </el-form-item>

            <div class="flex justify-center">
              <el-button :type="store.acceptIncomingData ? 'danger': 'success'"
                         :disabled="wsStore.state !== ControlEvent.CONNECTED"
                         @click="store.acceptIncomingData = !store.acceptIncomingData"
              >
                {{ store.acceptIncomingData ? $t("uart.stopCommunication") : $t("uart.startCommunication") }}
              </el-button>
            </div>
          </el-form>
        </div>


      </el-tab-pane>
      <!--  /////////////////////////////////////////////////////////////////    -->
      <el-tab-pane name="second">
        <template #label>{{ $t("uart.displayPannel") }}</template>
        <div class="flex flex-col">
          <el-collapse v-model="collapseActiveName">
            <el-collapse-item name="1">
              <template #title>
                {{ $t('uart.displayOptions') }}
              </template>
              <template #default>
                <div class="flex flex-col gap-2">
                  <div class="flex flex-col">
                    <el-checkbox border v-model="store.showText" :label="translate('uart.text')"/>
                  </div>
                  <div class="flex flex-col">
                    <el-checkbox border v-model="store.showHex" label="HEX"/>
                  </div>
                  <div class="flex flex-col">
                    <el-checkbox border v-model="store.showHexdump" label="HEXDUMP"/>
                  </div>
                  <div class="flex flex-col">
                    <el-checkbox border v-model="store.showTimestamp" :label="translate('uart.timestamp')"/>
                  </div>
                  <div class="flex flex-col">
                    <el-checkbox border v-model="store.enableLineWrap" :label="translate('uart.lineWrap')"/>
                  </div>

                  <el-tag type="success">
                    <el-text type="success">RX HEXDUMP {{ $t("uart.highlight") }}</el-text>
                    <el-color-picker v-model="store.RxHexdumpColor" show-alpha :predefine="store.predefineColors"
                                     size="small"/>
                  </el-tag>

                  <el-tag type="primary">
                    <el-text type="primary">TX HEXDUMP {{ $t("uart.highlight") }}</el-text>
                    <el-color-picker v-model="store.TxHexdumpColor" show-alpha :predefine="store.predefineColors"
                                     size="small"/>
                  </el-tag>
                </div>
              </template>
            </el-collapse-item>

            <el-collapse-item name="2" :title="translate('uart.frameBreakStrategy')">
              <VueDraggable v-model="store.frameBreakRules" target="tbody" handle=".sort-target"
                            :animation="150"
                            :on-move="checkMove">
                <table class="w-full bg-white">
                  <thead>
                  <tr class="text-sm h-7">
                    <th>{{ $t('uart.priority') }}</th>
                    <th>
                      <div class="flex justify-center">
                        {{ translate('uart.rule' as TranslationKeys) }}
                        <el-tooltip placement="top" effect="light">
                          <template #content>
                            <div v-html="translate('uart.ruleTips')"></div>
                          </template>
                          <InlineSvg name="help" class="w-4 text-gray-500 cursor-help"></InlineSvg>
                        </el-tooltip>
                      </div>
                    </th>
                    <th>{{ translate('uart.value' as TranslationKeys) }}</th>
                  </tr>
                  </thead>
                  <tbody class="text-xs text-center">
                  <tr v-for="(item, index) in store.frameBreakRules" :key="index">
                    <td :class="item.draggable ? 'sort-target' : ''">
                      {{ item.draggable ? index : 'NaN' }}
                    </td>
                    <td :class="item.draggable ? 'sort-target' : ''">
                      {{ translate("uart." + item.name) }}
                    </td>
                    <td>
                      <div v-if="item.type === 'number'">
                        <el-input-number v-if="item.name === 'timeout'" v-model="store.frameBreakDelay" :min="item.min || 0" size="small" style="width: 100px"/>
                        <el-input-number v-else v-model="store.frameBreakSize" :min="item.min || 0" size="small" style="width: 100px"/>
                      </div>
                      <div v-else>
                        <el-input class="break-input" v-model="store.frameBreakSequence" :placeholder="translate('uart.textAndEscape')" size="small"
                                  style="width: 100px">
                          <template #prepend>
                            <el-button size="small" @click="store.frameBreakAfterSequence = false">
                              <span
                                  :class="store.frameBreakAfterSequence ? 'text-gray-400' : 'text-blue-400 font-bold'">
                              {{ translate("uart.begin") }}
                              </span>
                            </el-button>
                          </template>
                          <template #append>
                            <el-button size="small" @click="store.frameBreakAfterSequence = true">
                              <span
                                  :class="store.frameBreakAfterSequence ? 'text-blue-400 font-bold' : 'text-gray-300'">
                              {{ translate("uart.end") }}
                              </span>
                            </el-button>
                          </template>
                        </el-input>
                      </div>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </VueDraggable>
            </el-collapse-item>

            <el-collapse-item name="3" :title="translate('uart.other')">
              <template #default>
                <div class="flex flex-col gap-2">
                  <el-tooltip
                      class="box-item"
                      effect="light"
                      placement="right-start"
                  >
                    <template #content>
                      <div v-html="translate('uart.ansiTooltips')"></div>
                    </template>
                    <el-checkbox border v-model="store.enableAnsiDecode">{{ translate('uart.decodeAnsiEscapeCodes') }}</el-checkbox>
                  </el-tooltip>
                  <el-input v-model="store.filterValue" :placeholder="translate('uart.textAndEscape')" clearable>
                    <template #prepend>
                      {{ translate("uart.filter") }}
                    </template>
                  </el-input>

                  <div class="border rounded flex flex-col">

                    <el-checkbox border v-model="store.dataFilterAutoUpdate">{{ translate('uart.autoUpdateNewData') }}</el-checkbox>

                    <el-tooltip :content="translate('uart.updateFrequencyTooltip')" placement="right" effect="light"
                                :show-after="500">
                      <div class="flex gap-4 p-2">
                        <el-text>{{ translate('uart.updateFrequency') }}</el-text>
                        <el-input-number
                            :step="10"
                            :min="10"
                            size="small"
                            v-model="store.batchUpdateTime"
                        >
                        </el-input-number>
                      </div>
                    </el-tooltip>

                  </div>

                </div>

              </template>
            </el-collapse-item>
          </el-collapse>

          <!--          <div class="flex flex-col">-->
          <!--            <el-text type="success">断帧设置</el-text>-->
          <!--            <el-input v-model="store.frameBreakSequence" class="max-w-52">-->
          <!--              <template #prepend>-->
          <!--                文本匹配断帧-->
          <!--              </template>-->
          <!--            </el-input>-->
          <!--            <el-input v-model="store.frameBreakDelay" type="number" class="max-w-52">-->
          <!--              <template #prepend>-->
          <!--                超时断帧-->
          <!--              </template>-->
          <!--            </el-input>-->
          <!--          </div>-->


          <!--          <div class="flex flex-col flex-wrap">-->
          <!--            <el-button size="small">滚动到底</el-button>-->


          <!--            <div>显示-->
          <!--              <el-checkbox size="small" border>数据差异高亮</el-checkbox>-->
          <!--              <el-checkbox size="small" border>TX高亮</el-checkbox>-->
          <!--              <el-checkbox size="small" border>显示RX</el-checkbox>-->
          <!--              <el-checkbox size="small" border>显示TX</el-checkbox>-->
          <!--              <el-checkbox size="small" border>RX右对齐</el-checkbox>-->
          <!--            </div>-->

          <!--            &lt;!&ndash;            <div>专有协议&ndash;&gt;-->
          <!--            &lt;!&ndash;              <el-button size="small">输入格式</el-button>&ndash;&gt;-->
          <!--            &lt;!&ndash;              <el-button size="small">输出格式</el-button>&ndash;&gt;-->
          <!--            &lt;!&ndash;            </div>&ndash;&gt;-->
          <!--          </div>-->
        </div>
      </el-tab-pane>

      <!--    /////////////////////////////////////////////////////////////  -->
      <el-tab-pane :label="translate('uart.send')" name="third">
        <template #label>{{ $t("uart.send") }}</template>
        <div class="flex flex-col gap-2">
          <el-input v-model="store.textPrefixValue" :placeholder="translate('uart.textAndEscape')" clearable>
            <template #prepend>
              {{ translate('uart.addHeader') }}►
            </template>
          </el-input>
          <el-input v-model="store.textSuffixValue" :placeholder="translate('uart.textAndEscape')" clearable>
            <template #append>
              ◄{{ translate('uart.addFooter') }}
            </template>
          </el-input>
        </div>
      </el-tab-pane>


      <el-tab-pane :label="translate('uart.proxy')" name="fourth" class="min-h-80">
        <template #label>{{ $t("uart.passthrough") }}</template>
        <div class="flex flex-col gap-2">
          <div class="border rounded bg-white p-2">
            <span class="border-r px-2">TCP {{ translate('uart.serverPort') }}</span>
            <span class="px-2 cursor-not-allowed">1346</span>
          </div>
          <div>
            <p><el-button @click="refreshTCPClientList" size="small" type="primary" :plain="true">{{ translate('uart.refresh') }}</el-button> {{ translate('uart.connectedClient') }}</p>

            <el-table :data="dfStore.instanceList.filter((item) => (item.port_info as ISocketInfo).local_port === 1346)" :empty-text="translate('uart.noClientConnected')">
              <el-table-column label="IP" prop="port_info.foreign_ip" />
              <el-table-column :label="translate('uart.port')" prop="port_info.foreign_port"/>
            </el-table>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import {VueDraggable} from 'vue-draggable-plus'
import {computed, ref} from "vue";
import {useDataViewerStore} from "@/stores/dataViewerStore";
import {useWsStore} from "@/stores/websocket";
import {globalNotify} from "@/composables/notification";
import {ControlEvent} from "@/api";
import type {MoveEvent} from "sortablejs";
import InlineSvg from "@/components/InlineSvg.vue";
import {useDataFlowStore} from "@/stores/useDataFlowStore";
import {wt_data_flow_get_instance_list, type ISocketInfo} from "@/api/apiDataFlow";
import {uart_set_baud, uart_set_config} from "@/api/apiUart";
import {useUartStore} from "@/stores/useUartStore";
import {translate, type TranslationKeys} from "@/locales";

const store = useDataViewerStore()
const uartStore = useUartStore()
const wsStore = useWsStore()
const dfStore = useDataFlowStore()

const collapseActiveName = ref(["1", "2", "3"])

const uartCustomBaud = ref(1500000)

const uartDataBitsOptions = [
  {
    key: 5,
    label: "5 bits",
  }, {
    key: 6,
    label: "6 bits",
  }, {
    key: 7,
    label: "7 bits",
  }, {
    key: 8,
    label: "8 bits",
  }
]

const uartParityOptions = computed(() => [
  {
    key: 0,
    label: translate("uart.parityNone"),
  }, {
    key: 1,
    label: translate("uart.parityOdd"),
  }, {
    key: 2,
    label: translate("uart.parityEven"),
  }
]);


const uartStopBitsOptions = [
  {
    key: 1,
    label: "1",
  }, {
    key: 15,
    label: "1.5",
  }, {
    key: 2,
    label: "2",
  }
]

const onUseCustomUartBaud = () => {
  if (uartCustomBaud.value) {
    store.uartBaud = uartCustomBaud.value;
    onUartBaudChange();
  } else {
    globalNotify("波特率格式错误", "warning")
  }
}

function onUartBaudChange() {
  uart_set_baud(store.uartBaud, uartStore.uartNum);
}

function onUartConfigChange() {
  uart_set_config(store.uartConfig, uartStore.uartNum);
}

function checkMove(event: MoveEvent) {
  // Find index of related element
  const toIndex: number = Array.from(event.to.children).indexOf(event.related);
  return !!store.frameBreakRules[toIndex].draggable;
}

function refreshTCPClientList() {
  dfStore.instanceList = [];
  wt_data_flow_get_instance_list();
}

</script>

<style scoped>
.custom-tabs {
  box-sizing: border-box;
}

.custom-tabs :deep(.el-tabs__item.is-top) {
  padding: unset;
}

.custom-tabs :deep(.el-tabs__nav.is-top) {
  @apply w-full flex justify-around
}

.custom-tabs :deep(.el-collapse-item__wrap) {
  transition: all 0s; /* Customize the duration and easing */
}

.sortable-chosen {
  background-color: var(--el-color-primary-light-9);
}

.sort-target {
  cursor: move;
}

tr td {
  @apply p-1;
}

.break-input :deep(.el-input-group__prepend), .break-input :deep(.el-input-group__append) {
  background-color: unset;
  @apply p-0 min-w-6
}

</style>