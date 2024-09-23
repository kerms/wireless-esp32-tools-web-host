export default {
    emoji: {
        flag: "🇨🇳",
    },
    disconnected: "未连接",
    connected: "已连接",
    connecting: "连接中",
    use: "使用",

    ws: {
        disconnected: "未连接",
        connected: "已连接",
        connecting: "连接中",
    },

    page: {
        home: "主页",
        wifi: "Wi-Fi",
        about: "关于",
        uart: "UART",
        feedback: "反馈",
        close: "关闭",
        update: "更新",
        fullscreen: "全屏",
        windowed: "窗口",
    },

    uart: {
        port: "接口",
        startCommunication: "开始数据收发",
        stopCommunication: "停止数据收发",
        commonlyUsed: "常用",
        baudrate: "波特率",
        customBaud: "自定义波特率",
        use: "使用",
        actual: "实际",
        dataBits: "数据位",
        stopBits: "停止位",
        parity: "校验位",
        parityNone: "无(None)",
        parityOdd: "奇(Odd)",
        parityEven: "偶(Even)",
        flowControl: "流控制",
        send: "发送",
        clear: "清空",
        clearTooltip: "仅清除显示区域，可用刷新恢复",
        updateTooltip: "与缓存同步+过滤",
        autoUpdateTooltip: "仅停止刷新显示区，后台继续接收数据",
        receive: "接收",

        displayOptions: "显示选项",
        display: "显示框",
        show: "显示",
        text: "文本",
        timestamp: "时间戳",
        enable: "启用",
        lineWrap: "换行",
        highlight: "高亮",

        frameBreakStrategy: "断帧策略",
        priority: "优先级",
        rule: "规则",
        ruleTips:
            "<p>超时=-1： 禁用超时断帧</p>" +
            "<p>超时=0： 当机立断，收到任何数据都视为完整数据</p>" +
            "<p>匹配断后：典型\\n的场景</p>" +
            "<p>匹配断前：用于有特殊帧头的场景</p>" +
            "<p>固定字节断帧：传输大量数据，比如可以每隔1024字节断帧，方便查看数据</p>",
        value: "值",
        timeout: "超时",
        match: "匹配",
        byte: "字节",
        begin: "断",
        end: "断",

        other: "其他",
        decodeAnsiEscapeCodes: "解码ANSI转义码",
        ansiTooltips:
            "<p>ANSI转义码对终端和文本有很多作用，比如改变文本颜色等。</p>\n" +
            "<p>\n" +
            "  简单了解->\n" +
            "  <a target=\"_blank\" href=\"https://yunsi.studio/wireless-debugger/docs/uart-webhost/ansi-escape-code\">\n" +
            "    https://yunsi.studio/wireless-debugger/docs/uart-webhost/ansi-escape-code\n" +
            "  </a>\n" +
            "</p>",
        filter: "过滤",
        textAndEscape: "文本，支持\\n\\x",
        autoUpdateNewData: "新数据自动刷新",
        updateFrequency: "数据显示刷新间隔(ms)",
        updateFrequencyTooltip: "提高间隔可减少CPU资源的使用",

        addHeader: "增加帧头",
        addFooter: "增加帧尾",

        passthrough: "透传",
        proxy: "透传",
        serverPort: "服务器端口",
        connectedClient: "已连接的客户端",
        refresh: "刷新",
        interface: "接口",
        noClientConnected: "无客户端连接",

        import: "导入",
        export: "导出",
        reset: "重置",
        resetTooltip: "刷新页面后生效",
        saveToLocal: "保存到本地",
        saveToLocalTooltip: "若存在多个页面，会相互覆盖",
        add: "添加",
        edit: "编辑",
        drag: "拖拽",
        ipChangeAlert: "IP地址改变会导致配置丢失",

        layout: "布局",
        landscape: "横/行",
        portrait: "竖/列",
        responsive: "自适应",
        configPannel: "设置窗",
        displayPannel: "数据窗",
        macroPannel: "快捷窗",
        autoScrollToBottom: "自动滚动到底部",
        clearScreen: "清屏",
        autoUpdate: "自动刷新",
        tempDisplayTooltip: "未满足断帧规则的数据（如：未超时），暂时实时显示在此区域。超过8192字节，自动断帧；",
        loopSend: "循环发送",
        loopSendTooltip: "实际频率受界面刷新率影响，如需要更精确，可以尝试关闭‘自动刷新’",
        sendFormat: "发送格式",
        cachedFrame: "缓存帧数",
        format: "格式化",
    }
}