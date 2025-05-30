import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUartStore = defineStore('uart', () => {
    const uartNum = ref(1);

    return { uartNum }
})
