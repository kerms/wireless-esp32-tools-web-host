export default {
    emoji: {
        flag: "🇨🇳",
    },
    disconnected: "未连接",
    connected: "已连接",
    connecting: "连接中",
    use: "使用",
    author: "作者",
    studioYunSi: "允斯工作室",
    authorEmail: "作者邮箱",
    TencentQQGroup: "QQ群",
    Discord: "Discord",
    BiliBili: "哔哩哔哩",

    suggestion: "建议",
    feature: "需求",
    version: "版本",
    releaseTime: "发布时间",
    credit: "鸣谢",
    aboutWebHost: "关于网页版上位机",
    aboutDebugger: "关于调试器",
    officialWebsite: "官网",
    email: "邮箱",
    note: "备注",
    welcomeMessage: "欢迎来打扰啊~",
    serialNumber: "序列号",

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
        at: "AT命令",
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
        loopSendTooltip: "实际频率受界面刷新率影响，如需要更精确，可以尝试关闭'自动刷新'",
        sendFormat: "发送格式",
        cachedFrame: "缓存帧数",
        format: "格式化",
    },

    wifi: {
        settings: "配置",
        setFailed: "设置失败",
        setSuccess: "配置成功",
        connection: "连接",
        scanning: "扫描中",
        scan: "扫描",
        scanDone: "扫描成功",
        warnWifiName: "请输入WIFI名",
        password: "密码",
        connectInfoHTML: "如果不是通过透传器的热点连接，更换Wi-Fi将导致此界面与透传器断开连接。",
        connect: "连接",
        mode: "模式",
        save: "保存",
        station: "终端",
        intelligent: "智能",
        APOnly: "仅开启热点",
        disconnected: "未连接",
        modeTipsHtml: "<p>\n" +
            "<el-textsize=\"small\">智能模式：</el-text>\n" +
            "成功连接至Wi-Fi后,如果此设备的热点未被其他设备连接,将在30秒后自动关闭热点;如果此设备与AP断开连接,将在5秒后自动开启热点\n" +
            "</p>\n" +
            "<p>\n" +
            "<el-textsize=\"small\">热点+终端共存模式：</el-text>\n" +
            "方便使用，但是影响稳定性，增加功耗\n" +
            "</p>\n" +
            "<p>\n" +
            "<el-textsize=\"small\">单热点模式缺点：</el-text>\n" +
            "无网络\n" +
            "</p>",
        enabled: "已开启",
        disabled: "未开启",

        stationInfo: "终端(STA)",
        hotspotInfo: "自发热点(AP)",
        signalStrength: "信号强度",
        gateway: "网关",
        netmask: "掩码",
        primaryDNS: "首选DNS",
        backupDNS: "备用DNS",
        IPmode: "IP分配模式",
        DNSmode: "DNS模式",
        internalAddress: "内网地址",

        autoIP: "自动 (DHCP)",
        staticIP: "静态IP",
        autoDNS: "自动 (使用网关)",
        staticDNS: "静态DNS",
        APauto_STA: "智能热点+常开终端 (AP+STA)",
        APonly: "仅开启热点 (AP)",
        AP_STA: "常开热点+常开终端 (AP+STA)",

        connectionSuccess: "连接成功",
        enterAPName: "请输入AP名",
        debuggerNotConnected: "调试器未连接",
    },

    widget: {
        editGrid: '编辑网格',
        editCell: '编辑单元',
        loopWidget: '循环小部件',
        loopWidgetDesc: '用于命令序列的容器。',
        addGrid: '添加到网格',
        dataViewer: '数据显示器',
        dataViewerDesc: '显示来自UART的原始文本数据。',
        exportSettings: '导出设置',
        importSettings: '导入设置',
        resetToDefault: '重置',
        gridItemName: '组件名称',
        dropHere: '在此处放置',
        run: '运行',
        loop: '循环',
        delay: '延迟',
        addCommand: '添加命令',
        loopInterval: '循环间隔',
        uartViewOnce: 'UART视图组件只能添加一次。'
    },

    common: {
        debuggerConnected: '调试器已连接',
        ok: '好的'
    },

    navbar: {
        navigationSidebar: '导航侧栏',
        getSomeFries: '走，去码头整点薯条',
    },
}