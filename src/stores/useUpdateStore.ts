import { ref } from 'vue'
import { defineStore } from 'pinia'
import {wt_ota_get_progress} from "@/api/apiOTA";

export const useUpdateStore = defineStore('update', () => {
    const canUpdate = ref(false);
    const updateProgress = ref(0);
    const updateStatus = ref('');

    const progressBarStatus = ref('');

    let progressIntervalID = -1;

    const newFmInfo = ref({
        fm_size: 0,
        fm_ver: "-",
        upd_date: "-",
        upd_note: "-",
    })

    function setProgressInterval() {
        if (progressIntervalID < 0) {
            progressIntervalID = setInterval(() => {
                wt_ota_get_progress();
            }, 1000);
        }
    }

    function clearProgressInterval() {
        if (progressIntervalID >= 0) {
            clearInterval(progressIntervalID);
            progressIntervalID = -1;
        }
    }

    return {
        canUpdate,
        updateProgress,
        updateStatus,
        progressBarStatus,
        newFmInfo,
        setProgressInterval,
        clearProgressInterval,
    }
})
