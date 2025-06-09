export default {
    emoji: {
        flag: "🇺🇸",
    },
    disconnected: "Disconnected",
    connected: "Connected",
    connecting: "Connecting",
    use: "use",
    author: "author",
    studioYunSi: "Yunsi Studio",
    authorEmail: "Author email",
    TencentQQGroup: "QQ Group",
    Discord: "Discord",
    BiliBili: "BiliBili",

    suggestion: "suggestion",
    feature: "feature",
    version: "Version",
    releaseTime: "Release Time",
    credit: "Credit",
    aboutWebHost: "About the Web Host Application",
    aboutDebugger: "About the Debugger",
    officialWebsite: "Official Website",
    email: "Email",
    note: "Note",
    welcomeMessage: "Welcome to reach out anytime",
    serialNumber: "Serial Number",

    ws: {
        disconnected: "Disconnected",
        connected: "Connected",
        connecting: "Connecting",
    },

    page: {
        home: "Home",
        wifi: "Wi-Fi",
        about: "About",
        uart: "Uart",
        at: "AT Command",
        feedback: "Feedback",
        close: "Close",
        update: "Update",
        fullscreen: "Fullscreen",
        windowed: "Windowed"
    },

    uart: {
        port: "Port",
        startCommunication: "Start Communication",
        stopCommunication: "Stop Communication",
        commonlyUsed: "Common",
        baudrate: "Baud Rate",
        customBaud: "Custom Baud",
        use: "Use",
        actual: "Actual",
        dataBits: "Data Bits",
        stopBits: "Stop Bits",
        parity: "Parity",
        parityNone: "None",
        parityOdd: "Odd",
        parityEven: "Even",
        flowControl: "Flow Control",
        send: "Send",
        clear: "Clear",
        clearTooltip: "Only clears the display area, can be restored with refresh.",
        updateTooltip: "Sync with cache + filter",
        autoUpdateTooltip: "Only stop refreshing the display area; the background continues to receive data.",
        receive: "Receive",

        displayOptions: "Display Options",
        display: "Display",
        show: "Show",
        text: "Text",
        timestamp: "Timestamp",
        enable: "Enable",
        lineWrap: "Line Wrap",
        highlight: "Highlight",

        frameBreakStrategy: "Frame Break Strategy",
        priority: "Priority",
        rule: "Rule",
        ruleTips:
            "<p>Timeout=-1: Disable timeout frame break</p>" +
            "<p>Timeout=0: Immediate break, any received data is considered complete</p>" +
            "<p>Match after break: Typical \\n scenario</p>" +
            "<p>Match before break: For scenarios with special frame headers</p>" +
            "<p>Fixed byte frame break: Useful for large data transfer, e.g., break frame every 1024 bytes for easy data viewing</p>",
        value: "Value",
        timeout: "Timeout",
        match: "Match",
        byte: "Byte",
        begin: "b",
        end: "b",

        other: "Other",
        decodeAnsiEscapeCodes: "Decode ANSI Escape Codes",
        ansiTooltips:
            "<p>ANSI escape codes have many uses for terminals and text, such as changing text colors, among other effects.</p>\n" +
            "<p>\n  Learn more ->\n  <a target=\"_blank\" href=\"https://en.wikipedia.org/wiki/ANSI_escape_code\">" +
            "https://en.wikipedia.org/wiki/ANSI_escape_code\n  </a></p>",
        filter: "Filter",
        textAndEscape: "Text with \\n\\x support",
        autoUpdateNewData: "Auto-refresh new data",
        updateFrequency: "Data Display Update Interval (ms)",
        updateFrequencyTooltip: "Increasing the interval can reduce CPU usage.",

        addHeader: "Add Header",
        addFooter: "Add Footer",

        passthrough: "Passthrough",
        proxy: "Proxy",
        serverPort: "Server Port",
        connectedClient: "Connected Client",
        refresh: "Refresh",
        interface: "Interface",
        noClientConnected: "No Client Connected",

        import: "Import",
        export: "Export",
        reset: "Reset",
        resetTooltip: "Takes effect after refreshing the page.",
        saveToLocal: "Save to Local",
        saveToLocalTooltip: "If multiple pages exist, they will overwrite each other.",
        add: "Add",
        edit: "Edit",
        drag: "Drag",
        ipChangeAlert: "Changing the IP address will cause the configuration to be lost.",

        layout: "Layout",
        landscape: "Landscape",
        portrait: "Portrait",
        responsive: "Responsive",
        configPannel: "Config",
        displayPannel: "Display",
        macroPannel: "Quick Send",
        autoScrollToBottom: "Auto Scroll",
        clearScreen: "Clear",
        autoUpdate: "Auto Update",
        tempDisplayTooltip: "Data that does not meet the frame-break rules (e.g., not timed out) is temporarily displayed in real-time in this area. If it exceeds 8192 bytes, it will automatically break frames.",
        loopSend: "Loop Send",
        loopSendTooltip: "The actual frequency is affected by the interface refresh rate. For more accuracy, you can try turning off 'auto-refresh'.",
        sendFormat: "Send Format",
        cachedFrame: "Cached",
        format: "Format",
    },

    wifi: {
        settings: "Settings",
        setFailed: "Settings failed to set",
        setSuccess: "Settings saved",
        connection: "Connection",
        scanning: "Scanning",
        scan: "Scan",
        scanDone: "Scan done",
        warnWifiName: "Enter Wi-Fi Name",
        password: "Password",
        connectInfoHTML: "Changing Wi-Fi will disconnect this interface from the passthrough device if not connected through its hotspot.",
        connect: "Connect",
        mode: "Mode",
        save: "Save",
        station: "Station",
        intelligent: "Smart",
        APOnly: "Hotspot Only",
        disconnected: "Disconnected",
        modeTipsHtml: "<p>\n" +
            "<el-textsize=\"small\">Smart Mode:</el-text>\n" +
            "After connecting to Wi-Fi, the hotspot will turn off automatically after 30 seconds if no device is connected. It will turn on after 5 seconds if disconnected from AP.\n" +
            "</p>\n" +
            "<p>\n" +
            "<el-textsize=\"small\">Coexistence Mode:</el-text>\n" +
            "Convenient but impacts stability and increases power consumption.\n" +
            "</p>\n" +
            "<p>\n" +
            "<el-textsize=\"small\">Hotspot-Only Mode Drawback:</el-text>\n" +
            "No network connection.\n" +
            "</p>",
        enabled: "Enabled",
        disabled: "Disabled",

        stationInfo: "Terminal (STA)",
        hotspotInfo: "Hotspot (AP)",
        signalStrength: "Signal Strength",
        gateway: "Gateway",
        netmask: "Netmask",
        primaryDNS: "Primary DNS",
        backupDNS: "Backup DNS",
        IPmode: "IP Allocation Mode",
        DNSmode: "DNS Mode",
        internalAddress: "Internal Address",

        autoIP: "Automatic (DHCP)",
        staticIP: "Static IP",
        autoDNS: "Automatic (Use Gateway)",
        staticDNS: "Static DNS",
        APauto_STA: "Smart Hotspot + Persistent Terminal (AP+STA)",
        APonly: "Hotspot Only (AP)",
        AP_STA: "Persistent Hotspot + Persistent Terminal (AP+STA)",

        connectionSuccess: "Connection Successful",
        enterAPName: "Entre the AP name",
        debuggerNotConnected: "Debugger not connected",
    },

    widget: {
        editGrid: 'Edit Grid',
        editCell: 'Edit Cell',
        loopWidget: 'Loop Widget',
        loopWidgetDesc: 'Container for command sequences.',
        addGrid: 'Add to Grid',
        dataViewer: 'Data Viewer',
        dataViewerDesc: 'Displays raw text data from UART.',
        exportSettings: 'Export Settings',
        importSettings: 'Import Settings',
        resetToDefault: 'Reset to Default',
        gridItemName: 'Widget name',
        dropHere: 'Drop here',
        run: 'Run',
        loop: 'Loop',
        delay: 'Delay',
        addCommand: 'Add Command',
        loopInterval: 'Loop Interval',
        uartViewOnce: 'UART View Widget can only be added once.'
    },

    common: {
        debuggerConnected: 'Debugger connected',
        ok: 'OK'
    },

    navbar: {
        navigationSidebar: 'Navigation Sidebar',
        getSomeFries: "Let's go to the dock and get some fries",
    },
};