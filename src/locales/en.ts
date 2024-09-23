export default {
    emoji: {
        flag: "🇺🇸",
    },
    disconnected: "Disconnected",
    connected: "Connected",
    connecting: "Connecting",

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
    }

};