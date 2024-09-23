export default {
    emoji: {
        flag: "🇫🇷",
    },
    disconnected: "Déconnecté",
    connected: "Connecté",
    connecting: "Connexion..",

    ws: {
        disconnected: "Déconnecté",
        connected: "Connecté",
        connecting: "Connexion..",
    },

    page: {
        home: "Accueil",
        wifi: "Wi-Fi",
        about: "À propos",
        uart: "Uart",
        feedback: "Feedback",
        close: "Fermer",
        update: "Mise à jour",
        fullscreen: "Plein écran",
        windowed: "Fenêtré",
    },

    uart: {
        port: "Port",
        startCommunication: "Démarrer la communication",
        stopCommunication: "Arrêter la communication",
        commonlyUsed: "Fréquemment utilisé",
        baudrate: "Taux de Baud",
        customBaud: "Baud",
        use: "Utiliser",
        actual: "Actuel",
        dataBits: "Bits de Données",
        stopBits: "Bits d'Arrêt",
        parity: "Parité",
        parityNone: "Aucune",
        parityOdd: "Impair(Odd)",
        parityEven: "Pair(Even)",
        flowControl: "Contrôle de Flux",
        send: "Envoyer",
        clear: "Effacer",
        clearTooltip: "Ne supprime que la zone d'affichage, peut être restaurée en actualisant.",
        updateTooltip: "Synchroniser avec le cache + filtrer",
        autoUpdateTooltip: "Arrête uniquement le rafraîchissement de la zone d'affichage ; l'arrière-plan continue de recevoir des données.",
        receive: "Recevoir",

        displayOptions: "Options d'Affichage",
        display: "Affichage",
        show: "Afficher",
        text: "Texte",
        timestamp: "Horodatage",
        enable: "Activer",
        lineWrap: "Retour à la Ligne",
        highlight: "Surligner",

        frameBreakStrategy: "Stratégie de Coupure de Trame",
        priority: "Priorité",
        rule: "Règle",
        ruleTips:
            "<p>Délai d'expiration=-1 : Désactiver la coupure de trame par délai d'expiration</p>" +
            "<p>Délai d'expiration=0 : Coupure immédiate, toutes données reçues sont considérées complètes</p>" +
            "<p>Match après coupure : Scénario typique \\n</p>" +
            "<p>Match avant coupure : Pour des scénarios avec en-têtes de trame spécifiques</p>" +
            "<p>Coupure de trame par octets fixes : Utile pour le transfert de grandes quantités de données, par exemple, couper la trame tous les 1024 octets pour faciliter la visualisation des données</p>",
        value: "Valeur",
        timeout: "Timeout",
        match: "Match",
        byte: "Byte",
        begin: "b",
        end: "b",

        other: "Autres",
        decodeAnsiEscapeCodes: "Décode Échappement ANSI",
        ansiTooltips:
            "<p>Les codes d'échappement ANSI ont de nombreuses utilisations pour les terminaux et le texte, comme changer les couleurs du texte, entre autres effets.</p>" +
            "<p>\n  En savoir plus ->\n  " +
            "<a target=\"_blank\" href=\"https://en.wikipedia.org/wiki/ANSI_escape_code\">\n" +
            "https://en.wikipedia.org/wiki/ANSI_escape_code\n  </a>\n</p>",
        filter: "Filtrer",
        textAndEscape: "Texte;supporte\\n\\x",
        autoUpdateNewData: "Auto-update nouvelles données",
        updateFrequency: "Délais rafraîchissement des Données (ms)",
        updateFrequencyTooltip: "Augmenter l'intervalle peut réduire l'utilisation des ressources CPU.",

        addHeader: "Ajouter un En-tête",
        addFooter: "Ajouter un Pied de page",

        passthrough: "Passage Direct",
        proxy: "Proxy",
        serverPort: "Port Serveur",
        connectedClient: "Client Connecté",
        refresh: "Rafraîchir",
        interface: "Interface",
        noClientConnected: "Aucun Client Connecté",

        import: "Importer",
        export: "Exporter",
        reset: "Réinitialiser",
        resetTooltip: "Prend effet après le rafraîchissement de la page.",
        saveToLocal: "Enregistrer Localement",
        saveToLocalTooltip: "S'il existe plusieurs pages, elles se chevaucheront mutuellement.",
        add: "Ajouter",
        edit: "Éditer",
        drag: "Glisser",
        ipChangeAlert: "Le changement d'adresse IP entraînera la perte de la configuration.",

        layout: "Disposition",
        landscape: "Paysage",
        portrait: "Portrait",
        responsive: "Résponsive",
        configPannel: "Configuration",
        displayPannel: "Données",
        macroPannel: "Envoie Rapide",
        autoScrollToBottom: "Auto Scroll",
        clearScreen: "Effacer",
        autoUpdate: "Auto Update",
        tempDisplayTooltip: "es données qui ne respectent pas les règles de rupture de trame (par exemple : non expirées) s'affichent temporairement en temps réel dans cette zone. Au-delà de 8192 octets, une rupture de trame est automatique.",
        loopSend: "Envoi en Boucle",
        loopSendTooltip: "La fréquence réelle est influencée par le taux de rafraîchissement de l'interface. Pour plus de précision, vous pouvez essayer de désactiver 'l'actualisation automatique'.",
        sendFormat: "Format d'Envoi",
        cachedFrame: "Cache",
        format: "Format",
    }

};