import {defineStore} from "pinia";
import {type Ref, ref} from "vue";
import type {InstanceInfo} from "@/api/apiDataFlow";

export const useDataFlowStore = defineStore('data_flow', () => {
    const instanceList: Ref<InstanceInfo[]> = ref([]);

    return {
        instanceList,
    }
});
