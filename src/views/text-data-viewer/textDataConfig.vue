<template>
  <div>
    <el-tabs v-model="store.configPanelTab" class="mx-2 custom-tabs fit">
      <el-tab-pane label="接口" name="first" class="min-h-80">

        <div class="flex flex-col gap-2">
          <el-form :size="store.configPanelShow ? '' : 'small'">
            <el-form-item
                label="波特率"
                class="mb-2"
            >
              <div class="flex w-full">
                <el-select v-model="store.uartBaud" :teleported="false">
                  <template #header>
                    <div class="overflow-auto max-h-40">
                      <div class="flex gap-0">
                        <el-input-number
                            v-model="uartCustomBaud"
                            placeholder="自定义波特率"
                            size="small"
                            :controls="false"
                            :min="110"
                            class="flex-grow"
                        ></el-input-number>
                        <el-button size="small" @click="onUseCustomUartBaud">使用</el-button>
                        <!--                      <el-button size="small" @click="onConfirm" class="ml-0">增加</el-button>-->
                      </div>

                      <el-option-group label="常用">
                        <el-option
                            v-for="item in store.predefinedUartBaudFrequent"
                            :key="item.baud"
                            :value="item.baud"
                            class="border-b list-none"
                        />
                      </el-option-group>

                      <el-option-group label="其他">
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
            <p class="text-xs">实际波特率:{{ store.uartBaudReal }}</p>

            <el-form-item label="数据位" class="mb-2">
              <el-select v-model="store.uartConfig.data_bits" :teleported="false" placeholder="Select">
                <el-option
                    v-for="item in uartDataBitsOptions"
                    :key="item.key"
                    :value="item.key"
                    :label="item.label"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="校验位" class="mb-2">
              <el-select v-model="store.uartConfig.parity" :teleported="false" placeholder="Select">
                <el-option
                    v-for="item in uartParityOptions"
                    :key="item.key"
                    :value="item.key"
                    :label="item.label"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="停止位">
              <el-select v-model="store.uartConfig.stop_bits" :teleported="false" placeholder="Select">
                <el-option
                    v-for="item in uartStopBitsOptions"
                    :key="item.key"
                    :value="item.key"
                    :label="item.label"
                />
              </el-select>
            </el-form-item>

            <el-form-item label=" ">
              <div class="flex">
                <el-button :type="store.acceptIncomingData ? 'danger': 'success'"
                           :disabled="wsStore.state !== ControlEvent.CONNECTED"
                           @click="store.acceptIncomingData = !store.acceptIncomingData"
                >
                  {{ store.acceptIncomingData ? "停止数据收发" : "开始数据收发" }}
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>


      </el-tab-pane>
      <!--  /////////////////////////////////////////////////////////////////    -->
      <el-tab-pane label="显示框" name="second">
        <div class="flex flex-col">
          <el-collapse v-model="collapseActiveName">
            <el-collapse-item name="1">
              <template #title>
                显示选项
              </template>
              <template #default>
                <div class="flex flex-col gap-2">
                  <div class="flex flex-col">
                    <el-checkbox border v-model="store.showText" label="显示文本"/>
                  </div>
                  <div class="flex flex-col">
                    <el-checkbox border v-model="store.showHex" label="显示HEX"/>
                  </div>
                  <div class="flex flex-col">
                    <el-checkbox border v-model="store.showHexdump" label="显示HEXDUMP"/>
                  </div>
                  <div class="flex flex-col">
                    <el-checkbox border v-model="store.showTimestamp">显示时间戳</el-checkbox>
                  </div>
                  <div class="flex flex-col">
                    <el-checkbox border v-model="store.enableLineWrap" label="启用换行"/>
                  </div>

                  <el-tag type="success">
                    <el-text type="success">RX HEXDUMP高亮选色</el-text>
                    <el-color-picker v-model="store.RxHexdumpColor" show-alpha :predefine="store.predefineColors"
                                     size="small"/>
                  </el-tag>

                  <el-tag type="primary">
                    <el-text type="primary">TX HEXDUMP高亮选色</el-text>
                    <el-color-picker v-model="store.TxHexdumpColor" show-alpha :predefine="store.predefineColors"
                                     size="small"/>
                  </el-tag>
                </div>
              </template>
            </el-collapse-item>

            <el-collapse-item name="2">
              <template #title>
                断帧策略
              </template>
              <VueDraggable v-model="store.frameBreakRules" target="tbody" handle=".sort-target"
                            :animation="150"
                            :on-move="checkMove">
                <table class="w-full bg-white">
                  <thead>
                  <tr class="text-sm h-7">
                    <th>优先级</th>
                    <th>
                      <div class="flex justify-center">
                        规则
                        <el-tooltip placement="top" effect="light">
                          <template #content>
                            <p>超时=-1： 禁用超时断帧</p>
                            <p>超时=0： 当机立断，收到任何数据都视为完整数据</p>
                            <p>匹配断后：典型\n的场景</p>
                            <p>匹配断前：用于有特殊帧头的场景</p>
                            <p>固定字节断帧：传输大量数据，比如可以每隔1024字节断帧，方便查看数据</p>
                          </template>
                          <InlineSvg name="help" class="w-4 text-gray-500 cursor-help"></InlineSvg>
                        </el-tooltip>
                      </div>
                    </th>
                    <th>值</th>
                  </tr>
                  </thead>
                  <tbody class="text-xs text-center">
                  <tr v-for="(item, index) in store.frameBreakRules" :key="index">
                    <td :class="item.draggable ? 'sort-target' : ''">
                      {{ item.draggable ? index : 'NaN' }}
                    </td>
                    <td :class="item.draggable ? 'sort-target' : ''">{{ item.name }}</td>
                    <td>
                      <div v-if="item.type === 'number'">
                        <el-input-number v-model="item.ref" :min="item.min || 0" size="small" style="width: 100px"/>
                      </div>
                      <div v-else>
                        <el-input class="break-input" v-model="item.ref" placeholder="文本;支持\n\x" size="small"
                                  style="width: 100px">
                          <template #prepend>
                            <el-button size="small" @click="store.frameBreakAfterSequence = false">
                              <span
                                  :class="store.frameBreakAfterSequence ? 'text-gray-400' : 'text-blue-400 font-bold'">
                              断
                              </span>
                            </el-button>
                          </template>
                          <template #append>
                            <el-button size="small" @click="store.frameBreakAfterSequence = true">
                              <span
                                  :class="store.frameBreakAfterSequence ? 'text-blue-400 font-bold' : 'text-gray-300'">
                              断
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

            <el-collapse-item name="3">
              <template #title>
                其他
              </template>
              <template #default>
                <div class="flex flex-col gap-2">
                  <el-tooltip
                      class="box-item"
                      effect="light"
                      placement="right-start"
                  >
                    <template #content>
                      <p>ANSI转义码对终端和文本有很多作用，比如改变文本颜色等。</p>
                      <p>
                        简单了解->
                        <el-link target="_blank" href="https://zhuanlan.zhihu.com/p/390666800">
                          https://zhuanlan.zhihu.com/p/390666800
                        </el-link>
                      </p>
                    </template>
                    <el-checkbox border v-model="store.enableAnsiDecode">解析ANSI转义码</el-checkbox>
                  </el-tooltip>
                  <el-input v-model="store.filterValue" placeholder="文本;支持\n\x" clearable>
                    <template #prepend>
                      过滤
                    </template>
                  </el-input>

                  <div class="border rounded flex flex-col">

                    <el-checkbox border v-model="store.dataFilterAutoUpdate">新数据自动刷新</el-checkbox>

                    <el-tooltip content="提高间隔可减少CPU资源的使用" placement="right" effect="light"
                                :show-after="500">
                      <div class="flex gap-4 p-2">
                        <el-text>数据显示刷新间隔(ms)</el-text>
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
      <el-tab-pane label="发送" name="third">
        <div class="flex flex-col gap-2">
          <el-input v-model="store.textPrefixValue" placeholder="支持\n\x" clearable>
            <template #prepend>
              {{ `添加帧头►` }}
            </template>
          </el-input>
          <el-input v-model="store.textSuffixValue" placeholder="支持\n\x" clearable>
            <template #append>
              ◄添加帧尾
            </template>
          </el-input>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import {VueDraggable} from 'vue-draggable-plus'
import {ref} from "vue";
import {useDataViewerStore} from "@/stores/dataViewerStore";
import {useWsStore} from "@/stores/websocket";
import {globalNotify} from "@/composables/notification";
import {ControlEvent} from "@/api";
import type {MoveEvent} from "sortablejs";
import InlineSvg from "@/components/InlineSvg.vue";

const store = useDataViewerStore()
const wsStore = useWsStore()
const collapseActiveName = ref(["1", "2", "3"])

const uartCustomBaud = ref(114514)

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

const uartParityOptions = [
  {
    key: 0,
    label: "无（none）",
  }, {
    key: 1,
    label: "奇（odd）",
  }, {
    key: 2,
    label: "偶（even）",
  }
]


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
  } else {
    globalNotify("波特率格式错误", "warning")
  }
}

function checkMove(event: MoveEvent) {
  // Find index of related element
  const toIndex: number = Array.from(event.to.children).indexOf(event.related);
  return !!store.frameBreakRules[toIndex].draggable;
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