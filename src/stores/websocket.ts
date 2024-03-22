import {defineStore} from "pinia";
import {ControlEvent} from "@/composables/broadcastChannelDef";

export const useWsStore = defineStore('websocket', {
    state: () => {
        return {
            state: ControlEvent.DISCONNECTED as ControlEvent,
            dummy_var: 1 as number,
        };
    },
});
