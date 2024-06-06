import {defineStore} from "pinia";
import {ref} from "vue";

export const useSystemStore = defineStore('system', () => {

    const curFmInfo = ref({
        ver: "-",
        date: "-",
    });

    const hwInfo = ref({
        ver: "-",
        date: "-",
    })

    const rebootInProgress = ref(false);

    return {
        curFmInfo,
        hwInfo,
        rebootInProgress,
    }
});
